import { TextStyle } from "../interfaces/TextStyle"
import { MapUtils } from "../utils/Map.utils"
import { TextureUtils } from "../utils/Texture.utils"
import { Color } from "./Color"
import { Map } from "./Map"
import { Texture } from "./Texture"
import { Text } from "../objects/Text"
import { RaycastScene, Size } from "../.."
import { Scene } from "./Scene"

enum LoadType {
    MAP,
    MAP_ARRAY,
    TEXTURE,
    COLOR_TEXTURE,
    TEXT_TEXTURE,
    DELAY,
    SKY,
}

type LoadResult = { type: LoadType, value: any }

export class SceneLoader {

    private _loading = true
    private _loadList = new Array<any>()
    private _textures = new Array<Texture>()
    private _map: Map = new Map()

    public get loading() { return this._loading }

    constructor(private scene: Scene) { }

    public getTexture(name: string): Texture | null {

        return this._textures.find(t => t.name === name) || null
    }

    public getMap(): Map {

        return this._map
    }

    public map(path: string): void {

        this._loadList.push({ type: LoadType.MAP, path })
    }

    public mapFromIntArray(array: Array<number>, size: Size, wallColors?: { [key: number]: Color }): void {

        this._loadList.push({ type: LoadType.MAP_ARRAY, array, size, wallColors })
    }

    public texture(name: string, path: string): void {

        this._loadList.push({ type: LoadType.TEXTURE, name, path })
    }

    public colorTexture(name: string, color: Color): void {

        this._loadList.push({ type: LoadType.COLOR_TEXTURE, name, color })
    }

    public textTexture(name: string, text: string, style: TextStyle): void {

        this._loadList.push({ type: LoadType.TEXT_TEXTURE, name, text, style })
    }

    public delay(milliseconds: number): void {

        this._loadList.push({ type: LoadType.DELAY, milliseconds })
    }

    public sky(sky: Color | string): void {

        this._loadList.push({ type: LoadType.SKY, sky })
    }

    public async load(): Promise<void> {

        const promises = []

        for (const item of this._loadList) {

            switch (item.type) {

                case LoadType.MAP:
                    promises.push(this.loadMap(item.path))
                    break

                case LoadType.MAP_ARRAY:
                    promises.push(this.loadMapArray(item.array, item.size, item.wallColors))
                    break

                case LoadType.TEXTURE:
                    promises.push(this.loadTexture(item.name, item.path))
                    break

                case LoadType.COLOR_TEXTURE:
                    promises.push(this.loadColorTexture(item.name, item.color))
                    break

                case LoadType.TEXT_TEXTURE:
                    promises.push(this.loadText(item.name, item.text, item.style))
                    break

                case LoadType.DELAY:
                    promises.push(new Promise(resolve => setTimeout(resolve, item.milliseconds)))
                    break

                case LoadType.SKY:
                    promises.push(this.loadSky(item.sky))
                    break
            }
        }

        const results = await Promise.all(promises) as Array<LoadResult>
        let sky: Color | Texture | null = null

        for (const item of results) {

            switch ((item as LoadResult).type) {

                case LoadType.MAP:
                case LoadType.MAP_ARRAY:
                    this._map = item.value
                    break

                case LoadType.TEXTURE:
                    this._textures.push(item.value)
                    break

                case LoadType.SKY:
                    sky = item.value
                    break
            }
        }

        if (sky) this._map.skybox = sky

        if (this.scene instanceof RaycastScene) this.scene.setMap(this._map)
    }

    private async loadMap(path: string): Promise<{ type: LoadType, value: Map }> {

        return new Promise(async resolve => resolve({
            type: LoadType.MAP,
            value: await MapUtils.fromJson(path)
        }))
    }

    private async loadMapArray(array: Array<number>, size: Size, wallColors?: { [key: number]: Color }): Promise<{ type: LoadType, value: Map }> {

        return new Promise(async resolve => resolve({
            type: LoadType.MAP,
            value: await MapUtils.fromIntArray(array, size, wallColors)
        }))
    }

    private async loadTexture(name: string, path: string): Promise<{ type: LoadType, value: Texture }> {

        return new Promise(async resolve => resolve({
            type: LoadType.TEXTURE,
            value: await TextureUtils.fromFile(name, path)
        }))
    }

    private async loadColorTexture(name: string, color: Color): Promise<{ type: LoadType, value: Texture }> {
        return new Promise(async resolve => resolve({
            type: LoadType.TEXTURE,
            value: await TextureUtils.fromColor(color, name)
        }))
    }

    private async loadText(name: string, text: string, style: TextStyle): Promise<{ type: LoadType, value: Texture }> {
        return new Promise(async resolve => resolve({
            type: LoadType.TEXTURE,
            value: await TextureUtils.createTextTexture(name, text, style)
        }))
    }

    private async loadSky(sky: Color | string): Promise<{ type: LoadType, value: Color | Texture }> {

        if (sky instanceof Color) {

            return new Promise(resolve => resolve({ type: LoadType.SKY, value: sky }))
        }
        else {

            return new Promise(async resolve => {

                const texture = await TextureUtils.fromFile("SKY_TEXTURE", sky)
                resolve({ type: LoadType.SKY, value: texture })
            })

        }
    }
}
