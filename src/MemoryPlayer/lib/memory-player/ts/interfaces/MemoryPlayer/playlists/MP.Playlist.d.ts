
interface IPlaylist {
    _id: string;
    album: string;
    cover: string;
    playlist: Array<ITrack>;
    trackCount: number;
}
