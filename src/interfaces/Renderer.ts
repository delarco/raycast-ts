import { Color } from "../models/Color"
import { Size } from "../interfaces/Size"

export interface Renderer {

    resolution: Size

    clear(color?: Color): void

    drawPixel(x: number, y: number, color: Color): void

    drawLine(x1: number, y1: number, x2: number, y2: number, color: Color): void

    drawRect(x1: number, y1: number, x2: number, y2: number, color: Color): void
}
