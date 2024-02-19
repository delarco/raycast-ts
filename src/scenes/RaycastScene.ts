import { Renderer } from "../interfaces/Renderer";
import { Scene } from "../models/Scene"
import { Clock } from "../utils/Clock";

export class RaycastScene extends Scene {

    preload(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    init(): void {
        throw new Error("Method not implemented.");
    }

    update(clock: Clock): void {
        throw new Error("Method not implemented.");
    }

    draw(renderer: Renderer) {
        throw new Error("Method not implemented.");
    }
}
