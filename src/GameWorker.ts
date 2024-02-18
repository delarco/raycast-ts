import { InitializeMessage, WorkerMessage, WorkerMessageType } from "./events/WorkerMessage"
import { Size } from "./interfaces/Size"
import { Position } from "./interfaces/Position"
import { Clock } from "./utils/Clock"

class GameWorker {

  private context: OffscreenCanvasRenderingContext2D | null
  private resolution: Size
  private clock = new Clock()

  private box: Position & Size = { x: 0, y: 0, z: 0, width: 25, height: 25 }
  private vel: Position = { x: 10, y: 10, z: 0 }

  constructor(private worker: Worker) { }

  public initialize(message: InitializeMessage) {

    console.log("[Worker] initialize");

    this.context = message.offscreen.getContext("2d")

    if (!this.context) {
      throw new Error("Can't get context")
    }

    this.resolution = {
      width: message.offscreen.width,
      height: message.offscreen.height
    }

    console.log(`[Worker] resolution ${this.resolution.width}x${this.resolution.height}`)

    requestAnimationFrame((time) => this.render(time))
  }

  private render(time: number) {

    this.clock.tick(time)

    this.context!.clearRect(0, 0, this.resolution.width, this.resolution.height)
    this.context!.fillStyle = "#F00"
    this.context!.fillRect(this.box.x, this.box.y, this.box.width, this.box.height)

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
