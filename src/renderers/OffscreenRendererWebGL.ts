import { Renderer } from "../interfaces/Renderer";
import { Size } from "../interfaces/Size";
import { Color } from "../models/Color";
import { Texture } from "../models/Texture";

export class OffscreenRendererWebGL implements Renderer {

    private gl: WebGL2RenderingContext
    private _resolution: Size

    private program: WebGLProgram

    // Attributes locations
    public vertexPosition: number
    public textureCoord: number

    // Uniform locations
    public resolutionLocation: WebGLUniformLocation
    public colorLocation: WebGLUniformLocation

    public get resolution() { return this._resolution }

    private vertexShaderCode = `attribute vec2 a_position;

    uniform vec2 u_resolution;

    void main() {
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = a_position / u_resolution;

        // convert from 0 -> 1 to 0 -> 2
        vec2 zeroToTwo = zeroToOne * 2.0;

        // convert from 0 -> 2 to -1 -> +1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;

        // Flip 0,0 from bottom left to conventional 2D top left.
        gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
    }
    `

    private fragmentShaderCode = `precision mediump float;

    uniform vec4 u_color;

    void main() {
        // gl_FragColor = u_color;



        if(gl_FragCoord.x < 160.0) {
            gl_FragColor = vec4(1, 1, 0, 1);
        }
        else {
            gl_FragColor = vec4(1, 0, 0, 1);
        }
        
    }`

    private vertexArray: Float32Array = new Float32Array()
    private vertexBuffer: WebGLBuffer
    private vertexNumComponents: number = 0
    private vertexCount: number = 0

    private rects: Array<number> = []

    constructor(private offscreenCanvas: OffscreenCanvas) {

        const context = offscreenCanvas.getContext("webgl2")

        if (!context) {
            throw new Error("Can't get context")
        }

        this.gl = context

        this._resolution = {
            width: offscreenCanvas.width,
            height: offscreenCanvas.height
        }

        this.program = this.createProgram()

        // Attributes locations
        this.vertexPosition = this.gl.getAttribLocation(this.program, "a_position")

        // Uniform locations
        this.resolutionLocation = this.gl.getUniformLocation(this.program, "u_resolution")!
        this.colorLocation = this.gl.getUniformLocation(this.program, "u_color")!

        const vertexBuffer = this.gl.createBuffer()
        if (!vertexBuffer) throw new Error("Can't create WebGLBuffer (vertex)")
        this.vertexBuffer = vertexBuffer

        this.gl.viewport(0, 0, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight)
    }

    private createShader(source: string, shaderType: number): WebGLShader {

        const shader = this.gl.createShader(shaderType)

        if (!shader) {
            // this.gl.getShaderInfoLog(shader);
            // console.log('Shader compiler log: ' + compilationLog);

            throw new Error("Error creating WebGLShader")
        }

        this.gl.shaderSource(shader, source)
        this.gl.compileShader(shader)

        return shader
    }

    private createProgram(): WebGLProgram {

        const program = this.gl.createProgram()

        if (!program) throw new Error("Error creating WebGLProgram")

        const vertexShader = this.createShader(this.vertexShaderCode, this.gl.VERTEX_SHADER)
        const fragmantShader = this.createShader(this.fragmentShaderCode, this.gl.FRAGMENT_SHADER)
        this.gl.attachShader(program, vertexShader)
        this.gl.attachShader(program, fragmantShader)
        this.gl.linkProgram(program)


        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {

            const lastError = this.gl.getProgramInfoLog(program)
            throw new Error(`WebGLProgram linking error: ${lastError}`)
        }

        return program
    }

    clear(color?: Color | undefined): void {

        this.rects = []

        // this.gl.clearColor(1, 0, 0, 1)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT)

        // if (color) {
        //     this.drawRect(0, 0, this.resolution.width, this.resolution.height, color)
        // }
        // else {
        //     this.context.clearRect(0, 0, this.resolution.width, this.resolution.height)
        // }
    }

    flush(): void {

        this.vertexArray = new Float32Array(this.rects)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertexArray, this.gl.STATIC_DRAW)

        this.vertexNumComponents = 2;
        this.vertexCount = this.vertexArray.length / this.vertexNumComponents;

        this.gl.useProgram(this.program)
        this.gl.uniform2f(this.resolutionLocation, this.gl.drawingBufferWidth, this.gl.drawingBufferHeight);
        this.gl.enableVertexAttribArray(this.vertexPosition)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer)
        this.gl.vertexAttribPointer(this.vertexPosition, this.vertexNumComponents, this.gl.FLOAT, false, 0, 0);

        this.gl.uniform4fv(this.colorLocation, [1, 0, 0]);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);

        this.gl.flush()
    }

    drawPixel(x: number, y: number, color: Color): void {
        throw new Error("Method not implemented.");
    }

    drawLine(x1: number, y1: number, x2: number, y2: number, color: Color): void {
        throw new Error("Method not implemented.");
    }

    drawRect(x: number, y: number, w: number, h: number, color: Color): void {

        this.rects.push(x)
        this.rects.push(y)
        this.rects.push(x + w)
        this.rects.push(y)
        this.rects.push(x + w)
        this.rects.push(y + h)
        this.rects.push(x + w)
        this.rects.push(y + h)
        this.rects.push(x)
        this.rects.push(y + h)
        this.rects.push(x)
        this.rects.push(y)
    }

    drawTexture(x: number, y: number, texture: Texture, scale: number): void{
        throw new Error("Method not implemented.");
    }
}
