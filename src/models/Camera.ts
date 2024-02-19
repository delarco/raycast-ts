import { GameObject } from "./GameObject";

export class Camera extends GameObject {

    constructor(x: number, y: number) {
        super()
        this.x = x
        this.y = y
    }
}
