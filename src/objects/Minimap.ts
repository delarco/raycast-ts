import { Renderer } from "../interfaces/Renderer";
import { Camera } from "../models/Camera";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject";
import { Map } from "../models/Map";
import { Vec2D } from "../models/Vec2D";

export class Minimap extends GameObject {

    private tileSize: number
    private tileColor = new Color(100, 100, 100)

    constructor(private map: Map, private camera: Camera) {
        super()
    }

    public override init(): void {

        const minimapSize = Math.floor(this.scene.gameInstance.resolution.width / 4)

        this.x = this.scene.gameInstance.resolution.width - minimapSize - 4
        this.y = 4
        this.width = minimapSize
        this.height = minimapSize
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

                if (tile?.solid) {

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

        const ratio = new Vec2D(
            this.tileSize / this.scene.gameInstance.config.unitSize,
            this.tileSize / this.scene.gameInstance.config.unitSize,
        )

        const cameraSize = this.tileSize / 3

        const cameraPos = new Vec2D(
            this.x + this.camera.x * ratio.x,
            this.y + this.camera.y * ratio.y,
        )

        renderer.drawRect(
            cameraPos.x,
            cameraPos.y,
            cameraSize,
            cameraSize,
            Color.GREEN
        )
    }
}
