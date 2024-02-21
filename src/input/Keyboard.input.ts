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
}

export class KeyboardInput {

    private keyState: { [key: string]: boolean } = {}

    public onKeyDown(code: string): void {

        this.keyState[code] = true
    }

    public onKeyUp(code: string): void {

        this.keyState[code] = false
    }

    public key(key: KEYS) {

        return this.keyState[key]
    }
}
