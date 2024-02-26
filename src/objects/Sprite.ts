import { Clock } from "../utils/Clock";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject"
import { Texture } from "../models/Texture";
import { SpriteParams } from "../interfaces/SpriteParams";

export class Sprite extends GameObject {

    private currentFrameCounter = 0
    private lastTime = 0
    private frames: number

    public onCollision: ((object: GameObject) => void) | null = null

    constructor(
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
        private texture: Texture,
        private params: SpriteParams,
    ) {
        super()
        this.name = name
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.texture = texture

        this.frames = Math.trunc(texture.width / params.frameWidth) * Math.trunc(texture.height / params.frameHeight)
        if (!params.frameChangeTime) params.frameChangeTime = 200
    }

    public nextFrame(): void {

        this.currentFrameCounter++
        if (this.currentFrameCounter == this.frames) this.currentFrameCounter = 0
    }

    public sampleColor(x: number, y: number): Color {

        const offsetX = this.currentFrameCounter * this.params.frameWidth

        if (x < 0) x = 1 - x
        if (y < 0) y = 1 - y

        // TODO: refactor
        const sx = Math.min(Math.trunc((x * this.params.frameWidth)), this.params.frameWidth - 1);
        const sy = Math.min(Math.trunc((y * this.params.frameHeight)), this.params.frameHeight - 1);
        return this.texture.getPixelColor(offsetX + sx, sy);
    }

    public override update(clock: Clock): void {

        if (clock.time - this.lastTime > this.params.frameChangeTime!) {
            this.nextFrame()
            this.lastTime = clock.time
        }
    }
}
