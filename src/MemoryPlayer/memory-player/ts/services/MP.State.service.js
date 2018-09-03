var MemoryPlayerState = (function () {
    /**
     * Implements IMemoryPlayerState
     * @constructs MemoryPlayerState
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     */
    function MemoryPlayerState(JPlayer) {
        this.JPlayer = JPlayer;
        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        // Initializes some player settings
        this.isMuted = false;
        this.isPaused = true;
        this.volume = 0.80;
    }
    /**
     * Gets boolean that player is muted or not.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {boolean} - True if player is muted else false.
     */
    MemoryPlayerState.prototype.getIsMuted = function () {
        return this.isMuted;
    };
    /**
     * Sets boolean that player is muted or not.
     * @memberof MemoryPlayerState
     * @instance
     * @param {boolean} isMuted - The muted state.
     */
    MemoryPlayerState.prototype.setIsMuted = function (isMuted) {
        // Updates muted state
        this.isMuted = isMuted;
    };
    /**
     * Gets boolean that player is paused or not.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {boolean} - True if player is paused else false.
     */
    MemoryPlayerState.prototype.getIsPaused = function () {
        return this.isPaused;
    };
    /**
     * Sets boolean that player is paused or not.
     * @memberof MemoryPlayerState
     * @instance
     * @param {boolean} isPaused - The play state.
     */
    MemoryPlayerState.prototype.setIsPaused = function (isPaused) {
        // Updates play state
        this.isPaused = isPaused;
    };
    /**
     * Gets current playlist.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {IPlaylist} - The playlist.
     */
    MemoryPlayerState.prototype.getPlaylist = function () {
        return this.currentPlaylist;
    };
    /**
     * Sets current playlist.
     * @memberof MemoryPlayerState
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    MemoryPlayerState.prototype.setPlaylist = function (playlistName) {
        // Updates current playlist
        this.currentPlaylist = this.playlists[playlistName];
        // Sets current track to first track in current playlist
        this.setTrack(0);
    };
    /**
     * Gets current playlist id.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {string} - The id of playlist.
     */
    MemoryPlayerState.prototype.getPlaylistId = function () {
        return this.currentPlaylist._id;
    };
    /**
     * Gets playlists.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {IPlaylists} - The playlists.
     */
    MemoryPlayerState.prototype.getPlaylists = function () {
        return this.playlists;
    };
    /**
     * Sets playlists returned by API.
     * @memberof MemoryPlayerState
     * @instance
     * @param {IPlaylists} playlists - The playlists.
     */
    MemoryPlayerState.prototype.setPlaylists = function (playlists) {
        // Updates current playlists
        this.playlists = playlists;
    };
    /**
     * Gets current playback time of player.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {number} - The playback time of player.
     */
    MemoryPlayerState.prototype.getTime = function () {
        // Rounds current playback time down
        return Math.floor(angular.element(this.jPlayerId).data('jPlayer').status.currentTime);
    };
    /**
     * Gets current track.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {ITrack} - The track.
     */
    MemoryPlayerState.prototype.getTrack = function () {
        return this.currentTrack;
    };
    /**
     * Sets current track.
     * @memberof MemoryPlayerState
     * @instance
     * @param {number} trackIndex - The id of selected track.
     */
    MemoryPlayerState.prototype.setTrack = function (trackIndex) {
        // Updates current track
        this.currentTrack = this.currentPlaylist.tracks[trackIndex];
    };
    /**
     * Gets current track id.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {number} - The id of track.
     */
    MemoryPlayerState.prototype.getTrackId = function () {
        return this.currentTrack._id;
    };
    /**
     * Gets current volume of player.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {string} - The 2 digit decimal volume of player.
     */
    MemoryPlayerState.prototype.getVolume = function () {
        return this.volume.toFixed(2);
    };
    /**
     * Sets volume of player.
     * @memberof MemoryPlayerState
     * @instance
     */
    MemoryPlayerState.prototype.setVolume = function (volume) {
        this.volume = volume;
    };
    return MemoryPlayerState;
}());
MemoryPlayerState.instance = [
    'JPlayer',
    MemoryPlayerState
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerState', MemoryPlayerState.instance);
})();
