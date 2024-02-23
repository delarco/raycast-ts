import { MapUtils } from "../utils/Map.utils";
import { TextureUtils } from "../utils/Texture.utils";
import { Color } from "./Color";
import { Map } from "./Map";
import { Texture } from "./Texture";

enum LoadType {
    MAP,
    TEXTURE,
    COLOR_TEXTURE,
    DELAY,
}

export class SceneLoader {

    private _loading = true
    private _loadList = new Array<any>()
    private _textures = new Array<Texture>()
    private _map: Map = new Map()

    public get loading() { return this._loading }

    constructor() { }

    public getTexture(name: string): Texture | null {

        return this._textures.find(t => t.name === name) || null
    }

    public getMap(): Map {

        return this._map
    }

    public map(path: string): void {

        this._loadList.push({ type: LoadType.MAP, path })
    }

    public texture(name: string, path: string): void {

        this._loadList.push({ type: LoadType.TEXTURE, name, path })
    }

    public colorTexture(name: string, color: Color): void {

        this._loadList.push({ type: LoadType.COLOR_TEXTURE, name, color })
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

                case LoadType.TEXTURE:
                    promises.push(this.loadTexture(item.name, item.path))
                    break

                case LoadType.COLOR_TEXTURE:
                    promises.push(this.loadColorTexture(item.name, item.color))
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
            }
            else if (item instanceof Texture) {

                this._textures.push(item)
            }
        }
    }

    private async loadMap(path: string): Promise<Map> {

        path

        return MapUtils.fromIntArray(
            [
                1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 1, 1, 1, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 1, 1, 1, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 1, 1, 1, 0, 1,
                1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
                1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
                1, 1, 1, 1, 1, 1, 1, 1, 0, 1,
            ],
            { width: 10, height: 10 }
        )
    }

    private async loadTexture(name: string, path: string): Promise<Texture> {

        return TextureUtils.fromFile(name, path)
    }

    private async loadColorTexture(name: string, color: Color): Promise<Texture> {

        return new Promise(resolve => resolve(TextureUtils.fromColor(color, name)))
    }
}
