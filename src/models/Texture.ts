import { Size } from "../interfaces/Size";
import { Color } from "./Color";

export class Texture {

    private static idCounter = 1

    private _id: number
    private _name: string
    private _size: Size
    private _data: Array<Color>

    public get id() { return this._id }
    public get name() { return this._name }
    public get width() { return this._size.width }
    public get height() { return this._size.height }

    constructor(
        name: string,
        width: number,
        height: number,
        data?: Array<Color>
    ) {

        this._id = Texture.idCounter++
        this._name = name
        this._size = { width: width, height: height }
        this._data = data ? data : [...new Array(width * height).keys()].map(() => new Color())
    }

    public drawPixel(x: number, y: number, color: Color): void {

        let index = (y * this._size.width + x);
        this._data[index] = color;
    }

    public getPixelColor(x: number, y: number): Color {

        return this._data[y * this._size.width + x];
    }

    public sampleColor(x: number, y: number): Color {

        if (x < 0) x = 1 - x;
        if (y < 0) y = 1 - y;

        const sx = Math.min(Math.trunc((x * this._size.width)), this._size.width - 1);
        const sy = Math.min(Math.trunc((y * this._size.height)), this._size.height - 1);
        return this.getPixelColor(sx, sy);
    }

    public static fromColor(color: Color, name: string = `COLOR_${color.cssHex}`): Texture {

        return new Texture(name, 1, 1, [color])
    }
}
