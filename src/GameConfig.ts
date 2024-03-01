import { Size } from "./interfaces/Size";
import { Color } from "./models/Color";
import { GameWorkerConfig } from "./interfaces/GameWorkerConfig"

export class GameConfig {

    private _element: HTMLElement | null
    private _resolution: Size
    private _viewPort: Size
    private _fieldOfView: number
    private _unitSize: number
    private _backgroundColor: Color
    private _mouseSensitivity: number
    private _debug: boolean

    /**
     * Game HTML element.
     */
    public get element() {
        return this._element
    }

    /**
     * Canvas resolution.
     */
    public get resolution() {
        return this._resolution
    }

    /**
     * Canvas size on screen.
     */
    public get viewPort() {
        return this._viewPort
    }

    /**
     * Field of view getter.
     */
    public get fieldOfView() {
        return this._fieldOfView
    }

    /**
     * Field of view setter.
     */
    public set fieldOfView(value: number) {
        this._fieldOfView = value
    }

    /**
     * Field of view.
     */
    public get unitSize() {
        return this._unitSize
    }

    /**
     * Canvas color.
     */
    public get backgroundColor() {
        return this._backgroundColor
    }

    /**
     * Mouse sensitivity.
     */
    public get mouseSensitivity() {
        return this._mouseSensitivity
    }

    /**
     * Debug flag.
     */
    public get debug() {
        return this._debug
    }

    constructor(
        element: HTMLElement | null = null,
        resolution: Size = { width: 320, height: 240 },
        viewPort: Size = { width: 800, height: 600 },
        fieldOfView: number = Math.PI / 3,
        unitSize: number = 32,
        backgroundColor = Color.INDIGO,
        mouseSensitivity = 0.15,
        debug = true
    ) {
        this._element = element
        this._resolution = resolution
        this._viewPort = viewPort
        this._fieldOfView = fieldOfView
        this._unitSize = unitSize
        this._backgroundColor = backgroundColor
        this._mouseSensitivity = mouseSensitivity
        this._debug = debug
    }

    /**
     * Workaround (because HTMLElement can't be cloned)
     * @returns a GameConfig object without HTMLElement
     */
    public configToWorker(): GameWorkerConfig {
        return {
            resolution: this.resolution,
            viewPort: this.viewPort,
            fieldOfView: this.fieldOfView,
            unitSize: this.unitSize,
            backgroundColor: this.backgroundColor,
            debug: this.debug
        }
    }
}
