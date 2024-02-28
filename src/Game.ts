import { Size } from ".."
import { GameConfig } from "./GameConfig"
import { KeyboardInput } from "./input/Keyboard.input"
import { Renderer } from "./interfaces/Renderer"
import { Scene } from "./models/Scene"
import { OffscreenImageDataRenderer2D } from "./renderers/OffscreenImageDataRenderer2D"
import { Clock } from "./utils/Clock"
import { TextureUtils } from "./utils/Texture.utils"

export class Game {

    private _canvas: HTMLCanvasElement
    private _config: GameConfig
    private _renderer: Renderer
    private _resolution: Size
    private _clock: Clock
    private _currentScene: Scene | null = null
    private _keyboardInput: KeyboardInput
    private _loading: boolean = false

    public get config() { return this._config }
    public get resolution() { return this._resolution }
    public get keyboardInput() { return this._keyboardInput }
    public get currentScene() { return this._currentScene }
    public get renderer() { return this._renderer }

    public onFpsChange: ((fps: number) => void) | null = null
    public onLoadingStart: (() => void) | null = null
    public onLoadingEnd: (() => void) | null = null

    public get loading() { return this._loading }

    private set loading(value: boolean) {

        this._loading = value
        if (value && this.onLoadingStart) this.onLoadingStart()
        if (!value && this.onLoadingEnd) this.onLoadingEnd()
    }

    constructor(config: GameConfig) {

        this.loading = true
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
        TextureUtils.init(this.resolution)

        this._keyboardInput = new KeyboardInput()
        this._clock = new Clock()
        this.loading = false

        requestAnimationFrame((time) => this.render(time))
    }

    private render(time: number) {

        this._clock.tick(time)
        this._renderer.clear()

        if (this._currentScene) this._currentScene.update(this._clock)
        if (this._currentScene) this._currentScene.draw(this._renderer)
        
        this._renderer.flush()

        if (this._clock.updateFps && this.onFpsChange) this.onFpsChange(this._clock.fps)

        requestAnimationFrame((time) => this.render(time))
    }

    public async start(sceneType: typeof Scene): Promise<void> {

        this._currentScene = null
        this.loading = true

        TextureUtils.reset()
        
        const scene = new sceneType(this)
        scene.preload()
        await scene.load.load()
        scene.init()

        this._currentScene = scene
        this.loading = false
    }
}
