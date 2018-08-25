
interface IRestartSettings {
    isMuted: boolean | string;
    isPaused: boolean | string;
    time: number;
    track: number;
    volume: number;
}

interface IRestart {
    playlist: string;
    settings: IRestartSettings;
}
