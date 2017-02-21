var MemoryPlayerController = (function () {
    /**
     * Implements IController
     * @constructs MemoryPlayerController
     * @param {IRootScopeService} $rootScope - The core angular rootScope service.
     * @param {IScope} $scope - The core angular scope service.
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerFactory} MemoryPlayerFactory - The Memory Player factory.
     */
    function MemoryPlayerController($rootScope, $scope, $location, MemoryPlayerFactory) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$location = $location;
        this.MemoryPlayerFactory = MemoryPlayerFactory;
        /**
         * @memberof MemoryPlayerController
         * @member {IMemoryPlaylists} playlists - The playlists object.
         * @default null
         */
        this.playlists = null;
        /**
         * @memberof MemoryPlayerController
         * @member {IMemoryPlaylist} selectedPlaylist - The selected playlist object.
         * @default null
         */
        this.selectedPlaylist = null;
        /**
         * @memberof MemoryPlayerController
         * @member {IMemoryTrack} selectedTrack - The selected track object.
         * @default null
         */
        this.selectedTrack = null;
        /**
         * @memberof MemoryPlayerController
         * @member {boolean} isPaused - True if the player is paused and false if it is not.
         * @default true
         */
        this.isPaused = true;
        /**
         * Core Angular event used to append query string for continuous playback.
         *
         * ?playlist=playlistId&track=trackId&time=time&isPaused=isPaused
         *
         * playlistId = id of the selected playlist
         * trackId = id of the selected track
         * time = track time returned by internal jPlayer event
         * isPaused = the player is paused (true) or not (false)
         *
         * @listens event:$locationChangeStart
         */
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
        /**
         * Event reporting that the track has changed.
         *
         * @listens event:MemoryPlayer:trackChanged
         */
        this.$rootScope.$on('MemoryPlayer:trackChanged', function (event, track) {
            _this.selectedTrack = track;
        });
        /**
         * Event reporting that the playlist has changed.
         *
         * @listens event:MemoryPlayer:playlistChanged
         */
        this.$rootScope.$on('MemoryPlayer:playlistChanged', function (event, playlist) {
            _this.selectedPlaylist = playlist;
        });
        /**
         * Event reporting that the player has been paused.
         *
         * @listens event:MemoryPlayer:isPaused
         */
        this.$rootScope.$on('MemoryPlayer:isPaused', function (event, isPaused) {
            _this.isPaused = isPaused;
        });
        /**
         * Event reporting that the selected track is being played.
         *
         * @listens event:MemoryPlayer:trackPlayed
         */
        this.$rootScope.$on('MemoryPlayer:trackPlayed', function () {
            _this.MemoryPlayerFactory.trackPlayedEvent(function (playerInfo) {
                _this.isPaused = playerInfo.isPaused;
                _this.$scope.$apply();
            });
        });
        /**
         * Event reporting that the selected track has ended.
         *
         * @listens event:MemoryPlayer:trackEnded
         */
        this.$rootScope.$on('MemoryPlayer:trackEnded', function () {
            _this.MemoryPlayerFactory.trackEndedEvent(function (playerInfo) {
                _this.selectedTrack = playerInfo.track;
                _this.isPaused = playerInfo.isPaused;
                _this.$scope.$apply();
            });
        });
        /**
         * Event reporting that a YouTube video is playing to prevent simultaneous playback.
         *
         * @listens event:youtube.onVideoPlayed
         */
        angular.element(document).on('youtube.onVideoPlayed', function (e) {
            if (!_this.isPaused) {
                _this.play();
                _this.$scope.$apply();
            }
        });
    }
    /**
     * Implements the setPlaylist factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} album - The id of the playlist to be set.
     */
    MemoryPlayerController.prototype.setPlaylist = function (album) {
        this.MemoryPlayerFactory.setPlaylist(album);
    };
    ;
    /**
     * Implements the play factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.play = function () {
        this.MemoryPlayerFactory.play();
    };
    ;
    /**
     * Implements the cueTrack factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     * @param {number} track - The id of the track to be set.
     */
    MemoryPlayerController.prototype.cueTrack = function (track) {
        this.MemoryPlayerFactory.cueTrack(track);
    };
    ;
    /**
     * Implements the next track factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.next = function () {
        this.MemoryPlayerFactory.next();
    };
    ;
    /**
     * Implements the previous track factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.previous = function () {
        this.MemoryPlayerFactory.previous();
    };
    ;
    /**
     * Implements the maxVolume factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.maxVolume = function () {
        this.MemoryPlayerFactory.maxVolume();
    };
    ;
    /**
     * Implements the toggle mute factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
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
