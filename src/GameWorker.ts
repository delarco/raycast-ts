import { InitializeMessage, WorkerMessage, WorkerMessageType } from "./events/WorkerMessage"
import { Size } from "./interfaces/Size"
import { Clock } from "./utils/Clock"
import { Renderer } from "./interfaces/Renderer"
import { Scene } from "./models/Scene"
import { RaycastScene } from "./scenes/RaycastScene"
import { GameConfig } from "./GameConfig"
import { OffscreenImageDataRenderer2D } from "./renderers/OffscreenImageDataRenderer2D"

export class GameWorker {

  private _config: GameConfig
  private renderer: Renderer
  private _resolution: Size
  private clock = new Clock()
  private currentScene: Scene

  public get config() { return this._config }
  public get resolution() { return this._resolution }

  constructor(private worker: Worker) { }

  public async initialize(message: InitializeMessage): Promise<void> {

    console.log("[Worker] initialize");

    this._config = message.config

    this.renderer = new OffscreenImageDataRenderer2D(message.offscreen)

    this._resolution = {
      width: message.offscreen.width,
      height: message.offscreen.height
    }

    console.log(`[Worker] resolution ${this.resolution.width}x${this.resolution.height}`)

    this.currentScene = new RaycastScene(this)

    // show loading
    await this.currentScene.preload()
    this.currentScene.init()
    // hide loading

    requestAnimationFrame((time) => this.render(time))
  }

  private render(time: number) {

    this.clock.tick(time)
    this.renderer.clear()
    this.currentScene.update(this.clock)
    this.currentScene.draw(this.renderer)

    this.renderer.flush()

    requestAnimationFrame((time) => this.render(time))
  }
}

const worker: Worker = self as any

// game worker instance
let gameWorker = new GameWorker(worker)

// wireup events
worker.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {

  switch (event.data.type) {
    case WorkerMessageType.INITIALIZE:
      gameWorker.initialize(event.data as InitializeMessage)
      break
  }
})
