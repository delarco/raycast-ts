import { Size } from "./interfaces/Size";
import { Color } from "./models/Color";

export class GameConfig {

    private _element: HTMLElement
    private _resolution: Size
    private _viewPort: Size
    private _backgroundColor: Color
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
     * Canvas color.
     */
    public get backgroundColor() {
        return this._backgroundColor
    }

    /**
     * Debug flag.
     */
    public get debug() {
        return this._debug
    }

    constructor(
        element: HTMLElement,
        resolution: Size = { width: 320, height: 240 },
        viewPort: Size = { width: 800, height: 600 },
        backgroundColor = Color.INDIGO,
        debug = true
    ) {
        this._element = element
        this._resolution = resolution
        this._viewPort = viewPort
        this._backgroundColor = backgroundColor
        this._debug = debug
    }
}
