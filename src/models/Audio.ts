export enum AudioType {
    MUSIC,
    SOUND_EFFECT
}

export class Audio {

    public onPlayEnded: (() => void) | null = null

    constructor(public name: string, public filename: string, public type: AudioType, private audioElement: HTMLAudioElement) {

        this.audioElement.onended = () => {
            if (this.onPlayEnded) this.onPlayEnded()
        }
    }

    public set volume(v: number) {

        this.audioElement.volume = v
    }

    public set loop(loop: boolean) {

        this.audioElement.loop = loop
    }

    public get duration() {

        return this.audioElement.duration
    }

    public play(): void {

        this.audioElement.play()
    }

    public pause(): void {

        this.audioElement.pause()
    }
}
