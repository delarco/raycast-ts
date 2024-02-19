import { Position } from "../interfaces/Position";
import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";
import { Clock } from "../utils/Clock";

export class GameObject implements Position, Size {

    private static idCounter = 1

    id: number
    name: string
    angle: number
    visible: boolean

    x: number
    y: number
    z: number
    width: number
    height: number

    velocity: Position

    constructor() {
        this.id = GameObject.idCounter++
    }

    public draw(renderer: Renderer): void { }

    public update(clock: Clock) { }
}
