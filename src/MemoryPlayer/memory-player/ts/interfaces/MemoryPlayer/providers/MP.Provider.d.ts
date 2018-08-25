
interface IJPlayerProvider {
    ids: IJPlayerIds;
    create(playlist: Array<ITrack>): void;
    instance(): IPlaylistJPlayer;
}
