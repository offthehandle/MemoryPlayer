
interface IMemoryPlayerFactory {
    isPaused: boolean;
    autoPlay(isAutoPlayed: boolean): void;
    createPlayer(album: string, playerInfo?: IMemoryPlayerInfo): void;
    cueTrack(track: number): void;
    fetchPlaylists(callback: Function): void;
    getAllPlaylists(): IMemoryPlaylists;
    getIsMuted(): boolean;
    getPlaylist(): IMemoryPlaylist;
    getPlaylistById(): string;
    getTime(): number;
    getTrack(): IMemoryTrack;
    getTrackById(): number;
    getVolume(): string;
    maxVolume(): void;
    mute(): void;
    next(): void;
    play(): void;
    previous(): void;
    setAllPlaylists(playlists: IMemoryPlaylists): void;
    setPlaylist(album: string): void;
    setTrack(track: number): void;
    trackEndedEvent(callback: Function): void;
    trackPlayedEvent(callback: Function): void;
}
