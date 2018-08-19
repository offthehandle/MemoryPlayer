var MemoryPlayerController = (function () {
    /**
     * Implements IController
     * @constructs MemoryPlayerController
     * @param {IScope} $scope - The core angular scope service.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     * @param {IMemoryPlayerControls} MemoryPlayerControls - The service that manages memory player controls.
     */
    function MemoryPlayerController($scope, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$scope = $scope;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        // Sets initial state of player
        this.playlists = this.MemoryPlayerState.getPlaylists();
        this.currentPlaylist = this.MemoryPlayerState.getPlaylist();
        this.currentTrack = this.MemoryPlayerState.getTrack();
        this.isPaused = this.MemoryPlayerState.getIsPaused();
        // Watches state service for playlists change
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylists();
        }, function (newPlaylists, oldPlaylists) {
            // If playlists change then update
            if (angular.isDefined(newPlaylists) && newPlaylists !== oldPlaylists) {
                // Updates playlists
                _this.playlists = newPlaylists;
            }
        });
        // Watches state service for playlist change
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylist();
        }, function (newPlaylist, oldPlaylist) {
            // If playlist changes then update
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {
                // Updates current playlist
                _this.currentPlaylist = newPlaylist;
            }
        });
        // Watches state service for track change
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getTrack();
        }, function (newTrack, oldTrack) {
            // If track changes then update
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {
                // Updates current track
                _this.currentTrack = newTrack;
            }
        });
        // Watches state service for play change
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getIsPaused();
        }, function (newState, oldState) {
            // If is paused changes then update
            if (angular.isDefined(newState) && newState !== oldState) {
                // Updates is paused
                _this.isPaused = newState;
            }
        });
    }
    /**
     * Implements max volume method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.maxVolume = function () {
        this.MemoryPlayerControls.maxVolume();
    };
    /**
     * Implements toggle mute and unmute method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.mute = function () {
        this.MemoryPlayerControls.mute();
    };
    /**
     * Implements play next track method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.next = function () {
        this.MemoryPlayerControls.next();
    };
    /**
     * Implements toggle play and pause method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.play = function () {
        this.MemoryPlayerControls.play();
    };
    /**
     * Implements play previous track method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.previous = function () {
        this.MemoryPlayerControls.previous();
    };
    /**
     * Implements play selected playlist method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    MemoryPlayerController.prototype.selectPlaylist = function (playlistName) {
        this.MemoryPlayerControls.selectPlaylist(playlistName);
    };
    /**
     * Implements play selected track method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     * @param {number} trackIndex - The index of selected track in playlist.
     */
    MemoryPlayerController.prototype.selectTrack = function (trackIndex) {
        this.MemoryPlayerControls.selectTrack(trackIndex);
    };
    /**
     * Implements toggle playlist dropdown method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     * @param {JQueryEventObject} event - The event from trigger element.
     */
    MemoryPlayerController.prototype.toggleDropdown = function (event) {
        this.MemoryPlayerControls.toggleDropdown(event);
    };
    return MemoryPlayerController;
}());
MemoryPlayerController.instance = [
    '$scope',
    'MemoryPlayerState',
    'MemoryPlayerControls',
    MemoryPlayerController
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
