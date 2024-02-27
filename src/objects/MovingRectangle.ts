import { Color } from "../models/Color";
import { Clock } from "../utils/Clock";
import { Rectangle } from "./Rectangle";

export class MovingRectangle extends Rectangle {

    constructor(x: number, y: number, width: number, height: number, color = Color.BLUE) {
        super(x, y, width, height, color)
        this.velocity = 15
    }

    public override update(clock: Clock): void {

        this.x += this.velocity * clock.deltaTime
        this.y += this.velocity * clock.deltaTime

        if (this.x <= 0 || this.x + this.width >= this.scene.gameInstance.resolution.width) {
            this.velocity *= -1
        }

        if (this.y <= 0 || this.y + this.height >= this.scene.gameInstance.resolution.height) {
            this.velocity *= -1
        }
    }
}
