import { Position } from "../interfaces/Position";
import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";

export class GameObject implements Position, Size {

    id: number
    name: string
    angle: number
    visible: boolean

    x: number
    y: number
    z: number
    width: number
    height: number

    public draw(renderer: Renderer): void { }
}
