import { Vec2D } from "../models/Vec2D";

export class VectorUtils {

    public static add(v1: Vec2D, v2: Vec2D): Vec2D {

        return new Vec2D(v1.x + v2.x, v1.y + v2.y)
    }

    public static sub(v1: Vec2D, v2: Vec2D): Vec2D {

        return new Vec2D(v1.x - v2.x, v1.y - v2.y)
    }

    public static mul(v: Vec2D, k: number): Vec2D {

        return new Vec2D(v.x * k, v.y * k)
    }

    public static div(v: Vec2D, k: number): Vec2D {

        return new Vec2D(v.x / k, v.y / k)
    }

    public static int(v: Vec2D): Vec2D {

        return new Vec2D(Math.trunc(v.x), Math.trunc(v.y))
    }
}
