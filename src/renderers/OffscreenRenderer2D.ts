import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";

export class OffscreenRenderer2D implements Renderer {

    private context: OffscreenCanvasRenderingContext2D
    private resolution: Size

    constructor(private offscreenCanvas: OffscreenCanvas) {

        const context = offscreenCanvas.getContext("2d")

        if (!context) {
            throw new Error("Can't get context")
        }

        this.context = context

        this.resolution = {
            width: offscreenCanvas.width,
            height: offscreenCanvas.height
        }
    }

    clear(color?: Color | undefined): void {
        
        if (color) {
            this.drawRect(0, 0, this.resolution.width, this.resolution.height, color)
        }
        else {
            this.context.clearRect(0, 0, this.resolution.width, this.resolution.height)
        }
    }

    drawPixel(x: number, y: number, color: Color): void {
        throw new Error("Method not implemented.");
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: Color): void {
        throw new Error("Method not implemented.");
    }

    drawRect(x: number, y: number, w: number, h: number, color: Color): void {
        this.context.fillStyle = color.cssHex
        this.context.fillRect(x, y, w, h)
    }
}
