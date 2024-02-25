import { GameObject } from "./GameObject";

export class Camera extends GameObject {

    constructor(
        x: number,
        y: number,
        angle: number = 0,
        velocity: number = 2.2,
        angularVelocity: number = 2.5
    ) {
        super()
        this.x = x
        this.y = y
        this.angle = angle
        this.velocity = velocity
        this.angularVelocity = angularVelocity
    }

    public fixAngle() {

        if (this.angle < 0) {
            this.angle = (2 * Math.PI) - this.angle
        }
        else if (this.angle > 2 * Math.PI) {
            this.angle -= 2 * Math.PI
        }
    }
}
