export class Clock {

    private fpsCounter: number = 0
    private previousTime: number = 0
    private previousFpsTime: number = 0
    private _deltaTime: number = 0
    private _fps: number = 0
    private _updateFps: boolean = false

    public get deltaTime() { return this._deltaTime }
    public get updateFps() { return this._updateFps }
    public get fps() {

        this._updateFps = false
        return this._fps
    }

    public tick(currentTime: number): void {

        this.fpsCounter++;

        this._deltaTime = (currentTime - this.previousTime) * 0.001;
        this.previousTime = currentTime;

        if (currentTime - this.previousFpsTime >= 500) {

            this.previousFpsTime = currentTime;
            this._fps = this.fpsCounter * 2;
            this.fpsCounter = 0;
            this._updateFps = true
        }
    }
}
