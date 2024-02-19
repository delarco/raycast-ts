import { GameConfig } from "../GameConfig"

export enum WorkerMessageType {

    INITIALIZE
}

export interface WorkerMessage {
    type: WorkerMessageType
}

export class InitializeMessage implements WorkerMessage {

    public type = WorkerMessageType.INITIALIZE

    constructor(public offscreen: OffscreenCanvas, public config: GameConfig) { }
}
