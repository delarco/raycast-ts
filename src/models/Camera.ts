import { GameObject } from "./GameObject";

export class Camera extends GameObject {

    constructor(public x: number, public y: number) {
        super()
    }
}
