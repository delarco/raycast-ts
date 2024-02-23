import { Renderer } from "../interfaces/Renderer";
import { Scene } from "../models/Scene"
import { Map } from "../models/Map";
import { Minimap } from "../objects/Minimap";
import { Color } from "../models/Color";
import { Camera } from "../models/Camera";
import { Vec2D } from "../models/Vec2D";
import { Side } from "../enums/Side";
import { TileHit } from "../interfaces/TileHit";
import { VectorUtils } from "../utils/Vector.utils";
import { Size } from "../interfaces/Size";
import { Clock } from "../utils/Clock";
import { KEYS, KeyboardInput } from "../input/Keyboard.input";
import { Texture } from "../models/Texture";
import { Sprite } from "../models/Sprite";
import { Game } from "../Game";

export class RaycastScene extends Scene {

    protected map: Map = new Map()
    protected camera: Camera = new Camera(0, 0, 0)
    protected keyboard: KeyboardInput | null = null

    protected ambientLight = 1.0
    protected skybox: Texture | Color = Color.DARK_BLUE
    protected floor: Texture | Color = Color.DARK_GREEN

    protected sprites: Array<Sprite> = []

    protected wallDistanceShade = (distance: number): number => 1.0 - distance * 0.1

    constructor(public gameInstance: Game) {
        super(gameInstance)
        this.keyboard = this.gameInstance.keyboardInput
    }

    public preload(): void {

    }

    public init(): void {

        const minimap = new Minimap(this.map, this.camera)
        this.add(minimap)
    }

    public override update(clock: Clock): void {

        this.updateCamera(clock)
        super.update(clock)
    }

    protected updateCamera(clock: Clock): void {

        this.updateCameraRotation(clock)
        this.updateCameraPosition(clock)
    }

    private updateCameraRotation(clock: Clock): void {

        if (!this.keyboard) return

        if (this.keyboard.key(KEYS.ARROW_LEFT) || this.keyboard.key(KEYS.KEY_Q)) {

            this.camera.angle -= this.camera.angularVelocity * clock.deltaTime
        }

        if (this.keyboard.key(KEYS.ARROW_RIGHT) || this.keyboard.key(KEYS.KEY_E)) {

            this.camera.angle += this.camera.angularVelocity * clock.deltaTime
        }
    }

    private updateCameraPosition(clock: Clock): void {

        if (!this.keyboard) return

        const mov = new Vec2D(
            Math.cos(this.camera.angle) * this.camera.velocity * clock.deltaTime,
            Math.sin(this.camera.angle) * this.camera.velocity * clock.deltaTime
        )

        const strafe = new Vec2D(
            Math.cos(this.camera.angle + Math.PI / 2) * this.camera.velocity * clock.deltaTime,
            Math.sin(this.camera.angle + Math.PI / 2) * this.camera.velocity * clock.deltaTime
        )

        if (this.keyboard.key(KEYS.ARROW_UP) || this.keyboard.key(KEYS.KEY_W)) {

            this.camera.position = VectorUtils.add(this.camera.position, mov)
        }

        if (this.keyboard.key(KEYS.ARROW_DOWN) || this.keyboard.key(KEYS.KEY_S)) {

            this.camera.position = VectorUtils.sub(this.camera.position, mov)
        }

        if (this.keyboard.key(KEYS.KEY_A)) {

            this.camera.position = VectorUtils.sub(this.camera.position, strafe)
        }

        if (this.keyboard.key(KEYS.KEY_D)) {

            this.camera.position = VectorUtils.add(this.camera.position, strafe)
        }
    }

    public override draw(renderer: Renderer): void {

        // raycast draw
        this.drawMap(renderer)

        // draw sprites
        this.drawSprites(renderer)

        // draw objects
        super.draw(renderer)
    }

    private drawMap(renderer: Renderer): void {

        const resolution = this.gameInstance.resolution
        const fieldOfView = this.gameInstance.config.fieldOfView
        const halfResolution: Size = { width: ~~(resolution.width / 2), height: ~~(resolution.height / 2) }

        // scan horizontal lines
        for (let x = 0; x < resolution.width; x++) {

            const rayAngle = (this.camera.angle - (fieldOfView / 2.0)) + (x / resolution.width) * fieldOfView
            const rayDirection = new Vec2D(Math.cos(rayAngle), Math.sin(rayAngle))

            let rayLength = Infinity;
            let hit = this.castRay(this.camera.position, rayDirection)
            let ray: Vec2D | null = null

            if (hit) {

                ray = new Vec2D(
                    hit.position.x - this.camera.position.x,
                    hit.position.y - this.camera.position.y,
                )

                rayLength = ray.mag() * Math.cos(rayAngle - this.camera.angle)
            }

            const ceiling = (resolution.height / 2.0) - (resolution.height / rayLength)
            const floor = resolution.height - ceiling
            const wallHeight = floor - ceiling

            // draw y
            for (let y = 0; y < resolution.height; y++) {

                let pixelColor: Color | null = null
                let shade = 1.0

                // ceiling
                if (y <= Math.trunc(ceiling)) {

                    const planeZ = halfResolution.height / (halfResolution.height - y)
                    const planePoint = VectorUtils.add(this.camera.position, VectorUtils.mul(rayDirection, planeZ * 2.0 / Math.cos(rayAngle - this.camera.angle)))
                    const tilePos = VectorUtils.int(planePoint)
                    const tex = new Vec2D(planePoint.x - tilePos.x, planePoint.y - tilePos.y)
                    const tile = this.map.getTile(tilePos.y, tilePos.x)

                    if (tile?.detail[Side.TOP]) {

                        const detailColor = tile.detail[Side.TOP].sampleColor(tex.x, tex.y)
                        if (detailColor?.a == 255) pixelColor = detailColor
                    }

                    if (!pixelColor && tile?.texture && tile.texture[Side.TOP]) {

                        pixelColor = tile.texture[Side.TOP].sampleColor(tex.x, tex.y)
                    }

                    if (!pixelColor) pixelColor = this.getSkyboxColor(rayAngle, y)
                }

                // walls
                else if (y > Math.trunc(ceiling) && y <= Math.trunc(floor)) {

                    let ty = (y - ceiling) / wallHeight
                    pixelColor = hit!.tile.texture[hit!.side!]!.sampleColor(hit!.tx!, ty)

                    if (hit!.tile.detail[hit!.side!]) {

                        const detailColor = hit!.tile.detail![hit!.side!]?.sampleColor(hit!.tx!, ty)
                        if (detailColor?.a == 255) pixelColor = detailColor
                    }

                    shade = this.wallDistanceShade(rayLength)
                }

                // floor
                else {

                    const planeZ = halfResolution.height / (y - halfResolution.height)
                    const planePoint = VectorUtils.add(this.camera.position, VectorUtils.mul(rayDirection, planeZ * 2.0 / Math.cos(rayAngle - this.camera.angle)))
                    const tilePos = VectorUtils.int(planePoint)
                    const tex = new Vec2D(planePoint.x - tilePos.x, planePoint.y - tilePos.y)
                    const tile = this.map.getTile(tilePos.y, tilePos.x)

                    if (tile?.detail[Side.BOTTOM]) {

                        const detailColor = tile.detail[Side.BOTTOM].sampleColor(tex.x, tex.y)
                        if (detailColor?.a == 255) pixelColor = detailColor
                    }

                    if (!pixelColor && tile?.texture[Side.BOTTOM]) {

                        pixelColor = tile.texture[Side.BOTTOM].sampleColor(tex.x, tex.y)
                    }

                    if (!pixelColor) {

                        if (this.floor instanceof Color) {

                            pixelColor = this.floor
                        }
                        else {

                            pixelColor = this.floor.sampleColor(tex.x, tex.y)
                        }

                    }
                }

                if (!pixelColor) pixelColor = Color.BLACK
                shade *= this.ambientLight

                if (!ray) {

                    renderer.drawPixel(x, y, pixelColor, shade)
                }
                else {

                    renderer.drawPixelDepth(x, y, ray.mag(), pixelColor, shade)
                }
            }
        }
    }

    private drawSprites(renderer: Renderer): void {

        for (let sprite of this.objects) {

            if (!sprite.visible || !(sprite instanceof Sprite)) continue;

            const resolution = this.gameInstance.resolution
            const object: Vec2D = VectorUtils.sub(sprite.position, this.camera.position)
            const distanceToObject = object.mag()

            let objectAngle = Math.atan2(object.y, object.x) - this.camera.angle
            if (objectAngle < -3.14159) objectAngle += 2.0 * 3.14159
            if (objectAngle > 3.14159) objectAngle -= 2.0 * 3.14159

            const inPlayerFOV = Math.abs(objectAngle) < (this.gameInstance.config.fieldOfView + (1.0 / distanceToObject)) / 2.0

            if (inPlayerFOV && distanceToObject >= 0.5) {

                const floorPoint = new Vec2D(
                    (0.5 * ((objectAngle / (this.gameInstance.config.fieldOfView * 0.5))) + 0.5) * resolution.width,
                    (resolution.height / 2.0) + (resolution.height / distanceToObject) / Math.cos(objectAngle / 2.0)
                )

                const objectSize: Size = {
                    width: sprite.width,
                    height: sprite.height
                }

                objectSize.width *= 2.0 * resolution.height
                objectSize.height *= 2.0 * resolution.height

                objectSize.width /= distanceToObject
                objectSize.height /= distanceToObject

                const objectTopLeft = new Vec2D(
                    floorPoint.x - objectSize.width / 2.0,
                    floorPoint.y - objectSize.height
                )

                for (let y = 0; y < objectSize.height; y++) {

                    for (let x = 0; x < objectSize.width; x++) {

                        const sampleX = x / objectSize.width
                        const sampleY = y / objectSize.height

                        const pixelColor = sprite.sampleColor(sampleX, sampleY)

                        const screenPos = new Vec2D(
                            Math.trunc(objectTopLeft.x + x),
                            Math.trunc(objectTopLeft.y + y)
                        )

                        const shade = this.ambientLight * this.wallDistanceShade(distanceToObject)

                        if (screenPos.x >= 0 && screenPos.x < resolution.width && screenPos.y >= 0 && screenPos.y < resolution.height && pixelColor.a == 255) {

                            renderer.drawPixelDepth(screenPos.x, screenPos.y, distanceToObject, pixelColor, shade)
                        }
                    }
                }
            }
        }
    }

    private castRay(origin: Vec2D, direction: Vec2D): TileHit | null {

        let hit: TileHit | null = null

        const rayDelta = new Vec2D(
            Math.sqrt(1 + (direction.y / direction.x) * (direction.y / direction.x)),
            Math.sqrt(1 + (direction.x / direction.y) * (direction.x / direction.y))
        )

        let mapCheck = VectorUtils.int(origin.clone())
        let sideDistance = new Vec2D()
        let stepDistance = new Vec2D()

        if (direction.x < 0) {
            stepDistance.x = -1
            sideDistance.x = (origin.x - mapCheck.x) * rayDelta.x
        }
        else {
            stepDistance.x = 1
            sideDistance.x = (mapCheck.x + 1.0 - origin.x) * rayDelta.x
        }

        if (direction.y < 0) {
            stepDistance.y = -1
            sideDistance.y = (origin.y - mapCheck.y) * rayDelta.y
        }
        else {
            stepDistance.y = 1
            sideDistance.y = (mapCheck.y + 1.0 - origin.y) * rayDelta.y
        }

        const intersection = new Vec2D()
        const hitTile = new Vec2D()
        let maxDistance = 100.0 // TODO: should be map width or height
        let distance = 0.0
        let tileFound = false

        while (!tileFound && distance < maxDistance) {
            if (sideDistance.x < sideDistance.y) {
                sideDistance.x += rayDelta.x
                mapCheck.x += stepDistance.x
            }
            else {
                sideDistance.y += rayDelta.y
                mapCheck.y += stepDistance.y
            }

            const rayDist = new Vec2D(
                mapCheck.x - origin.x,
                mapCheck.y - origin.y
            )

            distance = rayDist.mag()

            if (this.map.isLocationSolid(mapCheck.x, mapCheck.y)) {

                [hitTile.x, hitTile.y] = [mapCheck.x, mapCheck.y]
                tileFound = true

                hit = {
                    tile: this.map.tiles[mapCheck.y * this.map.size.width + mapCheck.x],
                    side: null,
                    position: new Vec2D(),
                    tx: null,
                }

                // find accurate Hit Location
                const m = direction.y / direction.x

                if (origin.y <= mapCheck.y) {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y
                        intersection.x = mapCheck.x
                        hit.tx = intersection.y - Math.floor(intersection.y)
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y
                        intersection.x = mapCheck.x + 1
                        hit.tx = 1.0 - (intersection.y - Math.floor(intersection.y))
                    }
                    else {
                        hit.side = Side.NORTH
                        intersection.y = mapCheck.y
                        intersection.x = (mapCheck.y - origin.y) / m + origin.x
                        hit.tx = 1.0 - (intersection.x - Math.floor(intersection.x))
                    }

                    if (intersection.y < mapCheck.y) {
                        hit.side = Side.NORTH
                        intersection.y = mapCheck.y
                        intersection.x = (mapCheck.y - origin.y) / m + origin.x
                        hit.tx = 1.0 - (intersection.x - Math.floor(intersection.x))
                    }
                }
                else if (origin.y >= mapCheck.y + 1) {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y
                        intersection.x = mapCheck.x
                        hit.tx = intersection.y - Math.floor(intersection.y)
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y
                        intersection.x = mapCheck.x + 1
                        hit.tx = 1.0 - (intersection.y - Math.floor(intersection.y))
                    }
                    else {
                        hit.side = Side.SOUTH
                        intersection.y = mapCheck.y + 1
                        intersection.x = ((mapCheck.y + 1) - origin.y) / m + origin.x
                        hit.tx = intersection.x - Math.floor(intersection.x)
                    }

                    if (intersection.y > (mapCheck.y + 1)) {
                        hit.side = Side.SOUTH
                        intersection.y = mapCheck.y + 1
                        intersection.x = ((mapCheck.y + 1) - origin.y) / m + origin.x
                        hit.tx = intersection.x - Math.floor(intersection.x)
                    }
                }
                else {
                    if (origin.x <= mapCheck.x) {
                        hit.side = Side.WEST
                        intersection.y = m * (mapCheck.x - origin.x) + origin.y
                        intersection.x = mapCheck.x
                        hit.tx = intersection.y - Math.floor(intersection.y)
                    }
                    else if (origin.x >= (mapCheck.x + 1)) {
                        hit.side = Side.EAST
                        intersection.y = m * ((mapCheck.x + 1) - origin.x) + origin.y
                        intersection.x = mapCheck.x + 1
                        hit.tx = 1.0 - (intersection.y - Math.floor(intersection.y))
                    }
                }

                hit.position = intersection
            }
        }

        return hit
    }

    private getSkyboxColor(rayAngle: number, y: number): Color {

        if (this.skybox instanceof Color) return this.skybox

        let tx = rayAngle * (1 / (2 * Math.PI)) % 1
        if (tx < 0) tx = 1 + tx
        const ty = y / (this.gameInstance.resolution.height - 1)
        return this.skybox.sampleColor(tx, ty)
    }
}
