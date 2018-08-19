
interface IMemoryPlayerState {
    getIsMuted(): boolean;
    setIsMuted(isMuted: boolean): void;
    getIsPaused(): boolean;
    setIsPaused(isPaused: boolean): void;
    getPlaylist(): IPlaylist;
    setPlaylist(playlist: string): void;
    getPlaylistId(): string;
    getPlaylists(): IPlaylists;
    setPlaylists(playlists: IPlaylists): void;
    getTime(): number;
    getTrack(): ITrack;
    setTrack(trackIndex: number): void;
    getTrackId(): number;
    getVolume(): string;
    setVolume(volume: number): void;
}
