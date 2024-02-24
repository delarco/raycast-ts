import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";
import { Map } from "../models/Map";
import { TextureUtils } from "./Texture.utils";
import { Tile } from "../models/Tile";
import { Vec2D } from "../models/Vec2D";
import { Texture } from "../models/Texture";

export class MapUtils {

    public static fromIntArray(array: Array<number>, size: Size): Map {

        const map = new Map()
        map.size = size

        for (let y = 0; y < map.size.width; y++) {
            for (let x = 0; x < map.size.width; x++) {
                map.tiles.push(new Tile(
                    new Vec2D(x, y),
                    array[y * size.width + x] === 1,
                    TextureUtils.fromColor(Color.WHITE),
                    null
                ))
            }
        }

        return map
    }

    // TODO: implement toJson
    public static toJson(map: Map): object {

        return {
            name: "Map Name",
            size: map.size,
            skybox: "#AAAAFF",
            floor: "#AAFFAA",
            spawn: map.spawn,
            tiles: map.tiles.map(tile => {
                return {
                    position: tile.position,
                    solid: tile.solid,
                    texture: tile.solid ? "#EEE" : null,
                    details: null,
                    minimap: "#AAF"
                }
            })
        }
    }

    public static async fromJson(path: string): Promise<Map> {

        const colorOrTexture = (ct: string | null): Color | string | null => {

            if (!ct) return null

            // regex for ARGB: ^#(?:[0-9a-fA-F]{3,4}){1,2}$
            if (/^#(?:[0-9a-fA-F]{3}){1,2}$$/.test(ct)) {

                const n = Number("0x" + ct.substring(1, 7))
                const r = (n & 0xFF0000) >> 16
                const g = (n & 0x00FF00) << 8 >> 16
                const b = (n & 0x0000FF)

                return new Color(r, g, b)
            }

            return ct
        }

        return new Promise<Map>((resolve, reject) => {

            fetch(path)
                .then(data => data.json())
                // TODO: validade json
                .then(jsonMap => {

                    const map = new Map()
                    map.size = jsonMap.size
                    map.spawn = jsonMap.spawn

                    // TODO: implement texture load for map
                    const sky = colorOrTexture(jsonMap.sky)
                    if (sky instanceof Color) map.skybox = sky

                    const floor = colorOrTexture(jsonMap.floor)
                    if (floor instanceof Color) map.floor = floor

                    for (const jsonTile of jsonMap.tiles) {

                        let jsonTexture = colorOrTexture(jsonTile.texture)
                        let texture: Texture | null = null

                        if (texture) {

                            if (jsonTexture instanceof Color) {
                                texture = TextureUtils.fromColor(texture)
                            }
                            else {
                                // TODO: implement texture load for map
                                texture = null
                            }
                        }

                        let jsonMinimap = colorOrTexture(jsonTile.minimap)
                        let minimap: Color | null = null

                        if(jsonMinimap instanceof Color) {
                            minimap = jsonMinimap
                        }
                        else {
                            minimap = Color.INDIGO
                        }

                        const tile = new Tile(
                            jsonTile.position,
                            jsonTile.solid,
                            texture,
                            null,
                            minimap
                        )

                        map.tiles.push(tile)
                    }

                    resolve(map)
                })
                .catch(error => reject(error))
        })
    }
}