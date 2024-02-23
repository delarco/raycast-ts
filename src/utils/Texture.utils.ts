import { Size } from "../.."
import { Color } from "../models/Color"
import { Texture } from "../models/Texture"
import { TextStyle } from "../interfaces/TextStyle"

export class TextureUtils {

    private static resolution: Size
    private static offscrenCanvas: OffscreenCanvas
    private static textContext: OffscreenCanvasRenderingContext2D

    public static init(resolution: Size): void {

        TextureUtils.resolution = resolution
        TextureUtils.offscrenCanvas = new OffscreenCanvas(resolution.width, resolution.height)

        const context = TextureUtils.offscrenCanvas.getContext("2d")
        if (!context) throw new Error("Can't create get OffscreenCanvas context")
        TextureUtils.textContext = context
    }

    public static drawDebugBorders(texture: Texture): void {

        for (let x = 0; x < texture.width; x++) {

            texture.drawPixel(x, 0, Color.BLACK)
            texture.drawPixel(x, texture.height - 1, Color.BLACK)
        }

        for (let y = 0; y < texture.height; y++) {

            texture.drawPixel(0, y, Color.BLACK)
            texture.drawPixel(texture.width - 1, y, Color.BLACK)
        }

        texture.drawPixel(1, 1, Color.RED)
        texture.drawPixel(texture.width - 2, texture.height - 2, Color.GREEN)
    }

    public static fromColor(color: Color, name: string = `COLOR_${color.cssHex}`, size: number = 4, debugBorders = false): Texture {

        const texture = new Texture(name, size, size, [...new Array(size * size).keys()].map(() => color))
        if (debugBorders) TextureUtils.drawDebugBorders(texture)
        return texture
    }

    public static fromFile(name: string, filepath: string, debugBorders = false): Promise<Texture> {

        return new Promise((resolve, reject) => {

            fetch(filepath)
                .then(async result => {

                    const fileExt = filepath.split(/[#?]/)[0]?.split('.')?.pop()?.trim().toUpperCase()

                    let texture: Texture | null = null;

                    switch (fileExt) {

                        case 'JPG':
                        case 'PNG':

                            const bitmap = await createImageBitmap(await result.blob())
                            const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
                            const context = canvas.getContext('2d')

                            if (!context) throw new Error("Can't get OffscreenCanvas context")

                            context.drawImage(bitmap, 0, 0)
                            const imageData = context.getImageData(0, 0, bitmap.width, bitmap.height)
                            const colorBytes = imageData.data.length / (imageData.width * imageData.height)

                            if (colorBytes != 4) {
                                throw new Error('Not 4-byte color')
                            }

                            const data: Array<Color> = []

                            for (let index = 0; index < imageData.data.length; index += 4) {

                                data.push(new Color(
                                    imageData.data[index + 0],
                                    imageData.data[index + 1],
                                    imageData.data[index + 2],
                                    imageData.data[index + 3]
                                ))
                            }

                            texture = new Texture(name, imageData.width, imageData.height, data)
                            break

                        default:
                            throw new Error(`Unknown file extension: ${fileExt}`)
                    }

                    if (debugBorders) TextureUtils.drawDebugBorders(texture)

                    if (texture) return resolve(texture)
                    throw new Error("Error loading texture.")
                })
                .catch(error => {
                    console.log(error);

                    reject(`Error loading texture: ${name} ${filepath}.`)
                })
        })
    }

    public static makeSkyBoxNightTexture(height: number, debugBorders: boolean = false): Texture {

        const width = 360
        const data = new Array<Color>()

        for (let y of [...new Array(height).keys()]) {
            for (let x of [...new Array(width).keys()]) {

                let color = (x < 180)
                    ? new Color(
                        x * 255 / width,
                        0,
                        y * 255 / height
                    )
                    : new Color(
                        ((360 - x) * 255 / width),
                        0,
                        y * 255 / height
                    );


                if (
                    debugBorders && (
                        x == 0
                        || y == 0
                        || x == width - 1
                        || y == height - 1
                    )
                ) color = Color.RED;

                data.push(color)
                // texture.drawPixel(x, y, color);
            }
        }

        const texture = new Texture('skybox-night', width, height, data);

        if (debugBorders) TextureUtils.drawDebugBorders(texture)

        return texture;
    }

    public static makeSkyBoxDayTexture(height: number, debugBorders: boolean = false): Texture {

        const width = 360
        const data = new Array<Color>()

        for (let y of [...new Array(height).keys()]) {
            for (let x of [...new Array(width).keys()]) {

                let color = (x < 180)
                    ? new Color(
                        255 - (x * 255 / width),
                        255 - (x * 255 / width),
                        (y * 255 / height)
                    )
                    : new Color(
                        255 - ((360 - x) * 255 / width),
                        255 - ((360 - x) * 255 / width),
                        (y * 255 / height)
                    )

                if (
                    debugBorders && (
                        x == 0
                        || y == 0
                        || x == width - 1
                        || y == height - 1
                    )
                ) color = Color.RED

                data.push(color)
            }
        }

        const texture = new Texture('skybox-day', width, height, data)

        if (debugBorders) TextureUtils.drawDebugBorders(texture)

        return texture
    }

    public static makeSmileSticker(debugBorders: boolean = false): Texture {

        const width = 32
        const height = 32
        const data = new Array<Color>()

        for (let y of [...new Array(height).keys()]) {
            for (let x of [...new Array(width).keys()]) {

                if ((x == 10 && y == 10) || (x == 14 && y == 10)) {
                    data.push(Color.BLACK)
                }
                else if ((x == 10 || x == 14) && y == 13) {
                    data.push(Color.BLACK)
                }
                else if (x > 10 && x < 14 && y == 14) {
                    data.push(Color.BLACK)
                }
                else if (x >= 8 && x <= 16 && y >= 8 && y <= 16) {
                    data.push(Color.YELLOW)
                }
                else {
                    data.push(new Color(0, 0, 0, 0))
                }
            }
        }

        const texture = new Texture("smile-sticker", width, height, data)

        if (debugBorders) TextureUtils.drawDebugBorders(texture)

        return texture
    }

    public static async createTextTexture(name: string, text: string, style: TextStyle): Promise<Texture> {

        return new Promise(resolve => {

            style = {
                color: Color.WHITE,
                fontSize: 16,
                fontFamily: "Console",
                bold: false,
                borderWidth: null,
                borderColor: null,
                ...style
            }

            const resolution = TextureUtils.resolution
            const textContext = TextureUtils.textContext

            textContext.clearRect(0, 0, resolution.width, resolution.height);
            textContext.fillStyle = new Color(255, 255, 255, 0).cssHex
            textContext.fillRect(0, 0, resolution.width, resolution.height)

            textContext.fillStyle = style.color!.cssHex
            textContext.font = `${style.bold ? 'bold' : ''} ${style.fontSize}px ${style.fontFamily}`

            const metrics = textContext.measureText(text)
            textContext.fillText(text, metrics.actualBoundingBoxLeft, metrics.actualBoundingBoxAscent)

            if (style.borderWidth && style.borderColor) {
                textContext.lineWidth = style.borderWidth;
                textContext.strokeStyle = style.borderColor.cssHex;
                textContext.strokeText(text, metrics.actualBoundingBoxLeft, metrics.actualBoundingBoxAscent);
            }

            const textImageData = textContext.getImageData(
                0, 0,
                Math.ceil(metrics.width),
                metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent
            )
            const textBuffer = textImageData.data
            const data = new Array<Color>()

            for (let ty of new Array(textImageData.height).keys()) {

                for (let tx of new Array(textImageData.width).keys()) {

                    const textOffset = 4 * (ty * textImageData.width + tx);

                    data.push(new Color(
                        textBuffer[textOffset + 0],
                        textBuffer[textOffset + 1],
                        textBuffer[textOffset + 2],
                        textBuffer[textOffset + 3]
                    ))
                }
            }

            const texture = new Texture(name, textImageData.width, textImageData.height, data)

            resolve(texture)
        })
    }
}