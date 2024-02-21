import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";
import { Map } from "../models/Map";
import { TextureUtils } from "./Texture.utils";
import { Tile } from "../models/Tile";
import { Vec2D } from "../models/Vec2D";

export class MapUtils {

    public static fromIntArray(array: Array<number>, size: Size): Map {

        const map = new Map()
        map.size = size
        map.tiles = array.map(n => new Tile(
            new Vec2D(),
            n === 1,
            TextureUtils.fromColor(Color.WHITE),
            null
        ))
        return map
    }
}