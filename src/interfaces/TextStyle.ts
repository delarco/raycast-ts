import { Color } from "../models/Color"

export interface TextStyle {

    color?: Color
    fontSize?: number
    fontFamily?: string
    bold?: boolean
    borderWidth?: number | null
    borderColor?: Color | null
}
