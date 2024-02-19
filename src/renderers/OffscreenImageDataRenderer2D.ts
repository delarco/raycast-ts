import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";

export class OffscreenImageDataRenderer2D implements Renderer {

    private context: OffscreenCanvasRenderingContext2D
    private _resolution: Size
    private imageData: ImageData
    private colorBuffer: Uint8ClampedArray

    public get resolution() { return this._resolution }

    constructor(private offscreenCanvas: OffscreenCanvas) {

        const context = offscreenCanvas.getContext("2d")

        if (!context) {
            throw new Error("Can't get context")
        }

        this.context = context

        this._resolution = {
            width: offscreenCanvas.width,
            height: offscreenCanvas.height
        }

        this.imageData = this.context.getImageData(0, 0, this.resolution.width, this.resolution.height)
        this.colorBuffer = this.imageData.data
    }

    clear(color: Color = Color.INDIGO): void {

        for (let index = 0; index < this.colorBuffer.length; index += 4) {

            this.colorBuffer[index + 0] = color.r
            this.colorBuffer[index + 1] = color.g
            this.colorBuffer[index + 2] = color.b
            this.colorBuffer[index + 3] = color.a
        }
    }

    flush(): void {

        this.context.putImageData(this.imageData, 0, 0);
    }

    drawPixel(x: number, y: number, color: Color): void {

        [x, y] = [~~x, ~~y];

        if (x < 0
            || y < 0
            || x >= this.resolution.width
            || y >= this.resolution.height) return;

        const index = 4 * (y * this.resolution.width + x)

        this.colorBuffer[index + 0] = color.r
        this.colorBuffer[index + 1] = color.g
        this.colorBuffer[index + 2] = color.b
        this.colorBuffer[index + 3] = color.a
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: Color): void {
        throw new Error("Method not implemented.");
    }

    drawRect(x: number, y: number, w: number, h: number, color: Color): void {

        for (let px = 0; px < w; px++) {
            for (let py = 0; py < h; py++) {
                this.drawPixel(x + px, y + py, color)
            }
        }
    }
}
