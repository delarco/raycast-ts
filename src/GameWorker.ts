import { InitializeMessage, WorkerMessage, WorkerMessageType } from "./events/WorkerMessage"
import { Size } from "./interfaces/Size"
import { Position } from "./interfaces/Position"
import { Clock } from "./utils/Clock"
import { OffscreenRenderer2D } from "./renderers/OffscreenRenderer2D"
import { Renderer } from "./interfaces/Renderer"
import { Color } from "./models/Color"

class GameWorker {

  private renderer: Renderer
  private resolution: Size
  private clock = new Clock()

  private box: Position & Size = { x: 0, y: 0, z: 0, width: 25, height: 25 }
  private vel: Position = { x: 10, y: 10, z: 0 }

  constructor(private worker: Worker) { }

  public initialize(message: InitializeMessage) {

    console.log("[Worker] initialize");

    this.renderer = new OffscreenRenderer2D(message.offscreen)

    this.resolution = {
      width: message.offscreen.width,
      height: message.offscreen.height
    }

    console.log(`[Worker] resolution ${this.resolution.width}x${this.resolution.height}`)

    requestAnimationFrame((time) => this.render(time))
  }

  private render(time: number) {

    this.clock.tick(time)

    this.renderer.clear()

    this.renderer.drawRect(this.box.x, this.box.y, this.box.width, this.box.height, Color.RED)

    this.box.x += this.vel.x * this.clock.deltaTime
    this.box.y += this.vel.y * this.clock.deltaTime

    if (this.box.x <= 0 || this.box.x + this.box.width >= this.resolution.width) {
      this.vel.x *= -1
    }

    if (this.box.y <= 0 || this.box.y + this.box.height >= this.resolution.height) {
      this.vel.y *= -1
    }

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
