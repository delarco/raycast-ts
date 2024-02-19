import { Position } from "../interfaces/Position";
import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";
import { Clock } from "../utils/Clock";
import { Scene } from "./Scene";

export class GameObject implements Position, Size {

    private static idCounter = 1

    private _scene: Scene

    public id: number
    public name: string
    public angle: number
    public visible: boolean

    public x: number
    public y: number
    public z: number
    public width: number
    public height: number

    public velocity: Position

    public get scene() { return this._scene }

    public set scene(sceneObject: Scene) {

        if (this._scene) throw new Error("Scene already set for object")
        this._scene = sceneObject
    }

    constructor() {
        this.id = GameObject.idCounter++
    }

    public init(): void { }

    public draw(renderer: Renderer): void { }

    public update(clock: Clock) { }
}
