import { Renderer } from "../interfaces/Renderer";
import { Scene } from "../models/Scene"
import { Map } from "../models/Map";
import { Minimap } from "../objects/Minimap";
import { MovingRectangle } from "../objects/MovingRectangle";
import { Color } from "../models/Color";
import { Camera } from "../models/Camera";
import { Vec2D } from "../models/Vec2D";
import { MapUtils } from "../utils/Map.utils";
import { Side } from "../enums/Side";
import { TileHit } from "../interfaces/TileHit";
import { VectorUtils } from "../utils/Vector.utils";
import { Size } from "../interfaces/Size";
import { Clock } from "../utils/Clock";
import { KEYS, KeyboardInput } from "../input/Keyboard.input";

export class RaycastScene extends Scene {

    private map: Map
    private camera: Camera
    private keyboard: KeyboardInput

    private angularVelocity = 2.5

    public async preload(): Promise<void> {

        // load map
        this.map = MapUtils.fromIntArray(
            [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 1, 1, 1, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 1, 1, 1, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 1, 1, 1, 0, 1,
                1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            ],
            { width: 10, height: 10 }
        )
    }

    public init(): void {

        this.keyboard = this.gameInstance.keyboardInput
        
        this.camera = new Camera(3.5, 3.5, 0.7)

        const minimap = new Minimap(this.map, this.camera)

        this.add(minimap)
    }

    public override update(clock: Clock): void {

        if (this.keyboard.key(KEYS.ARROW_LEFT) || this.keyboard.key(KEYS.KEY_Q)) {

            this.camera.angle -= this.angularVelocity * clock.deltaTime;
        }

        if (this.keyboard.key(KEYS.ARROW_RIGHT) || this.keyboard.key(KEYS.KEY_E)) {

            this.camera.angle += this.angularVelocity * clock.deltaTime;
        }

        super.update(clock)
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

            ////////////////////////////
            // DEBUG //////////////////
            // console.log(rayDirection)
            // const minimapSize = Math.floor(this.gameInstance.resolution.height)
            // const tileSize = Math.floor(minimapSize / this.map.size.width)
            // renderer.drawPixel(
            //     this.camera.x * tileSize + rayDirection.x * 40,
            //     this.camera.y * tileSize + rayDirection.y * 40,
            //     Color.BLACK
            // )
            ////////////////////////////
            ////////////////////////////

            let rayLength = Infinity;
            let hit = this.castRay(this.camera.position, rayDirection)

            if (hit) {

                const ray = new Vec2D(
                    hit.position.x - this.camera.position.x,
                    hit.position.y - this.camera.position.y,
                )

                rayLength = ray.mag() * Math.cos(rayAngle - this.camera.angle)

                ///////////////////////////
                // DEBUG //////////////////
                // const rayPos = new Vec2D(
                //     hit.position.x * tileSize,
                //     hit.position.y * tileSize,
                // )
                // renderer.drawPixel(
                //     rayPos.x,
                //     rayPos.y,
                //     Color.RED
                // )
                ///////////////////////////
                ///////////////////////////
            }

            const ceiling = (resolution.height / 2.0) - (resolution.height / rayLength)
            const floor = resolution.height - ceiling
            const wallHeight = floor - ceiling

            // draw y
            for (let y = 0; y < resolution.height; y++) {

                if (y <= Math.trunc(ceiling)) {

                    renderer.drawPixel(x, y, Color.BLUE)
                }
                else if (y > Math.trunc(ceiling) && y <= Math.trunc(floor)) {

                }
                else {

                    renderer.drawPixel(x, y, Color.RED)
                }
            }
        }
    }

    private drawSprites(renderer: Renderer): void {

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
}
