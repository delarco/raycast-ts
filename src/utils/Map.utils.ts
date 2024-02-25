import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";
import { Map } from "../models/Map";
import { TextureUtils } from "./Texture.utils";
import { Tile } from "../models/Tile";
import { Vec2D } from "../models/Vec2D";
import { Texture } from "../models/Texture";

export class MapUtils {

    public static async fromIntArray(array: Array<number>, size: Size, wallColors?: { [key: number]: Color }): Promise<Map> {

        const map = new Map()
        map.size = size

        const defaultWallTexture = TextureUtils.fromColor(Color.WHITE)
        let wallTextures: { [key: number]: Texture } = {}

        if (wallColors) {
            for (const key of Object.keys(wallColors).map(k => Number(k))) {
                wallTextures[key] = TextureUtils.fromColor(wallColors[key])
            }
        }

        for (let y = 0; y < map.size.width; y++) {
            for (let x = 0; x < map.size.width; x++) {

                const n = array[y * size.width + x]
                let wallTexture = defaultWallTexture

                if (n > 0 && n in wallTextures) {
                    wallTexture = wallTextures[n]
                }

                map.tiles.push(new Tile(
                    new Vec2D(x, y),
                    n > 0,
                    n > 0,
                    wallTexture,
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

                if (ct.length === 4) {
                    const n = Number("0x" + ct.substring(1, 7))
                    let r = (n & 0xF00) >> 8
                    r = (r << 4) + r
                    let g = (n & 0x0F0) << 4 >> 8
                    g = (g << 4) + g
                    let b = (n & 0x00F)
                    b = (b << 4) + b

                    return new Color(r, g, b)
                }
                else {

                    const n = Number("0x" + ct.substring(1, 7))
                    const r = (n & 0xFF0000) >> 16
                    const g = (n & 0x00FF00) << 8 >> 16
                    const b = (n & 0x0000FF)
                    return new Color(r, g, b)
                }
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

                        if (jsonMinimap instanceof Color) {
                            minimap = jsonMinimap
                        }
                        else {
                            minimap = Color.INDIGO
                        }

                        let collision = jsonTile.solid

                        if("collision" in jsonTile) collision = jsonTile.collision

                        const tile = new Tile(
                            jsonTile.position,
                            jsonTile.solid,
                            collision,
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