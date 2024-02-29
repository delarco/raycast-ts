import { Clock } from "../utils/Clock"
import { Renderer } from "../interfaces/Renderer"
import { GameObject } from "../models/GameObject"
import { Game } from "../Game"
import { SceneLoader } from "../models/SceneLoader"
import { SceneAdder } from "../models/SceneAdder"
import { Vec2D } from "./Vec2D"

export class Scene {

    public objects: Array<GameObject>
    public readonly load: SceneLoader
    public readonly add: SceneAdder

    constructor(public gameInstance: Game) {

        this.objects = []
        this.load = new SceneLoader(this)
        this.add = new SceneAdder(this)
    }

    public preload(): void { }

    public init(): void { }

    public update(clock: Clock): void {

        for (const gameObject of this.objects) {

            gameObject.update(clock)
        }
    }

    public draw(renderer: Renderer) {

        for (const gameObject of this.objects.filter(object => object.visible)) {

            gameObject.draw(renderer)
        }
    }

    public getObject(name: string): GameObject | null {

        return this.objects.find(obj => obj.name === name) || null
    }

    public onMouseClick(position: Vec2D, button: number): void {
        position; button
    }

    public onMouseMove(position: Vec2D): void {
        position
    }
}
