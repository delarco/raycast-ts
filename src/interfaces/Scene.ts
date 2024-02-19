import { Clock } from "../utils/Clock"
import { Renderer } from "../interfaces/Renderer"

export interface Scene {

    preload(): Promise<void>

    init(): void

    update(clock: Clock): void

    draw(renderer: Renderer)
}
