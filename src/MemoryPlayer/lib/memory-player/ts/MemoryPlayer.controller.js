var MemoryPlayerController = (function () {
    function MemoryPlayerController($rootScope, $scope, $location, MemoryPlayerFactory) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$location = $location;
        this.MemoryPlayerFactory = MemoryPlayerFactory;
        this.playlists = null;
        this.selectedPlaylist = null;
        this.selectedTrack = null;
        this.isPaused = true;
        this.$scope.$on('$locationChangeStart', function (event, newUrl, oldUrl) {
            if (newUrl !== oldUrl) {
                var newUrlPath = _this.$location.url();
                _this.$location.path(newUrlPath.split('?')[0]).search({
                    playlist: _this.MemoryPlayerFactory.getPlaylistById(),
                    track: _this.MemoryPlayerFactory.getTrackById(),
                    time: _this.MemoryPlayerFactory.getTime(),
                    volume: _this.MemoryPlayerFactory.getVolume(),
                    isMuted: _this.MemoryPlayerFactory.getIsMuted(),
                    isPaused: _this.MemoryPlayerFactory.isPaused
                });
            }
        });
        this.$scope.$on('MemoryPlayer:directiveReady', function (event, remembered) {
            MemoryPlayerFactory.fetchPlaylists(function () {
                _this.playlists = _this.MemoryPlayerFactory.getAllPlaylists();
                if (remembered === null) {
                    for (var playlist in _this.playlists) {
                        break;
                    }
                    _this.MemoryPlayerFactory.createPlayer(_this.playlists[playlist]._id, null);
                }
                else {
                    _this.MemoryPlayerFactory.createPlayer(remembered.playlist, remembered.info);
                }
            });
        });
        this.$rootScope.$on('MemoryPlayer:trackChanged', function (event, track) {
            _this.selectedTrack = track;
        });
        this.$rootScope.$on('MemoryPlayer:playlistChanged', function (event, playlist) {
            _this.selectedPlaylist = playlist;
        });
        this.$rootScope.$on('MemoryPlayer:isPaused', function (event, isPaused) {
            _this.isPaused = isPaused;
        });
        this.$rootScope.$on('MemoryPlayer:trackPlayed', function () {
            _this.MemoryPlayerFactory.trackPlayedEvent(function (playerInfo) {
                _this.isPaused = playerInfo.isPaused;
                _this.$scope.$apply();
            });
        });
        this.$rootScope.$on('MemoryPlayer:trackEnded', function () {
            _this.MemoryPlayerFactory.trackEndedEvent(function (playerInfo) {
                _this.selectedTrack = playerInfo.track;
                _this.isPaused = playerInfo.isPaused;
                _this.$scope.$apply();
            });
        });
        angular.element(document).on('youtube.onVideoPlayed', function (e) {
            if (!_this.isPaused) {
                _this.play();
                _this.$scope.$apply();
            }
        });
    }
    MemoryPlayerController.prototype.setPlaylist = function (album) {
        this.MemoryPlayerFactory.setPlaylist(album);
    };
    ;
    MemoryPlayerController.prototype.play = function () {
        this.MemoryPlayerFactory.play();
    };
    ;
    MemoryPlayerController.prototype.cueTrack = function (track) {
        this.MemoryPlayerFactory.cueTrack(track);
    };
    ;
    MemoryPlayerController.prototype.next = function () {
        this.MemoryPlayerFactory.next();
    };
    ;
    MemoryPlayerController.prototype.previous = function () {
        this.MemoryPlayerFactory.previous();
    };
    ;
    MemoryPlayerController.prototype.maxVolume = function () {
        this.MemoryPlayerFactory.maxVolume();
    };
    ;
    MemoryPlayerController.prototype.mute = function () {
        this.MemoryPlayerFactory.mute();
    };
    ;
    MemoryPlayerController.instance = [
        '$rootScope',
        '$scope',
        '$location',
        'MemoryPlayerFactory',
        MemoryPlayerController
    ];
    return MemoryPlayerController;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
