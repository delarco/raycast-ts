import { GameConfig } from "../GameConfig"

export enum WorkerMessageType {

    INITIALIZE,
    KEY_DOWN,
    KEY_UP,
}

export interface WorkerMessage {
    type: WorkerMessageType
}

export class InitializeMessage implements WorkerMessage {

    public type = WorkerMessageType.INITIALIZE

    constructor(public offscreen: OffscreenCanvas, public config: GameConfig) { }
}

export class KeyboardMessage implements WorkerMessage {

    constructor(public type: WorkerMessageType, public code: string) { }
}
