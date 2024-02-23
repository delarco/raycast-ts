import { Renderer } from "../interfaces/Renderer";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject";
import { Texture } from "../models/Texture";
import { Vec2D } from "../models/Vec2D";

export class Rectangle extends GameObject {

    constructor(x: number, y: number, width: number, height: number, private texture: Texture | Color = Color.WHITE) {
        super()

        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    public override draw(renderer: Renderer): void {

        let pixelColor: (tx: number, ty: number) => Color

        if (this.texture instanceof Color) {
            pixelColor = () => this.texture as Color
        }
        else {
            pixelColor = (tx: number, ty: number) => (this.texture as Texture).sampleColor(tx, ty)
        }

        const step = new Vec2D(1.0 / this.width, 1.0 / this.height)

        for (let x = 0; x < this.width; x++) {

            for (let y = 0; y < this.height; y++) {

                const color = pixelColor(x * step.x, y * step.y)
                if (color.a < 255) continue
                renderer.drawPixel(this.x + x, this.y + y, color)
            }
        }
    }
}
