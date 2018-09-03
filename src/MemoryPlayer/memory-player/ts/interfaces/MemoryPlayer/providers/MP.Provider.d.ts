
interface IJPlayerProvider {
    ids: IJPlayerIds;
    create(tracks: Array<ITrack>): void;
    instance(): IPlaylistJPlayer;
}
