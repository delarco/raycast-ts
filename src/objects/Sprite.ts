import { Clock } from "../utils/Clock";
import { Color } from "../models/Color";
import { GameObject } from "../models/GameObject"
import { Texture } from "../models/Texture";

export class Sprite extends GameObject {

    private currentFrameCounter = 0
    private lastTime = 0

    constructor(
        name: string,
        x: number,
        y: number,
        width: number,
        height: number,
        private texture: Texture,
        private frames: number,
        private frameWidth: number,
        private frameHeight: number,
        private frameChangeTime: number = 200
    ) {
        super()
        this.name = name
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.texture = texture
    }

    public nextFrame(): void {

        this.currentFrameCounter++
        if (this.currentFrameCounter == this.frames) this.currentFrameCounter = 0
    }

    public sampleColor(x: number, y: number): Color {

        const offsetX = this.currentFrameCounter * this.frameWidth

        if (x < 0) x = 1 - x
        if (y < 0) y = 1 - y

        const sx = Math.min(Math.trunc((x * this.frameWidth)), this.frameWidth - 1);
        const sy = Math.min(Math.trunc((y * this.frameHeight)), this.frameHeight - 1);
        return this.texture.getPixelColor(offsetX + sx, sy);
    }

    public override update(clock: Clock): void {

        if (clock.time - this.lastTime > this.frameChangeTime) {
            this.nextFrame()
            this.lastTime = clock.time
        }
    }
}
