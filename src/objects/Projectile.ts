import { Clock } from "../.."
import { SpriteParams } from "../interfaces/SpriteParams"
import { Camera } from "../models/Camera"
import { TextureUtils } from "../utils/Texture.utils"
import { Sprite } from "./Sprite"

export class Projectile extends Sprite {

    constructor(camera: Camera, velocity: number, texture: string, params: SpriteParams) {
        const tex = TextureUtils.getTexture(texture)

        if (!tex) throw new Error(`Can't find texture ${texture}.`)

        super("PROJECTILE", camera.x, camera.y, 0.5, 0.5, tex, params)
        this.angle = camera.angle
        this.velocity = velocity
    }
    
    public override update(clock: Clock): void {
        super.update(clock)
        this.x += Math.cos(this.angle) * this.velocity * clock.deltaTime
        this.y += Math.sin(this.angle) * this.velocity * clock.deltaTime
    }
}
