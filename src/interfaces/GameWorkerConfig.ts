import { Color } from "../models/Color"
import { Size } from "./Size"

export interface GameWorkerConfig {

    resolution: Size
    viewPort: Size
    fieldOfView: number
    unitSize: number
    backgroundColor: Color
    debug: boolean
}
