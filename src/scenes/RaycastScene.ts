import { Renderer } from "../interfaces/Renderer";
import { Scene } from "../interfaces/Scene"
import { Clock } from "../utils/Clock";

export class RacycastScene implements Scene {

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
