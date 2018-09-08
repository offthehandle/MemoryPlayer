var MemoryPlayerState = (function () {
    function MemoryPlayerState(JPlayer) {
        this.JPlayer = JPlayer;
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        this.isMuted = false;
        this.isPaused = true;
        this.volume = 0.80;
    }
    MemoryPlayerState.prototype.getIsMuted = function () {
        return this.isMuted;
    };
    MemoryPlayerState.prototype.setIsMuted = function (isMuted) {
        this.isMuted = isMuted;
    };
    MemoryPlayerState.prototype.getIsPaused = function () {
        return this.isPaused;
    };
    MemoryPlayerState.prototype.setIsPaused = function (isPaused) {
        this.isPaused = isPaused;
    };
    MemoryPlayerState.prototype.getPlaylist = function () {
        return this.currentPlaylist;
    };
    MemoryPlayerState.prototype.setPlaylist = function (playlistName) {
        this.currentPlaylist = this.playlists[playlistName];
        this.setTrack(0);
    };
    MemoryPlayerState.prototype.getPlaylistId = function () {
        return this.currentPlaylist._id;
    };
    MemoryPlayerState.prototype.getPlaylists = function () {
        return this.playlists;
    };
    MemoryPlayerState.prototype.setPlaylists = function (playlists) {
        this.playlists = playlists;
    };
    MemoryPlayerState.prototype.getTime = function () {
        return Math.floor(angular.element(this.jPlayerId).data('jPlayer').status.currentTime);
    };
    MemoryPlayerState.prototype.getTrack = function () {
        return this.currentTrack;
    };
    MemoryPlayerState.prototype.setTrack = function (trackIndex) {
        this.currentTrack = this.currentPlaylist.tracks[trackIndex];
    };
    MemoryPlayerState.prototype.getTrackId = function () {
        return this.currentTrack._id;
    };
    MemoryPlayerState.prototype.getVolume = function () {
        return this.volume.toFixed(2);
    };
    MemoryPlayerState.prototype.setVolume = function (volume) {
        this.volume = volume;
    };
    MemoryPlayerState.instance = [
        'JPlayer',
        MemoryPlayerState
    ];
    return MemoryPlayerState;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerState', MemoryPlayerState.instance);
})();
