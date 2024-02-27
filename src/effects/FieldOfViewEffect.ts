import { GameConfig } from "../GameConfig"

export class FieldOfViewEffect {


    private fieldOfViewVel = 0.1
    private startTime: number
    private initialfieldOfView: number

    constructor(gameConfig: GameConfig, time: number = 1500) {

        this.startTime = new Date().getTime()
        this.initialfieldOfView = gameConfig.fieldOfView

        const handler = setInterval(() => {

            gameConfig.fieldOfView += this.fieldOfViewVel

            if (gameConfig.fieldOfView <= 1.0) this.fieldOfViewVel *= (-1)
            if (gameConfig.fieldOfView >= 1.6) this.fieldOfViewVel *= (-1)

            if (new Date().getTime() - this.startTime >= time) {

                gameConfig.fieldOfView = this.initialfieldOfView
                clearInterval(handler)
            }

        }, 100)
    }
}
