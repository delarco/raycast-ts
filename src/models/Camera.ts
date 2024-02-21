import { GameObject } from "./GameObject";

export class Camera extends GameObject {

    constructor(x: number, y: number, angle: number = 0) {
        super()
        this.x = x
        this.y = y
        this.angle = angle
    }
}
