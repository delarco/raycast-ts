import { GameConfig } from "./GameConfig"
import { InitializeMessage } from "./events/WorkerMessage"

export class Game {

    private canvas: HTMLCanvasElement

    constructor(config: GameConfig) {

        if (config.element instanceof HTMLCanvasElement) {
            this.canvas = config.element
        }
        else {
            this.canvas = document.createElement("canvas")
            this.canvas = config.element.appendChild(this.canvas)
        }

        // set canvas sizes
        this.canvas.width = config.resolution.width
        this.canvas.height = config.resolution.height
        this.canvas.style.width = `${config.viewPort.width}px`;
        this.canvas.style.height = `${config.viewPort.height}px`;
        this.canvas.style.imageRendering = "pixelated"

        // debug border
        if (config.debug) {
            this.canvas.style.border = "2px solid black"
        }

        // setup and initialize worker
        const offscreen = this.canvas.transferControlToOffscreen()
        const worker = new Worker(new URL("./GameWorker", import.meta.url), { type: "module" })
        worker.postMessage(new InitializeMessage(offscreen), [offscreen]);
    }
}
