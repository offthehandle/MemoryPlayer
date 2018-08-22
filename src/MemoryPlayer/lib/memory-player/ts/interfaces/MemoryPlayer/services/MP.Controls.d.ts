
interface IMemoryPlayerControls {
    maxVolume(): void;
    mute(): void;
    next(): void;
    play(): void;
    previous(): void;
    selectPlaylist(playlistName: string): void;
    selectTrack(trackIndex: number): void;
    showtime(playlist: string, settings?: IRestartSettings): void;
    toggleDropdown($event: JQueryEventObject): void
}
