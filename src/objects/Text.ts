import { Renderer } from "../interfaces/Renderer"
import { GameObject } from "../models/GameObject"
import { Texture } from "../models/Texture"

export class Text extends GameObject {

    constructor(name: string, x: number, y: number, private texture: Texture) {
        super()

        this.name = name
        this.x = x
        this.y = y
        this.width = texture.width
        this.height = texture.height
    }

    public override draw(renderer: Renderer): void {

        renderer.drawTexture(this.x, this.y, this.texture)
    }
}
