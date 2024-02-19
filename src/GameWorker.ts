import { InitializeMessage, WorkerMessage, WorkerMessageType } from "./events/WorkerMessage"
import { Size } from "./interfaces/Size"
import { Clock } from "./utils/Clock"
import { OffscreenRenderer2D } from "./renderers/OffscreenRenderer2D"
import { Renderer } from "./interfaces/Renderer"
import { MovingRectangle } from "./objects/MovingRectangle"

class GameWorker {

  private renderer: Renderer
  private resolution: Size
  private clock = new Clock()

  private box: MovingRectangle

  constructor(private worker: Worker) { }

  public initialize(message: InitializeMessage) {

    console.log("[Worker] initialize");

    this.renderer = new OffscreenRenderer2D(message.offscreen)

    this.resolution = {
      width: message.offscreen.width,
      height: message.offscreen.height
    }

    console.log(`[Worker] resolution ${this.resolution.width}x${this.resolution.height}`)

    this.box = new MovingRectangle(0, 0, 25, 25)

    requestAnimationFrame((time) => this.render(time))
  }

  private render(time: number) {

    this.clock.tick(time)

    this.renderer.clear()
    this.box.update(this.clock)
    this.box.draw(this.renderer)

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
