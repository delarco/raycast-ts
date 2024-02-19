import { Position } from "../interfaces/Position";
import { Renderer } from "../interfaces/Renderer";
import { Camera } from "../models/Camera";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject";
import { Map } from "../models/Map";

export class Minimap extends GameObject {

    private tileSize: number
    private tileColor = new Color(100, 100, 100)

    constructor(x: number, y: number, width: number, height: number, private map: Map, private camera: Camera) {
        super()

        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.tileSize = Math.floor(this.width / this.map.size.width)
    }

    public override draw(renderer: Renderer): void {

        this.drawTiles(renderer)
        this.drawCamera(renderer)
    }

    private drawTiles(renderer: Renderer): void {

        for (const row of new Array(this.map.size.height).keys()) {
            for (const col of new Array(this.map.size.width).keys()) {

                const tile = this.map.getTile(col, row)

                if (tile === 1) {

                    renderer.drawRect(
                        this.x + col * this.tileSize,
                        this.y + row * this.tileSize,
                        this.tileSize,
                        this.tileSize,
                        this.tileColor
                    )
                }
            }
        }
    }

    private drawCamera(renderer: Renderer): void {

        const ratio: Position = {
            x: this.tileSize / this.scene.gameInstance.UNIT_SIZE,
            y: this.tileSize / this.scene.gameInstance.UNIT_SIZE,
            z: 0
        }

        const cameraSize = this.tileSize / 3

        const cameraPos: Position = {
            x: this.x + this.camera.x * ratio.x,
            y: this.y + this.camera.y * ratio.y,
            z: 0
        }

        renderer.drawRect(
            cameraPos.x,
            cameraPos.y,
            cameraSize,
            cameraSize,
            Color.GREEN
        )
    }
}
