
class MemoryPlayerState implements IMemoryPlayerState {

    public static instance: any[] = [
        'JPlayer',
        MemoryPlayerState
    ];



    /**
     * Implements IMemoryPlayerState
     * @constructs MemoryPlayerState
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     */
    constructor(
        private JPlayer: IJPlayerProvider
    ) {

        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;


        // Initializes some player settings
        this.isMuted = false;
        this.isPaused = true;
        this.volume = 0.80;
    }



    /**
     * @memberof MemoryPlayerState
     * @member {IPlaylist} currentPlaylist - Current playlist.
     * @private
     */
    private currentPlaylist: IPlaylist;


    /**
     * @memberof MemoryPlayerState
     * @member {ITrack} currentTrack - Current track.
     * @private
     */
    private currentTrack: ITrack;


    /**
     * @memberof MemoryPlayerState
     * @member {boolean} isMuted - Current muted state of player.
     * @private
     * @default false
     */
    private isMuted: boolean;


    /**
     * @memberof MemoryPlayerState
     * @member {boolean} isPaused - Current play state of player.
     * @private
     * @default true
     */
    private isPaused: boolean;


    /**
     * @memberof MemoryPlayerState
     * @member {string} jPlayerId - The player id.
     * @private
     * @default #mp-jquery_jplayer
     */
    private jPlayerId: string;


    /**
     * @memberof MemoryPlayerState
     * @member {IPlaylists} playlists - Currently available playlists.
     * @private
     */
    private playlists: IPlaylists;


    /**
     * @memberof MemoryPlayerState
     * @member {number} volume - Current volume of player.
     * @private
     * @default 0.8
     */
    private volume: number;



    /**
     * Gets boolean that player is muted or not.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {boolean} - True if player is muted else false.
     */
    public getIsMuted(): boolean {

        return this.isMuted;
    }


    /**
     * Sets boolean that player is muted or not.
     * @memberof MemoryPlayerState
     * @instance
     * @param {boolean} isMuted - The muted state.
     */
    public setIsMuted(isMuted: boolean): void {

        // Updates muted state
        this.isMuted = isMuted;
    }


    /**
     * Gets boolean that player is paused or not.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {boolean} - True if player is paused else false.
     */
    public getIsPaused(): boolean {

        return this.isPaused;
    }


    /**
     * Sets boolean that player is paused or not.
     * @memberof MemoryPlayerState
     * @instance
     * @param {boolean} isPaused - The play state.
     */
    public setIsPaused(isPaused: boolean): void {

        // Updates play state
        this.isPaused = isPaused;
    }


    /**
     * Gets current playlist.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {IPlaylist} - The playlist.
     */
    public getPlaylist(): IPlaylist {

        return this.currentPlaylist;
    }


    /**
     * Sets current playlist.
     * @memberof MemoryPlayerState
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    public setPlaylist(playlistName: string): void {

        // Updates current playlist
        this.currentPlaylist = this.playlists[playlistName];

        // Sets current track to first track in current playlist
        this.setTrack(0);
    }


    /**
     * Gets current playlist id.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {string} - The id of playlist.
     */
    public getPlaylistId(): string {

        return this.currentPlaylist._id;
    }


    /**
     * Gets playlists.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {IPlaylists} - The playlists.
     */
    public getPlaylists(): IPlaylists {

        return this.playlists;
    }


    /**
     * Sets playlists returned by API.
     * @memberof MemoryPlayerState
     * @instance
     * @param {IPlaylists} playlists - The playlists.
     */
    public setPlaylists(playlists: IPlaylists): void {

        // Updates current playlists
        this.playlists = playlists;
    }


    /**
     * Gets current playback time of player.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {number} - The playback time of player.
     */
    public getTime(): number {

        // Rounds current playback time down
        return Math.floor(angular.element(this.jPlayerId).data('jPlayer').status.currentTime);
    }


    /**
     * Gets current track.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {ITrack} - The track.
     */
    public getTrack(): ITrack {

        return this.currentTrack;
    }


    /**
     * Sets current track.
     * @memberof MemoryPlayerState
     * @instance
     * @param {number} trackIndex - The id of selected track.
     */
    public setTrack(trackIndex: number): void {

        // Updates current track
        this.currentTrack = this.currentPlaylist.tracks[trackIndex];
    }


    /**
     * Gets current track id.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {number} - The id of track.
     */
    public getTrackId(): number {

        return this.currentTrack._id;
    }


    /**
     * Gets current volume of player.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {string} - The 2 digit decimal volume of player.
     */
    public getVolume(): string {

        return this.volume.toFixed(2);
    }


    /**
     * Sets volume of player.
     * @memberof MemoryPlayerState
     * @instance
     */
    public setVolume(volume: number): void {

        this.volume = volume;
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .service('MemoryPlayerState', MemoryPlayerState.instance);
})();
