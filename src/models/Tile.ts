import { Side } from "../enums/Side";
import { Color } from "./Color";
import { Vec2D } from "./Vec2D";
import { Texture } from "./Texture"
import { TextureUtils } from "../utils/Texture.utils";

export class Tile {

    public texture: { [key in Side]: Texture | null }
    public detail: { [key in Side]: Texture | null }

    public onUse: (() => void) | null = null
    public onProjectileHit: (() => void) | null = null

    constructor(
        public position: Vec2D,
        public solid: boolean,
        public collision: boolean,
        texture: { [key in Side]: Texture | null } | Texture | null,
        detail: { [key in Side]: Texture | null } | Texture | null,
        public minimap = Color.INDIGO
    ) {

        const defaultTexture = TextureUtils.fromColor(Color.WHITE)

        if (!texture) {

            texture = defaultTexture
        }

        if (texture instanceof Texture) {

            this.texture = {
                [Side.NORTH]: texture,
                [Side.SOUTH]: texture,
                [Side.WEST]: texture,
                [Side.EAST]: texture,
                [Side.TOP]: null,
                [Side.BOTTOM]: null,
            }
        }
        else {

            this.texture = texture

            if (!texture[Side.NORTH]) texture[Side.NORTH] = defaultTexture
            if (!texture[Side.SOUTH]) texture[Side.SOUTH] = defaultTexture
            if (!texture[Side.EAST]) texture[Side.EAST] = defaultTexture
            if (!texture[Side.WEST]) texture[Side.WEST] = defaultTexture
        }

        if (detail instanceof Texture) {

            this.detail = {
                [Side.NORTH]: detail,
                [Side.SOUTH]: detail,
                [Side.WEST]: detail,
                [Side.EAST]: detail,
                [Side.TOP]: null,
                [Side.BOTTOM]: null,
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
        else {

            this.detail = detail
        }
    }
}
