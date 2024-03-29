import { Color } from "../models/Color"
import { Size } from "../interfaces/Size"
import { Texture } from "../models/Texture"

export interface Renderer {

    resolution: Size
    skipClear: boolean

    clear(color?: Color): void

    flush(): void

    drawPixel(x: number, y: number, color: Color, shade?: number): void

    drawPixelDepth(x: number, y: number, z: number, color: Color, shade?: number): void

    drawLine(x1: number, y1: number, x2: number, y2: number, color: Color): void

    drawRect(x1: number, y1: number, x2: number, y2: number, color: Color): void

    drawTexture(x: number, y: number, texture: Texture, scale?: number): void
}
