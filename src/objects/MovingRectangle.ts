import { Color } from "../models/Color";
import { Clock } from "../utils/Clock";
import { Rectangle } from "./Rectangle";

export class MovingRectangle extends Rectangle {

    constructor(x: number, y: number, width: number, height: number, color = Color.BLUE) {
        super(x, y, width, height, color)
        this.velocity = { x: 120, y: 15, z: 0 }
    }

    public override update(clock: Clock): void {

        this.x += this.velocity.x * clock.deltaTime
        this.y += this.velocity.y * clock.deltaTime

        if (this.x <= 0 || this.x + this.width >= this.scene.gameInstance.resolution.width) {
            this.velocity.x *= -1
        }

        if (this.y <= 0 || this.y + this.height >= this.scene.gameInstance.resolution.height) {
            this.velocity.y *= -1
        }

    }
}
