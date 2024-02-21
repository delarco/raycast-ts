import { Side } from "../enums/Side";
import { Color } from "./Color";
import { Vec2D } from "./Vec2D";
import { Texture } from "./Texture"
import { TextureUtils } from "../utils/Texture.utils";

export class Tile {

    public texture: { [key in Side]: Texture } | Texture
    public detail: { [key in Side]: Texture | null } | Texture

    constructor(
        public position: Vec2D,
        public solid: boolean,
        texture: { [key in Side]: Texture } | Texture | null,
        detail: { [key in Side]: Texture | null } | Texture | null,
    ) {

        if (!texture) {

            texture = TextureUtils.fromColor(Color.WHITE)
        }

        if (texture instanceof Texture) {

            this.texture = {
                [Side.NORTH]: texture,
                [Side.SOUTH]: texture,
                [Side.WEST]: texture,
                [Side.EAST]: texture,
                [Side.TOP]: texture,
                [Side.BOTTOM]: texture,
            };
        }

        if (detail instanceof Texture) {

            this.detail = {
                [Side.NORTH]: detail,
                [Side.SOUTH]: detail,
                [Side.WEST]: detail,
                [Side.EAST]: detail,
                [Side.TOP]: detail,
                [Side.BOTTOM]: detail,
            };
        }
        else if (!detail) {

            this.detail = {
                [Side.NORTH]: null,
                [Side.SOUTH]: null,
                [Side.WEST]: null,
                [Side.EAST]: null,
                [Side.TOP]: null,
                [Side.BOTTOM]: null,
            };
        }
    }
}
