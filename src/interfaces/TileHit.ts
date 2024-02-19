import { Side } from "../enums/Side";
import { Tile } from "../models/Tile";
import { Vec2D } from "../models/Vec2D";

export interface TileHit {

    tile: Tile;
    side: Side | null;
    position: Vec2D;
    tx: number | null;
}
