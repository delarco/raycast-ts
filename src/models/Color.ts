export class Color {

    public static readonly BLACK = new Color(0, 0, 0)
    public static readonly WHITE = new Color(255, 255, 255)
    public static readonly RED = new Color(255, 0, 0)
    public static readonly DARK_RED = new Color(150, 0, 0)
    public static readonly GREEN = new Color(0, 255, 0)
    public static readonly DARK_GREEN = new Color(0, 150, 0)
    public static readonly BLUE = new Color(0, 0, 255)
    public static readonly DARK_BLUE = new Color(0, 0, 150)
    public static readonly INDIGO = new Color(232, 234, 246)
    public static readonly YELLOW = new Color(255, 255, 0)
    public static readonly ORANGE = new Color(255, 160, 0)

    private color: Uint8Array
    private _cssHex: string

    public get r() { return this.color[0] }
    public get g() { return this.color[1] }
    public get b() { return this.color[2] }
    public get a() { return this.color[3] }

    public get cssHex() { return this._cssHex }

    constructor(red: number = 0, green: number = 0, blue: number = 0, alpha: number = 255) {

        this.color = new Uint8Array([red, green, blue, alpha])
        this._cssHex = this.toCssHex()
    }

    private toCssHex(): string {

        const r = this.r.toString(16).padStart(2, "0")
        const g = this.g.toString(16).padStart(2, "0")
        const b = this.b.toString(16).padStart(2, "0")
        const a = this.a.toString(16).padStart(2, "0")
        return `#${r}${g}${b}${a}`
    }

    public shade(shade: number = 0.6): void {

        this.color[0] *= shade;
        this.color[1] *= shade;
        this.color[2] *= shade;
    }

    public static shade(color: Color, shade: number = 0.6): Color {

        return new Color(color.r * shade, color.g * shade, color.b * shade, color.a);
    }
}
