export class Color {

    public static readonly BLACK = new Color(0, 0, 0)
    public static readonly WHITE = new Color(255, 255, 255)
    public static readonly RED = new Color(255, 0, 0)
    public static readonly GREEN = new Color(0, 255, 0)
    public static readonly BLUE = new Color(0, 0, 255)
    public static readonly INDIGO = new Color(0, 0, 255)

    private color: Uint8Array
    private _cssHex: string

    public get r() { return this.color[0] }
    public get g() { return this.color[1] }
    public get b() { return this.color[2] }
    public get a() { return this.color[3] }
    
    public get cssHex() { return this._cssHex }

    constructor(red: number, green: number, blue: number, alpha: number = 255) {

        this.color = new Uint8Array([red, green, blue, alpha])
        this._cssHex = this.toCssHex()
    }

    private toCssHex(): string {

        const r = this.r.toString(16).padStart(2, "0")
        const g = this.g.toString(16).padStart(2, "0")
        const b = this.b.toString(16).padStart(2, "0")
        return `#${r}${g}${b}`
    }
}
