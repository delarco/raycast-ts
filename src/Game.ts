import { GameConfig } from "./GameConfig"
import { FpsMessage, InitializeMessage, KeyboardMessage, WorkerMessage, WorkerMessageType } from "./events/WorkerMessage"

export class Game {

    private canvas: HTMLCanvasElement

    public onFpsChange: ((fps: number) => void) | null = null

    constructor(config: GameConfig) {

        if (config.element instanceof HTMLCanvasElement) {
            this.canvas = config.element
        }
        else if (config.element) {
            this.canvas = document.createElement("canvas")
            config.element.appendChild(this.canvas)
        }
        else {
            this.canvas = document.createElement("canvas")
            window.document.appendChild(this.canvas)
        }

        // set canvas sizes
        this.canvas.width = config.resolution.width
        this.canvas.height = config.resolution.height
        this.canvas.style.width = `${config.viewPort.width}px`
        this.canvas.style.height = `${config.viewPort.height}px`
        this.canvas.style.imageRendering = "pixelated"

        // debug border
        if (config.debug) {
            this.canvas.style.border = "2px solid black"
        }

        // setup and initialize worker
        const offscreen = this.canvas.transferControlToOffscreen()
        const worker = new Worker(new URL("./GameWorker", import.meta.url), { type: "module" })
        worker.postMessage(new InitializeMessage(offscreen, config.configToWorker()), [offscreen])
        worker.onmessage = (event: MessageEvent<WorkerMessage>) => {

            switch (event.data.type) {
                case WorkerMessageType.FPS:
                    if (this.onFpsChange) this.onFpsChange((event.data as FpsMessage).fps)
                    break
            }
        }

        // wireup keyboard events
        document.addEventListener("keydown", ev => worker.postMessage(new KeyboardMessage(WorkerMessageType.KEY_DOWN, ev.code)))
        document.addEventListener("keyup", ev => worker.postMessage(new KeyboardMessage(WorkerMessageType.KEY_UP, ev.code)))
    }
}
