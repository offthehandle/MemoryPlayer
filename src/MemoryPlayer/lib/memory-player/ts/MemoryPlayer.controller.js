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
            _this.MemoryPlayerFactory.fetchPlaylists(function () {
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
         * Event reporting that the playlist has changed.
         *
         * @listens event:MemoryPlayer:playlistChanged
         */
        this.$rootScope.$on('MemoryPlayer:playlistChanged', function (event, playlist) {
            _this.selectedPlaylist = playlist;
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
        angular.element(document).on('youtube.onVideoPlayed', function () {
            if (!_this.isPaused) {
                _this.play();
                _this.$scope.$apply();
            }
        });
        /**
         * Click event to close the open playlists dropdown.
         */
        angular.element(document).on('click.mp.dropdown', function (e) {
            var $dropdown = angular.element('.mp-dropdown');
            if (!angular.element(e.target).hasClass('mp-dropdown-toggle') && $dropdown.hasClass('open')) {
                $dropdown.removeClass('open');
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });
        /**
         * Click event to close the open playlists dropdown on mobile devices.
         */
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', function (e) {
            var $dropdown = angular.element('.mp-dropdown');
            angular.element(e.target).remove();
            $dropdown.removeClass('open');
            $dropdown.find('a').attr('aria-expanded', 'false');
        });
        /**
         * Click event to close the open playlists dropdown.
         */
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', function (e) {
            e.stopPropagation();
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
    /**
     * Implements the share link method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.share = function () {
        var shareLink = document.getElementById('share-link');
        shareLink.select();
        document.execCommand('copy');
    };
    /**
     * Toggles the playlists dropdown open and closed.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.toggleDropdown = function ($event) {
        var $trigger = angular.element($event.target), $parent = $trigger.closest('.mp-dropdown'), isActive = $parent.hasClass('open'), $backdrop = $(document.createElement('div')).addClass('mp-dropdown-backdrop');
        // Resets dropdown
        angular.element('.mp-dropdown-backdrop').remove();
        $parent.removeClass('open');
        $trigger.attr('aria-expanded', 'false');
        // Opens the dropdown if it was closed when triggered
        if (!isActive) {
            if ('ontouchstart' in document.documentElement) {
                $backdrop.appendTo('body');
            }
            $parent.addClass('open');
            $trigger.attr('aria-expanded', 'true');
        }
    };
    return MemoryPlayerController;
}());
MemoryPlayerController.instance = [
    '$rootScope',
    '$scope',
    '$location',
    'MemoryPlayerFactory',
    MemoryPlayerController
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
