import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";
import { Clock } from "../utils/Clock";
import { Scene } from "./Scene";
import { Vec2D } from "./Vec2D";

export class GameObject implements Size {

    private static idCounter = 1

    private _scene!: Scene
    
    public id: number
    public name: string = ""
    public angle: number = 0
    public visible: boolean = true
    
    public position: Vec2D
    public width: number = 0
    public height: number = 0

    public velocity: number = 0
    public angularVelocity: number = 0

    public get scene() { return this._scene }

    public set scene(sceneObject: Scene) {

        if (this._scene) throw new Error("Scene already set for object")
        this._scene = sceneObject
    }

    public get x() { return this.position.x }
    public set x(value: number) { this.position.x = value }

    public get y() { return this.position.y }
    public set y(value: number) { this.position.y = value }

    constructor() {
        this.id = GameObject.idCounter++
        this.position = new Vec2D()
    }

    public init(): void { }

    public draw(renderer: Renderer): void { renderer }

    public update(clock: Clock) { clock }
}
