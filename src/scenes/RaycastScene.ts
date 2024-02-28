import { Renderer } from "../interfaces/Renderer"
import { Scene } from "../models/Scene"
import { Map } from "../models/Map"
import { Minimap } from "../objects/Minimap"
import { Color } from "../models/Color"
import { Camera } from "../models/Camera"
import { Vec2D } from "../models/Vec2D"
import { Side } from "../enums/Side"
import { TileHit } from "../interfaces/TileHit"
import { VectorUtils } from "../utils/Vector.utils"
import { Size } from "../interfaces/Size"
import { Clock } from "../utils/Clock"
import { KEYS, KeyboardInput } from "../input/Keyboard.input"
import { Sprite } from "../objects/Sprite"
import { Game } from "../Game"
import { Projectile } from "../objects/Projectile"

export class RaycastScene extends Scene {

    protected map: Map = new Map()
    protected camera: Camera = new Camera(0, 0, 0)
    protected keyboard: KeyboardInput

    protected ambientLight = 1.0

    private useRecharging = false
    private useCooldown = 1000

    protected distanceShade = (distance: number): number => 1.0 - distance * 0.1

    constructor(public gameInstance: Game) {
        super(gameInstance)
        this.keyboard = this.gameInstance.keyboardInput
        gameInstance.renderer.skipClear = true
    }

    public setMap(map: Map) {

        this.map = map

        const spawn = map.getRandomSpawnLocation()
        this.camera = new Camera(spawn.x, spawn.y)
        for (const sprite of map.sprites) this.add.object(sprite)
    }

    public preload(): void {

    }

    public init(): void {

        const minimap = new Minimap(this.map, this.camera)
        this.add.object(minimap)
    }

    public override update(clock: Clock): void {

        this.updateCamera(clock)
        this.checkSpriteCollision()
        this.checkProjectileCollisionOrOutOfMap()
        this.checkUseCommand()
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
            this.camera.fixAngle()
        }

        if (this.keyboard.key(KEYS.ARROW_RIGHT) || this.keyboard.key(KEYS.KEY_E)) {

            this.camera.angle += this.camera.angularVelocity * clock.deltaTime
            this.camera.fixAngle()
        }
    }

    private updateCameraPosition(clock: Clock): void {

        if (!this.keyboard) return

        const move = new Vec2D(
            Math.cos(this.camera.angle) * this.camera.velocity * clock.deltaTime,
            Math.sin(this.camera.angle) * this.camera.velocity * clock.deltaTime
        )

        const strafe = new Vec2D(
            Math.cos(this.camera.angle + Math.PI / 2) * this.camera.velocity * clock.deltaTime,
            Math.sin(this.camera.angle + Math.PI / 2) * this.camera.velocity * clock.deltaTime
        )

        let newPosition = this.camera.position.clone()

        if (this.keyboard.key(KEYS.ARROW_UP) || this.keyboard.key(KEYS.KEY_W)) {

            newPosition = VectorUtils.add(newPosition, move)
        }

        if (this.keyboard.key(KEYS.ARROW_DOWN) || this.keyboard.key(KEYS.KEY_S)) {

            newPosition = VectorUtils.sub(newPosition, move)
        }

        if (this.keyboard.key(KEYS.KEY_A)) {

            newPosition = VectorUtils.sub(newPosition, strafe)
        }

        if (this.keyboard.key(KEYS.KEY_D)) {

            newPosition = VectorUtils.add(newPosition, strafe)
        }

        const tileX = this.map.getTile(newPosition.x, this.camera.y)
        const tileY = this.map.getTile(this.camera.x, newPosition.y)

        if (!tileX?.collision && newPosition.x > 0 && newPosition.x < this.map.width) this.camera.x = newPosition.x
        if (!tileY?.collision && newPosition.y > 0 && newPosition.y < this.map.height) this.camera.y = newPosition.y
    }

    private checkSpriteCollision(): void {

        const margin = 1

        for (let sprite of this.objects.filter(obj => obj.visible && obj instanceof Sprite && obj.onCollision)) {

            if (sprite.x >= this.camera.x - margin
                && sprite.x <= this.camera.x + margin
                && sprite.y >= this.camera.y - margin
                && sprite.y <= this.camera.y + margin) {
                (<Sprite>sprite).onCollision!(this.camera)
            }
        }
    }

    private checkProjectileCollisionOrOutOfMap(): void {

        for (let object of this.objects.filter(obj => obj.visible && obj instanceof Projectile)) {

            const projectile = object as Projectile

            const despawn = () => {
                projectile.visible = false
                this.objects = this.objects.filter(obj => obj !== projectile)
            }

            const tile = this.map.getTile(projectile.x, projectile.y)

            if (tile && tile.collision) {
                despawn()
                if (tile.onProjectileHit) tile.onProjectileHit()
                if (projectile.onCollision) projectile.onCollision(tile)
            }

            if (projectile.x <= 0
                || projectile.y <= 0
                || projectile.x >= this.map.size.width
                || projectile.y >= this.map.height
            ) despawn()

            for (const object of this.objects.filter(obj => obj.visible && obj !== projectile && obj instanceof Sprite && (obj.onCollision || obj.onProjectileHit))) {

                const sprite = object as Sprite
                const margin = sprite.width / 2

                if (sprite.x >= projectile.x
                    && sprite.x <= projectile.x + margin
                    && sprite.y >= projectile.y - margin
                    && sprite.y <= projectile.y + margin) {

                    despawn()
                    if (sprite.onProjectileHit) sprite.onProjectileHit()
                    if (projectile.onCollision) projectile.onCollision(sprite)
                }
            }
        }
    }

    private checkUseCommand(): void {

        if (!this.keyboard.key(KEYS.ENTER) || this.useRecharging) return

        const usePosition = new Vec2D(
            this.camera.x + Math.cos(this.camera.angle) * 1.5,
            this.camera.y + Math.sin(this.camera.angle) * 1.5,
        )

        const tile = this.map.getTile(usePosition.x, usePosition.y)

        if (tile && tile.onUse) {
            this.useRecharging = true
            tile.onUse()

            setTimeout(() => this.useRecharging = false, this.useCooldown)
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
                    const tile = this.map.getTile(tilePos.x, tilePos.y)

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

                    if (!pixelColor || pixelColor.a < 255) {

                        if (y <= halfResolution.height) {
                            pixelColor = this.getSkyboxColor(rayAngle, y)
                        }
                        else {
                            const planeZ = halfResolution.height / (y - halfResolution.height)
                            pixelColor = this.getFloorColor(rayDirection, rayAngle, planeZ)
                            shade = this.distanceShade(rayLength)
                        }
                    }
                    else {

                        shade = this.distanceShade(rayLength)
                    }

                }

                // floor
                else {

                    const planeZ = halfResolution.height / (y - halfResolution.height)
                    pixelColor = this.getFloorColor(rayDirection, rayAngle, planeZ)
                    shade = this.distanceShade(planeZ)
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

                        const shade = this.ambientLight * this.distanceShade(distanceToObject)

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

        if (this.map.skybox instanceof Color) return this.map.skybox

        let tx = rayAngle * (1 / (2 * Math.PI)) % 1
        if (tx < 0) tx = 1 + tx
        const ty = y / (this.gameInstance.resolution.height - 1)
        return this.map.skybox.sampleColor(tx, ty)
    }

    private getFloorColor(rayDirection: Vec2D, rayAngle: number, planeZ: number): Color {

        let pixelColor: Color | null = null

        const planePoint = VectorUtils.add(this.camera.position, VectorUtils.mul(rayDirection, planeZ * 2.0 / Math.cos(rayAngle - this.camera.angle)))
        const tilePos = VectorUtils.int(planePoint)
        const tex = new Vec2D(planePoint.x - tilePos.x, planePoint.y - tilePos.y)
        const tile = this.map.getTile(tilePos.x, tilePos.y)

        if (tile?.detail[Side.BOTTOM]) {

            const detailColor = tile.detail[Side.BOTTOM].sampleColor(tex.x, tex.y)
            if (detailColor?.a == 255) pixelColor = detailColor
        }

        if (!pixelColor && tile?.texture[Side.BOTTOM]) {

            pixelColor = tile.texture[Side.BOTTOM].sampleColor(tex.x, tex.y)
        }

        if (!pixelColor) {

            if (this.map.floor instanceof Color) {

                pixelColor = this.map.floor
            }
            else {

                pixelColor = this.map.floor.sampleColor(tex.x, tex.y)
            }
        }

        return pixelColor
    }
}
