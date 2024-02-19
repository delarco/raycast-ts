import { Renderer } from "../interfaces/Renderer";
import { Scene } from "../models/Scene"
import { GameObject } from "../models/GameObject";
import { Map } from "../models/Map";
import { Minimap } from "../objects/Minimap";
import { MovingRectangle } from "../objects/MovingRectangle";
import { Clock } from "../utils/Clock";
import { Color } from "../models/Color";
import { Size } from "../interfaces/Size";
import { Position } from "../interfaces/Position";
import { Camera } from "../models/Camera";

export class RaycastScene extends Scene {

    private map: Map
    private camera: Camera
    
    

    public async preload(): Promise<void> {

        // load map
        this.map = new Map()
        this.map.size = { width: 10, height: 10 }
        this.map.tiles = [
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 1, 1, 1, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 1, 1, 1, 0, 1,
            1, 1, 1, 0, 0, 0, 0, 0, 0, 1,
            1, 0, 0, 0, 0, 0, 0, 0, 0, 1,
            1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
        ]
    }

    public init(): void {

        this.camera = new Camera(100, 100)

        const minimapSize = Math.floor(this.gameInstance.resolution.width / 4)

        const minimapPos: Position = {
            x: this.gameInstance.resolution.width - minimapSize - 4,
            y: 4,
            z: 0
        }

        const minimap = new Minimap(minimapPos.x, minimapPos.y, minimapSize, minimapSize, this.map, this.camera)
        const box = new MovingRectangle(0, 0, 25, 25, Color.RED)

        this.add(minimap)
        this.add(box)

        
    }
}
