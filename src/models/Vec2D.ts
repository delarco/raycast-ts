export class Vec2D {

    constructor(public x: number = 0, public y: number = 0) { }

    public mag(): number {

        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public mag2(): number {

        return this.x * this.x + this.y * this.y;
    }

    public clone(): Vec2D {

        return new Vec2D(this.x, this.y);
    }
}
