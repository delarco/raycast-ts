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
}
