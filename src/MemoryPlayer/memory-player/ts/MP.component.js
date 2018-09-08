var MPPlayerController = (function () {
    function MPPlayerController($rootScope, $location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        var state = this.$location.search();
        this.MemoryPlayerAPI.getPlaylists().then(function (response) {
            _this.MemoryPlayerState.setPlaylists(response);
            if (_this.isRestartable(state)) {
                var settings = {
                    track: parseInt(state.track),
                    time: parseInt(state.time),
                    volume: parseFloat(state.volume),
                    isMuted: state.isMuted,
                    isPaused: state.isPaused,
                };
                _this.MemoryPlayerControls.showtime(state.playlist, settings);
            }
            else {
                var playlist = Object.keys(response)[0];
                _this.MemoryPlayerControls.showtime(response[playlist]._id);
            }
        });
        this.unbindLocationChange = this.$rootScope.$on('$locationChangeStart', function ($event, newUrl, oldUrl) {
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
    MPPlayerController.prototype.isRestartable = function (state) {
        var isRestartable = true;
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
        return isRestartable;
    };
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
var MemoryPlayerComponent = (function () {
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
