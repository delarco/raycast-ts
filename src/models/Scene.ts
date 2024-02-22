import { Clock } from "../utils/Clock"
import { Renderer } from "../interfaces/Renderer"
import { GameObject } from "../models/GameObject"
import { Game } from "../Game"

export class Scene {

    protected objects: Array<GameObject>

    constructor(public gameInstance: Game) {

        this.objects = []
    }

    public async preload(): Promise<void> {

    }

    public init(): void {

    }

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

    protected add(gameObject: GameObject): void {

        gameObject.scene = this
        gameObject.init()
        this.objects.push(gameObject)
    }
}
