import { Clock } from "../utils/Clock"
import { Renderer } from "../interfaces/Renderer"
import { GameObject } from "../models/GameObject"
import { Game } from "../Game"
import { SceneLoader } from "../models/SceneLoader"
import { SceneAdder } from "../models/SceneAdder"

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

        for (const gameObject of this.objects) {

            gameObject.draw(renderer)
        }
    }
}
