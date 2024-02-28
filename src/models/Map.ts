import { Sprite } from "../.."
import { Size } from "../interfaces/Size"
import { Color } from "./Color"
import { Texture } from "./Texture"
import { Tile } from "./Tile"
import { Vec2D } from "./Vec2D"

export class Map {

    public name: string = "Unnamed Map"
    public tiles: Array<Tile> = []
    public size: Size = { width: 0, height: 0 }
    public skybox: Texture | Color = Color.LIGHT_BLUE
    public floor: Texture | Color = Color.LIGHT_GREEN
    public spawn = new Array<Vec2D>(new Vec2D(0, 0))
    public sprites: Array<Sprite> = []

    public get width() { return this.size.width }
    public get height() { return this.size.height }

    public getTile(x: number, y: number): Tile | null {

        if (x < 0 || x >= this.size.width) return null
        if (y < 0 || y >= this.size.height) return null

        return this.tiles[~~x + (~~y * this.size.width)]
    }

    public isLocationSolid(x: number, y: number): boolean {

        if (x < 0 || x >= this.size.width) return false
        if (y < 0 || y >= this.size.height) return false

        return this.tiles[~~y * this.size.width + ~~x].solid
    }

    public getRandomSpawnLocation(): Vec2D {

        const location = this.spawn[Math.floor(Math.random() * this.spawn.length)];
        return location;
    }
}
