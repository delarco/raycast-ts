import { Renderer } from "../interfaces/Renderer";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject";

export class Rectangle extends GameObject {

    constructor(x: number, y: number, width: number, height: number, private color = Color.BLUE) {
        super()

        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    public override draw(renderer: Renderer): void {

        renderer.drawRect(
            this.x,
            this.y,
            this.width,
            this.height,
            this.color
        )
    }
}
