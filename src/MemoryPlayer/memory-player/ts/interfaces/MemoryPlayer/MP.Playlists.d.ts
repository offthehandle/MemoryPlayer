
interface ITrack {
    _id: number;
    artist: string;
    mp3: string;
    title: string;
}

interface IPlaylist {
    _id: string;
    album: string;
    cover: string;
    trackCount: number;
    tracks: Array<ITrack>;
}

interface IPlaylists {
    [playlist: string]: IPlaylist;
}
