import { Renderer } from "../interfaces/Renderer";
import { Camera } from "../models/Camera";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject";
import { Map } from "../models/Map";
import { Vec2D } from "../models/Vec2D";
import { MinimapMarker } from "../models/MinimapMarker";

export class Minimap extends GameObject {

    private tileSize: number = 0
    public markers: Array<MinimapMarker> = []

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
        this.drawMarkers(renderer)
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
                        tile.minimap
                    )
                }
            }
        }
    }

    private drawCamera(renderer: Renderer): void {

        const cameraSize = 4
        const halfCameraSize = 2

        const cameraPos = new Vec2D(
            this.x + this.camera.x * this.tileSize,
            this.y + this.camera.y * this.tileSize,
        )

        renderer.drawRect(
            cameraPos.x - halfCameraSize,
            cameraPos.y - halfCameraSize,
            cameraSize,
            cameraSize,
            Color.RED
        )

        const pointerDest = new Vec2D(
            cameraPos.x + Math.cos(this.camera.angle) * cameraSize,
            cameraPos.y + Math.sin(this.camera.angle) * cameraSize,
        )

        renderer.drawPixel(
            pointerDest.x,
            pointerDest.y,
            Color.RED
        )
    }

    private drawMarkers(renderer: Renderer): void {

        const markerSize = 2
        const halfMarkerSize = 1

        for (const marker of this.markers) {

            const pos = new Vec2D(
                this.x + marker.x * this.tileSize,
                this.y + marker.y * this.tileSize,
            )

            renderer.drawRect(
                pos.x - halfMarkerSize,
                pos.y - halfMarkerSize,
                markerSize,
                markerSize,
                marker.color
            )
        }
    }
}
