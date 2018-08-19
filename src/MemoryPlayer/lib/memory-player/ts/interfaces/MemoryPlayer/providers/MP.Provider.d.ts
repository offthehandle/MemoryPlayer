
interface IJPlayerProvider {
    create(playlist: Array<ITrack>): void;
    ids: IJPlayerIds;
    instance(): IPlaylistJPlayer;
}
