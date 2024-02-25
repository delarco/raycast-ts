import { GameObject } from "./GameObject";
import { Scene } from "./Scene"
import { Color } from "../models/Color";
import { Rectangle } from "../objects/Rectangle";
import { TextureUtils } from "../utils/Texture.utils";

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
}
