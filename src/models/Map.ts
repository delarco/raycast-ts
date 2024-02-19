import { Size } from "../interfaces/Size"
import { Tile } from "./Tile"

export class Map {

    public tiles: Array<Tile>
    public size: Size

    public getTile(x: number, y: number): Tile | null {

        if (x < 0 || x >= this.size.width) return null
        if (y < 0 || y >= this.size.height) return null

        return this.tiles[x + (y * this.size.width)]
    }

    public isLocationSolid(x: number, y: number): boolean {

        if (x < 0 || x >= this.size.width) return false
        if (y < 0 || y >= this.size.height) return false

        return this.tiles[y * this.size.width + x].solid
    }
}
