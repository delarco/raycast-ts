import { Renderer } from "../interfaces/Renderer";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject";
import { Map } from "../models/Map";

export class Minimap extends GameObject {

    private tileSize: number
    private tileColor = new Color(100, 100, 100)

    constructor(x: number, y: number, width: number, height: number, private map: Map) {
        super()

        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.tileSize = Math.floor(this.width / this.map.size.width)
    }

    public override draw(renderer: Renderer): void {

        for (const row of new Array(this.map.size.height).keys()) {
            for (const col of new Array(this.map.size.width).keys()) {

                const tile = this.map.getTile(col, row)

                if(tile === 1) {

                    renderer.drawRect(
                        this.x + col *  this.tileSize,
                        this.y + row *  this.tileSize,
                        this.tileSize,
                        this.tileSize,
                        this.tileColor
                    )
                }
            }
        }
    }
}
