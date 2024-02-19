import { Size } from "../interfaces/Size"

export class Map {

    public tiles: Array<number>
    public size: Size

    public getTile(x: number, y: number): number | null {

        if (x >= this.size.width) return null
        if (y >= this.size.height) return null

        return this.tiles[x + (y * this.size.width)]
    }
}
