import { Color } from "./Color"
import { Vec2D } from "./Vec2D"

export class MinimapMarker extends Vec2D {

    constructor(x: number, y: number, public color: Color) {
        super(x, y)
    }
}
