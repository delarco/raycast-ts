import { Size } from ".."
import { GameConfig } from "./GameConfig"
import { KeyboardInput } from "./input/Keyboard.input"
import { Renderer } from "./interfaces/Renderer"
import { Scene } from "./models/Scene"
import { OffscreenImageDataRenderer2D } from "./renderers/OffscreenImageDataRenderer2D"
import { Clock } from "./utils/Clock"

export class Game {

    private _canvas: HTMLCanvasElement
    private _config: GameConfig
    private _renderer: Renderer
    private _resolution: Size
    private _clock: Clock
    private _currentScene: Scene | null = null
    private _keyboardInput: KeyboardInput

    public get config() { return this._config }
    public get resolution() { return this._resolution }
    public get keyboardInput() { return this._keyboardInput }

    public onFpsChange: ((fps: number) => void) | null = null

    constructor(config: GameConfig) {

        this._config = config

        if (config.element instanceof HTMLCanvasElement) {
            this._canvas = config.element
        }
        else if (config.element) {
            this._canvas = document.createElement("canvas")
            config.element.appendChild(this._canvas)
        }
        else {
            this._canvas = document.createElement("canvas")
            window.document.appendChild(this._canvas)
        }

        // set canvas sizes
        this._canvas.width = config.resolution.width
        this._canvas.height = config.resolution.height
        this._canvas.style.width = `${config.viewPort.width}px`
        this._canvas.style.height = `${config.viewPort.height}px`
        this._canvas.style.imageRendering = "pixelated"

        // debug border
        if (config.debug) {
            this._canvas.style.border = "2px solid black"
        }

        // create renderer
        this._renderer = new OffscreenImageDataRenderer2D(this._canvas.transferControlToOffscreen())

        this._resolution = config.resolution
        console.log(`[Worker] resolution ${this.resolution.width}x${this.resolution.height}`)

        this._keyboardInput = new KeyboardInput()
        this._clock = new Clock()

        requestAnimationFrame((time) => this.render(time))
    }

    private render(time: number) {

        this._clock.tick(time)
        this._renderer.clear()

        if (this._currentScene) {

            this._currentScene.update(this._clock)
            this._currentScene.draw(this._renderer)
        }

        this._renderer.flush()

        if (this._clock.updateFps && this.onFpsChange) this.onFpsChange(this._clock.fps)

        requestAnimationFrame((time) => this.render(time))
    }

    public async start(sceneType: typeof Scene): Promise<void> {

        this._currentScene = new sceneType(this)

        // TODO: show loading
        await this._currentScene.preload()
        this._currentScene.init()
        // TODO: hide loading
    }
}
