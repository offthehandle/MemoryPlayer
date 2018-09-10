var MPPlayerController = /** @class */ (function () {
    /**
     * Implements IController
     * @constructs MPPlayerController
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerAPI} MemoryPlayerAPI - The service that manages API calls.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     * @param {IMemoryPlayerControls} MemoryPlayerControls - The service that manages memory player controls.
     */
    function MPPlayerController($rootScope, $location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        // Gets player state from URL
        var state = this.$location.search();
        // Gets playlists using API
        this.MemoryPlayerAPI.getPlaylists().then(function (response) {
            // Sets playlists response in service
            _this.MemoryPlayerState.setPlaylists(response);
            // If available settings allow then restart, else start fresh
            if (_this.isRestartable(state)) {
                // Sets restart settings
                var settings = {
                    track: parseInt(state.track),
                    time: parseInt(state.time),
                    volume: parseFloat(state.volume),
                    isMuted: state.isMuted,
                    isPaused: state.isPaused,
                };
                // Restarts player
                _this.MemoryPlayerControls.showtime(state.playlist, settings);
            }
            else {
                // Gets name of first playlist
                var playlist = Object.keys(response)[0];
                // Starts player fresh
                _this.MemoryPlayerControls.showtime(response[playlist]._id);
            }
        });
        /**
         * Core Angular event used to append query string for continued playback.
         *
         * ?playlist=playlist&track=track&time=time&volume=volume&isMuted&isPaused
         *
         * playlist = id of the current playlist
         * track = id of the current track
         * time = current playback time
         * volume = current player volume
         * isMuted = the player is muted or not (=false)
         * isPaused = the player is paused or not (=false)
         */
        this.unbindLocationChange = this.$rootScope.$on('$locationChangeStart', function ($event, newUrl, oldUrl) {
            // If new page is requested then append query string
            if (newUrl !== oldUrl) {
                var newUrlPath = _this.$location.url();
                _this.$location.path(newUrlPath.split('?')[0]).search({
                    playlist: _this.MemoryPlayerState.getPlaylistId(),
                    track: _this.MemoryPlayerState.getTrackId(),
                    time: _this.MemoryPlayerState.getTime(),
                    volume: _this.MemoryPlayerState.getVolume(),
                    isMuted: _this.MemoryPlayerState.getIsMuted(),
                    isPaused: _this.MemoryPlayerState.getIsPaused()
                });
            }
        });
    }
    /**
     * Tests available settings for restartability
     * @memberof MPPlayerController
     * @instance
     * @private
     */
    MPPlayerController.prototype.isRestartable = function (state) {
        // Sets success as initial test result
        var isRestartable = true;
        // If any required setting is missing then set failure result
        if (!state.hasOwnProperty('isMuted')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('isPaused')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('playlist')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('time')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('track')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('volume')) {
            isRestartable = false;
        }
        // Returns test result
        return isRestartable;
    };
    // Cleans up watches to prevent memory leaks
    MPPlayerController.prototype.$onDestroy = function () {
        this.unbindLocationChange();
    };
    MPPlayerController.instance = [
        '$rootScope',
        '$location',
        'MemoryPlayerAPI',
        'MemoryPlayerState',
        'MemoryPlayerControls',
        MPPlayerController
    ];
    return MPPlayerController;
}());
var MemoryPlayerComponent = /** @class */ (function () {
    /**
     * Implements IComponentOptions
     * @constructs MemoryPlayerComponent
     */
    function MemoryPlayerComponent() {
        this.controller = MPPlayerController.instance;
        this.controllerAs = 'player';
        this.bindings = {
            cancelTimer: '&',
            currentPlaylist: '<',
            currentTrack: '<',
            isPaused: '<',
            isShareable: '<',
            maxVolume: '&',
            mute: '&',
            next: '&',
            play: '&',
            playlists: '<',
            previous: '&',
            selectPlaylist: '&',
            selectTrack: '&',
            share: '&',
            toggleDropdown: '&',
            updateTime: '&',
            useTime: '&'
        };
        this.templateUrl = '/memory-player/dist/html/memory-player.html';
    }
    return MemoryPlayerComponent;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .component('memoryPlayer', new MemoryPlayerComponent());
})();
