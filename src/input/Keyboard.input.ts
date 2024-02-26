export enum KEYS {
    ARROW_UP = 'ArrowUp',
    ARROW_DOWN = 'ArrowDown',
    ARROW_LEFT = 'ArrowLeft',
    ARROW_RIGHT = 'ArrowRight',
    KEY_A = 'KeyA',
    KEY_S = 'KeyS',
    KEY_D = 'KeyD',
    KEY_W = 'KeyW',
    KEY_Q = 'KeyQ',
    KEY_E = 'KeyE',
    ENTER = "Enter",
    SPACE = "Space",
}

export class KeyboardInput {

    private keyState: { [key: string]: boolean } = {}

    constructor() {

        this.bindEvents();
    }

    private bindEvents(): void {

        document.addEventListener("keydown", ev => this.onDocumentKeyDown(ev))
        document.addEventListener("keyup", ev => this.onDocumentKeyUp(ev))
    }

    private onDocumentKeyDown(ev: KeyboardEvent): void {

        this.keyState[ev.code] = true;
    }

    private onDocumentKeyUp(ev: KeyboardEvent): void {

        this.keyState[ev.code] = false
    }

    public key(key: KEYS | string) {

        return this.keyState[key]
    }
}
