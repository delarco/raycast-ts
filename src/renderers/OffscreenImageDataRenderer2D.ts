import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";
import { Texture } from "../models/Texture";

export class OffscreenImageDataRenderer2D implements Renderer {

    private context: OffscreenCanvasRenderingContext2D
    private _resolution: Size
    private imageData: ImageData
    private colorBuffer: Uint8ClampedArray
    private depthBuffer: Array<number>

    public get resolution() { return this._resolution }

    public skipClear: boolean = false

    constructor(offscreenCanvas: OffscreenCanvas) {

        const context = offscreenCanvas.getContext("2d", { willReadFrequently: true })

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
        this.depthBuffer = [...new Array(this.resolution.width * this.resolution.height)].map(() => Infinity)
    }

    clear(): void {

        for (let i = 0; i < this.colorBuffer.length; i++) {
            this.colorBuffer[i] = 0
        }

        for (let i = 0; i < this.depthBuffer.length; i++) {

            this.depthBuffer[i] = Infinity;
        }
    }

    flush(): void {

        this.context.putImageData(this.imageData, 0, 0);
    }

    drawPixel(x: number, y: number, color: Color, shade: number = 1.0): void {

        [x, y] = [~~x, ~~y];

        if (x < 0
            || y < 0
            || x >= this.resolution.width
            || y >= this.resolution.height) return;

        const index = 4 * (y * this.resolution.width + x)

        this.colorBuffer[index + 0] = color.r * shade
        this.colorBuffer[index + 1] = color.g * shade
        this.colorBuffer[index + 2] = color.b * shade
        this.colorBuffer[index + 3] = color.a
    }

    drawPixelDepth(x: number, y: number, z: number, color: Color, shade: number = 1.0): void {

        [x, y] = [~~x, ~~y]

        if (x < 0
            || y < 0
            || x >= this.resolution.width
            || y >= this.resolution.height) return

        const depthIndex = y * this.resolution.width + x

        if (z > this.depthBuffer[depthIndex]) return
        this.depthBuffer[depthIndex] = z

        const index = 4 * (y * this.resolution.width + x)

        this.colorBuffer[index + 0] = color.r * shade
        this.colorBuffer[index + 1] = color.g * shade
        this.colorBuffer[index + 2] = color.b * shade
        this.colorBuffer[index + 3] = color.a
    }

    drawLine(): void {
        throw new Error("Method not implemented.");
    }

    drawRect(x: number, y: number, w: number, h: number, color: Color): void {

        for (let px = 0; px < w; px++) {
            for (let py = 0; py < h; py++) {
                this.drawPixel(x + px, y + py, color)
            }
        }
    }

    drawTexture(x: number, y: number, texture: Texture): void {

        // TODO: implement scale
        for (let tx = 0; tx < texture.width; tx++) {
            for (let ty = 0; ty < texture.height; ty++) {
                const pixelColor = texture.getPixelColor(tx, ty)
                if (pixelColor.a < 50) continue
                this.drawPixel(x + tx, y + ty, pixelColor)
            }
        }
    }
}
