import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";
import { Map } from "../models/Map";
import { TextureUtils } from "./Texture.utils";
import { Tile } from "../models/Tile";
import { Vec2D } from "../models/Vec2D";
import { Texture } from "../models/Texture";
import { Side, Sprite } from "../..";

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
    // public static toJson(map: Map): object {

    //     const convertTexture = (tile: Tile) => {

    //         let tex: any = {
    //             north: null,
    //             south: null,
    //             west: null,
    //             east: null,
    //             top: tile.texture[Side.TOP]?.name,
    //             bottom: tile.texture[Side.BOTTOM]?.name,
    //         }

    //         if (tile.solid) {
    //             tex.north = tile.texture[Side.NORTH]?.name
    //             tex.south = tile.texture[Side.SOUTH]?.name
    //             tex.west = tile.texture[Side.WEST]?.name
    //             tex.east = tile.texture[Side.EAST]?.name
    //         }

    //         return tex
    //     }

    //     return {
    //         name: "Map Name",
    //         size: map.size,
    //         skybox: "#AAAAFF",
    //         floor: "#AAFFAA",
    //         spawn: map.spawn,
    //         tiles: map.tiles.map(tile => {
    //             return {
    //                 position: tile.position,
    //                 solid: tile.solid,
    //                 texture: convertTexture(tile),
    //                 // details: tile.detail,
    //                 minimap: tile.minimap.cssHex
    //             }
    //         })
    //     }
    // }

    public static async fromJson(path: string): Promise<Map> {

        const colorOrTexture = (ct: string | null): Color | string | null => {

            let color = Color.fromHex(ct)
            if (color) return color
            return ct
        }

        const sideTexture = async (jsonTexture: any): Promise<{ [key in Side]: Texture | null }> => {

            let texture: { [key in Side]: Texture | null } = {
                [Side.NORTH]: null,
                [Side.SOUTH]: null,
                [Side.WEST]: null,
                [Side.EAST]: null,
                [Side.TOP]: null,
                [Side.BOTTOM]: null,
            }

            const sideNameMap: { [key: number]: string } = { 0: "north", 1: "south", 2: "west", 3: "east", 4: "top", 5: "bottom" }

            for (const key of Object.keys(Side)) {

                const sideKey = <Side>Number(key)
                const sideName = sideNameMap[Number(key)]

                if (sideName in jsonTexture && jsonTexture[sideName]) {

                    const side = Color.fromHex(jsonTexture[sideName])
                    if (side instanceof Color) texture[sideKey] = TextureUtils.fromColor(side)
                    if (!texture[sideKey]) texture[sideKey] = await TextureUtils.fromFile(jsonTexture[sideName], jsonTexture[sideName])
                }
            }

            return texture
        }

        const sideDetail = async (jsonDetail: any): Promise<{ [key in Side]: Texture | null }> => {

            let detail: { [key in Side]: Texture | null } = {
                [Side.NORTH]: null,
                [Side.SOUTH]: null,
                [Side.WEST]: null,
                [Side.EAST]: null,
                [Side.TOP]: null,
                [Side.BOTTOM]: null,
            }

            const sideNameMap: { [key: number]: string } = { 0: "north", 1: "south", 2: "west", 3: "east", 4: "top", 5: "bottom" }

            for (const key of Object.keys(Side)) {

                const sideKey = <Side>Number(key)
                const sideName = sideNameMap[Number(key)]

                if (sideName in jsonDetail && jsonDetail[sideName]) {

                    const side = Color.fromHex(jsonDetail[sideName])
                    if (side instanceof Color) detail[sideKey] = TextureUtils.fromColor(side)
                    if (!detail[sideKey]) detail[sideKey] = await TextureUtils.fromFile(jsonDetail[sideName], jsonDetail[sideName])
                }
            }

            return detail
        }

        return new Promise<Map>(async (resolve, reject) => {

            fetch(path)
                .then(data => data.json())
                // TODO: validade json
                .then(async jsonMap => {

                    const map = new Map()
                    map.size = jsonMap.size
                    map.spawn = jsonMap.spawn

                    // TODO: implement texture load for map
                    const sky = colorOrTexture(jsonMap.sky)
                    if (sky instanceof Color) map.skybox = sky

                    const floor = colorOrTexture(jsonMap.floor)
                    if (floor instanceof Color) map.floor = floor

                    for (const jsonTile of jsonMap.tiles) {

                        let texture: { [key in Side]: Texture | null } | Texture | null = null
                        let detail: { [key in Side]: Texture | null } | Texture | null = null

                        // no texture
                        if (!jsonTile.texture) {
                            texture = TextureUtils.fromColor(Color.INDIGO)
                        }

                        // color texture
                        else if (typeof (jsonTile.texture) === "string") {
                            const color = Color.fromHex(jsonTile.texture)
                            if (color) texture = TextureUtils.fromColor(color)
                        }

                        // file texture
                        else if (typeof (jsonTile.texture) === "string") {
                            texture = await TextureUtils.fromFile("MAP_WALL_TEX", jsonTile.texture)
                        }

                        // sides texture
                        else if (typeof (jsonTile.texture) === "object") {
                            texture = await sideTexture(jsonTile.texture)
                        }

                        // sides detail
                        if (typeof (jsonTile.detail) === "object") {
                            detail = await sideDetail(jsonTile.detail)
                        }

                        let minimap = Color.fromHex(jsonTile.minimap)
                        if (!minimap) minimap = Color.INDIGO

                        let collision = jsonTile.solid
                        if ("collision" in jsonTile) collision = jsonTile.collision

                        const tile = new Tile(
                            jsonTile.position,
                            jsonTile.solid,
                            collision,
                            texture,
                            detail,
                            minimap
                        )

                        map.tiles.push(tile)
                    }

                    // load sprites
                    for (const jsonSprite of jsonMap.sprites) {

                        const texture = await TextureUtils.fromFile(`SPRITE_${jsonSprite.name}_TEXTURE`, jsonSprite.texture)
                        if (!texture) throw new Error(`Can't load texture ${jsonSprite.texture}.`)

                        if (jsonSprite.position.constructor !== Array) {
                            jsonSprite.position = [jsonSprite.position]
                        }

                        for (const position of jsonSprite.position) {

                            const sprite = new Sprite(
                                jsonSprite.name,
                                position.x,
                                position.y,
                                jsonSprite.size.width,
                                jsonSprite.size.height,
                                texture,
                                jsonSprite.params
                            )

                            sprite.visible = jsonSprite.visible
                            map.sprites.push(sprite)
                        }

                    }

                    resolve(map)
                })
                .catch(error => reject(error))
        })
    }
}