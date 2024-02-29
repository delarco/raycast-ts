import { Vec2D } from "../models/Vec2D"

export class MouseInput {

    private havePointerLock: boolean = false
    private locked: boolean = false
    public onClick: ((position: Vec2D, button: number) => void) | null = null
    public onMove: ((position: Vec2D) => void) | null = null

    private clickCallback = (ev: MouseEvent) => this.clickEvent(ev)
    private moveCallback = (ev: MouseEvent) => this.moveEvent(ev)
    private changeCallback = () => this.changeEvent()

    constructor(private element: HTMLCanvasElement) {

        this.havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document

        if (!this.havePointerLock) throw new Error('Pointer lock not available')

        this.element.addEventListener("click", this.clickCallback)
    }

    private clickEvent(ev: MouseEvent): void {

        const rect = this.element.getBoundingClientRect()
        const point = new Vec2D(ev.clientX - rect.left, ev.clientY - rect.top)
        
        if(this.onClick) this.onClick(point, ev.button)

        if (this.locked) return

        document.addEventListener('pointerlockchange', this.changeCallback, false)

        this.element.requestPointerLock()
    }

    private changeEvent(): void {

        if (document.pointerLockElement === this.element) {

            this.locked = true
            document.addEventListener("mousemove", this.moveCallback, false)
        } else {

            this.locked = false
            document.removeEventListener("mousemove", this.moveCallback, false)
        }
    }

    private moveEvent(e: MouseEvent) {

        const movementX = e.movementX || 0
        const movementY = e.movementY || 0

        if(this.onMove) this.onMove(new Vec2D(movementX, movementY))
    }

    public release(): void {

        document.exitPointerLock()
    }
}
