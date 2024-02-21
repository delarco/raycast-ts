import { GameConfig } from "../GameConfig"
import { GameWorkerConfig } from "../interfaces/GameWorkerConfig"

export enum WorkerMessageType {

    INITIALIZE,
    KEY_DOWN,
    KEY_UP,
    FPS,
}

export interface WorkerMessage {
    type: WorkerMessageType
}

export class InitializeMessage implements WorkerMessage {

    public type = WorkerMessageType.INITIALIZE

    constructor(public offscreen: OffscreenCanvas, public config: GameWorkerConfig) { }
}

export class KeyboardMessage implements WorkerMessage {

    constructor(public type: WorkerMessageType, public code: string) { }
}

export class FpsMessage implements WorkerMessage {

    public type = WorkerMessageType.FPS

    constructor(public fps: number) { }
}