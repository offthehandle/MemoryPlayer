
interface IMemoryPlaylist {
    _id: string;
    album: string;
    cover: string;
    playlist: Array<IMemoryTrack>;
    trackCount: number;
}
