import { Color } from "../models/Color";
import { Clock } from "../utils/Clock";
import { Rectangle } from "./Rectangle";

export class MovingRectangle extends Rectangle {

    constructor(x: number, y: number, width: number, height: number, color = Color.BLUE) {
        super(x, y, width, height, color)
        this.velocity = { x: 10, y: 10, z: 0 }
    }

    public override update(clock: Clock): void {

        this.x += this.velocity.x * clock.deltaTime
        this.y += this.velocity.y * clock.deltaTime

        // if (this.x <= 0 || this.x + this.width >= this.resolution.width) {
        //   this.vel.x *= -1
        // }

        // if (this.box.y <= 0 || this.box.y + this.box.height >= this.resolution.height) {
        //   this.vel.y *= -1
        // }

    }
}
