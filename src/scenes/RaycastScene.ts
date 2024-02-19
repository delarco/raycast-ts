import { Renderer } from "../interfaces/Renderer";
import { Scene } from "../models/Scene"
import { Map } from "../models/Map";
import { Minimap } from "../objects/Minimap";
import { MovingRectangle } from "../objects/MovingRectangle";
import { Color } from "../models/Color";
import { Camera } from "../models/Camera";
import { MapUtils } from "../utils/Map.utils";

export class RaycastScene extends Scene {

    private map: Map
    private camera: Camera

    public async preload(): Promise<void> {

        // load map
        this.map = MapUtils.fromIntArray(
            [
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
            ],
            { width: 10, height: 10 }
        )
    }

    public init(): void {

        this.camera = new Camera(100, 100)

        const minimap = new Minimap(this.map, this.camera)
        const box = new MovingRectangle(0, 0, 25, 25, Color.RED)

        this.add(minimap)
        this.add(box)
    }

    public override draw(renderer: Renderer): void {

        // raycast draw
        this.drawMap(renderer)

        // draw sprites
        this.drawSprites(renderer)

        // draw objects
        super.draw(renderer)
    }

    private drawMap(renderer: Renderer): void {

    }

    private drawSprites(renderer: Renderer): void {

    }
}
