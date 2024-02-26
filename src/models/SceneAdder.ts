import { GameObject } from "./GameObject"
import { Scene } from "./Scene"
import { Color } from "../models/Color"
import { Rectangle } from "../objects/Rectangle"
import { TextureUtils } from "../utils/Texture.utils"
import { SpriteParams } from "../interfaces/SpriteParams"
import { Sprite } from "../objects/Sprite"
import { Text } from "../objects/Text"

export class SceneAdder {

    constructor(private scene: Scene) { }

    public object(gameObject: GameObject): void {

        gameObject.scene = this.scene
        gameObject.init()
        this.scene.objects.push(gameObject)
    }

    public rectangle(x: number, y: number, w: number, h: number, texture: string | Color): Rectangle {

        const rect = new Rectangle(x, y, w, h, (texture instanceof Color) ? texture : TextureUtils.getTexture(texture) || Color.WHITE)
        this.object(rect)
        return rect
    }

    public sprite(x: number, y: number, w: number, h: number, texture: string, params: SpriteParams): Sprite {

        const tex = TextureUtils.getTexture(texture)
        if (!tex) throw new Error(`Texture ${texture} not found.`)
        const sprite = new Sprite("SPRITE", x, y, w, h, tex, params)
        this.object(sprite)
        return sprite
    }

    public text(x: number, y: number, texture: string): Text {

        const tex = TextureUtils.getTexture(texture)
        if (!tex) throw new Error(`Texture ${texture} not found.`)
        const text = new Text("TEXT", x, y, tex)
        this.object(text)
        return text
    }
}
