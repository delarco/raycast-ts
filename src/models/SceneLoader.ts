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
    TEXT,
    DELAY,
}

export class SceneLoader {

    private _loading = true
    private _loadList = new Array<any>()
    private _textures = new Array<Texture>()
    private _map: Map = new Map()
    private _texts = new Array<Text>()

    public get loading() { return this._loading }

    constructor(private scene: Scene) { }

    public getTexture(name: string): Texture | null {

        return this._textures.find(t => t.name === name) || null
    }

    public getMap(): Map {

        return this._map
    }

    public getText(name: string): Text | null {

        return this._texts.find(t => t.name === name) || null
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

    public text(name: string, text: string, style: TextStyle): void {

        this._loadList.push({ type: LoadType.TEXT, name, text, style })
    }
    
    public delay(milliseconds: number): void {

        this._loadList.push({ type: LoadType.DELAY, milliseconds })
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

                case LoadType.TEXT:
                    promises.push(this.loadText(item.name, item.text, item.style))
                    break

                case LoadType.DELAY:
                    promises.push(new Promise(resolve => setTimeout(resolve, item.milliseconds)))
                    break
            }
        }

        const results = await Promise.all(promises)

        for (const item of results) {

            if (item instanceof Map) {

                this._map = item

                if(this.scene instanceof RaycastScene) this.scene.map = item
            }
            else if (item instanceof Texture) {

                this._textures.push(item)
            }
            else if (item instanceof Text) {

                this._texts.push(item)
            }
        }
    }

    private async loadMap(path: string): Promise<Map> {

        return MapUtils.fromJson(path)
    }

    private async loadMapArray(array: Array<number>, size: Size, wallColors?: { [key: number]: Color }): Promise<Map> {

        return MapUtils.fromIntArray(array, size, wallColors)
    }

    private async loadTexture(name: string, path: string): Promise<Texture> {

        return TextureUtils.fromFile(name, path)
    }

    private async loadColorTexture(name: string, color: Color): Promise<Texture> {

        return new Promise(resolve => resolve(TextureUtils.fromColor(color, name)))
    }

    private async loadText(name: string, text: string, style: TextStyle): Promise<Text> {

        return new Promise(async resolve => {

            const texture = await TextureUtils.createTextTexture(name, text, style)
            resolve(new Text(name, 0, 0, texture))
        })
    }
}
