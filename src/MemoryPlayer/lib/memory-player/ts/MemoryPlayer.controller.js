var MemoryPlayerController = (function () {
    /**
     * Implements IController
     * @constructs MemoryPlayerController
     * @param {IRootScopeService} $rootScope - The core angular rootScope service.
     * @param {IScope} $scope - The core angular scope service.
     * @param {ILocationService} $location - The core angular location service.
     * @param {IIntervalService} $interval - The core angular interval service.
     * @param {IMemoryPlayerFactory} MemoryPlayerFactory - The Memory Player factory.
     */
    function MemoryPlayerController($rootScope, $scope, $location, $interval, MemoryPlayerFactory) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$location = $location;
        this.$interval = $interval;
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
         * @member {number} trackDuration - The duration of the current track.
         * @default 0
         */
        this.trackDuration = 0;
        /**
         * @memberof MemoryPlayerController
         * @member {boolean} isPaused - True if the player is paused and false if it is not.
         * @default true
         */
        this.isPaused = true;
        /**
         * @memberof MemoryPlayerController
         * @member {boolean} isShareable - True if the share link is enabled and false if it is not.
         * @default true
         */
        this.isShareable = true;
        /**
         * @memberof MemoryPlayerController
         * @member {string} shareLink - The share link URL.
         */
        this.shareLink = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        /**
         * @memberof MemoryPlayerController
         * @member {boolean} isTimeUsed - True if the share link start time is used and false if it is not.
         * @default false
         */
        this.isTimeUsed = false;
        /**
         * @memberof MemoryPlayerController
         * @member {number} shareLinkTime - The start time for the share link if used.
         * @default 0
         */
        this.shareLinkTime = '00:00';
        /**
         * @memberof MemoryPlayerController
         * @member {IPromise<any>} shareLinkTimer - The timer used to update share link time.
         * @default null
         */
        this.shareLinkTimer = null;
        /**
         * Core Angular event used to append query string for continuous playback.
         *
         * ?playlist=playlist&track=track&time=time&volume=volume&isMuted=isMuted&isPaused=isPaused
         *
         * playlist = id of the selected playlist
         * track = id of the selected track
         * time = track time returned by internal jPlayer event
         * volume = the player volume
         * isMuted = the player is muted (true) or not (false)
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
        /**
         * Event reporting that the directive is ready before initializing the player.
         *
         * @listens event:MemoryPlayer:directiveReady
         */
        this.$scope.$on('MemoryPlayer:directiveReady', function (event, remembered) {
            _this.MemoryPlayerFactory.fetchPlaylists(function () {
                _this.playlists = _this.MemoryPlayerFactory.getAllPlaylists();
                if (remembered === null) {
                    for (var playlist in _this.playlists) {
                        break;
                    }
                    _this.MemoryPlayerFactory.createPlayer(_this.playlists[playlist]._id);
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
            if (_this.isShareable) {
                _this.setShareLink('playlist', playlist._id);
            }
        });
        /**
         * Event reporting that the track has changed.
         *
         * @listens event:MemoryPlayer:trackChanged
         */
        this.$rootScope.$on('MemoryPlayer:trackChanged', function (event, track) {
            _this.selectedTrack = track;
            if (_this.isShareable) {
                _this.setShareLink('track', track._id);
                if (_this.isTimeUsed) {
                    _this.useTime();
                }
            }
        });
        /**
         * Event reporting that the selected track is loaded.
         *
         * @listens event:MemoryPlayer:trackLoaded
         */
        this.$rootScope.$on('MemoryPlayer:trackLoaded', function (event, duration) {
            _this.trackDuration = duration;
        });
        /**
         * Event reporting that the player has been paused.
         *
         * @listens event:MemoryPlayer:isPaused
         */
        this.$rootScope.$on('MemoryPlayer:isPaused', function (event, isPaused) {
            if (_this.isShareable && _this.shareLinkTimer !== null) {
                _this.$interval.cancel(_this.shareLinkTimer);
            }
            _this.isPaused = isPaused;
        });
        /**
         * Event reporting that the selected track is being played.
         *
         * @listens event:MemoryPlayer:trackPlayed
         */
        this.$rootScope.$on('MemoryPlayer:trackPlayed', function () {
            if (_this.isShareable) {
                if (_this.shareLinkTimer !== null) {
                    _this.$interval.cancel(_this.shareLinkTimer);
                }
                _this.shareLinkTimer = _this.$interval(function () {
                    _this.shareLinkTime = $.jPlayer.convertTime(_this.MemoryPlayerFactory.getTime());
                }, 1000);
            }
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
         * Click event to close an open dropdown.
         */
        angular.element(document).on('click.mp.dropdown', function (event) {
            var $dropdown = angular.element('.mp-dropdown');
            if (!angular.element(event.target).closest('.mp-dropdown-toggle').length && $dropdown.hasClass('open')) {
                $dropdown.removeClass('open');
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });
        /**
         * Click event to close an open dropdown on mobile devices.
         */
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', function (event) {
            var $dropdown = angular.element('.mp-dropdown');
            angular.element(event.target).remove();
            $dropdown.removeClass('open');
            $dropdown.find('a').attr('aria-expanded', 'false');
        });
        /**
         * Click event to prevent an open dropdown menu from closing on a click inside.
         */
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', function (event) {
            event.stopPropagation();
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
     * Updates the share link value specified by the key.
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} key - The key of the share option to be set.
     * @param {string | number} value - The value of the share option to be set.
     */
    MemoryPlayerController.prototype.setShareLink = function (key, value) {
        var shareLink = [], playlist = { name: 'playlist', value: null }, track = { name: 'track', value: null }, time = { name: 'time', value: 0 }, volume = { name: 'volume', value: 0.8 }, isMuted = { name: 'isMuted', value: false }, isPaused = { name: 'isPaused', value: true };
        var playerSettings = this.shareLink.split('?')[1] || null;
        // Converts share link from string to objects
        if (playerSettings !== null) {
            playerSettings = decodeURIComponent((playerSettings).replace(/\+/g, '%20'));
            var ps = playerSettings.split(/&(?!amp;)/g);
            // Stores all editable share option values from prior settings
            for (var i = 0, l = ps.length; i < l; i++) {
                var pair = ps[i].split('=');
                switch (pair[0]) {
                    case 'playlist':
                        playlist.value = pair[1];
                        break;
                    case 'track':
                        track.value = pair[1];
                        break;
                    case 'time':
                        time.value = pair[1];
                        break;
                }
            }
        }
        // Updates the edited share option value
        switch (key) {
            case 'playlist':
                playlist.value = value;
                break;
            case 'track':
                track.value = value;
                break;
            case 'time':
                var parsedTime = value;
                // Converts hh:mm:ss to seconds
                if (parsedTime.indexOf(':') > -1) {
                    parsedTime = parsedTime.split(':')
                        .reverse()
                        .map(Number)
                        .reduce(function (total, currentValue, index) {
                        return total + currentValue * Math.pow(60, index);
                    });
                }
                time.value = (parsedTime < this.trackDuration) ? parsedTime : 0;
                break;
        }
        // Stores all share option values in ordered array
        shareLink.push(playlist);
        shareLink.push(track);
        shareLink.push(time);
        shareLink.push(volume);
        shareLink.push(isMuted);
        shareLink.push(isPaused);
        // Sets share link string with updated values
        this.shareLink = this.shareLink.split('?')[0] + "?" + $.param(shareLink);
    };
    /**
     * Updates the share link time value when start time is used.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.useTime = function () {
        this.isTimeUsed = !this.isTimeUsed;
        if (this.isTimeUsed) {
            this.setShareLink('time', this.shareLinkTime);
        }
        else {
            this.setShareLink('time', '0');
        }
    };
    /**
     * Triggers update when start time is changed.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.updateTime = function () {
        if (this.shareLinkTimer !== null) {
            this.$interval.cancel(this.shareLinkTimer);
        }
        this.isTimeUsed = true;
        this.setShareLink('time', this.shareLinkTime);
    };
    /**
     * Cancels timer when start time input is focused.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.cancelTimer = function () {
        if (this.shareLinkTimer !== null) {
            this.$interval.cancel(this.shareLinkTimer);
        }
    };
    /**
     * Copies the share link to the clipboard.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerController.prototype.share = function () {
        var shareLink = document.getElementById('mp-share-link');
        shareLink.select();
        document.execCommand('copy');
    };
    /**
     * Toggles the playlists dropdown open and closed.
     * @memberof MemoryPlayerController
     * @instance
     * @param {JQueryEventObject} event - The jQuery event object from the element that triggered the event.
     */
    MemoryPlayerController.prototype.toggleDropdown = function (event) {
        var $trigger = angular.element(event.target), $parent = $trigger.closest('.mp-dropdown'), isActive = $parent.hasClass('open'), $backdrop = angular.element(document.createElement('div')).addClass('mp-dropdown-backdrop');
        // Resets dropdowns
        angular.element('.mp-dropdown-backdrop').remove();
        angular.element('.mp-dropdown-toggle').each(function () {
            if (!angular.element(this).closest('.mp-dropdown').hasClass('open'))
                return;
            angular.element(this).attr('aria-expanded', 'false');
            angular.element(this).closest('.mp-dropdown').removeClass('open');
        });
        // Opens the clicked dropdown if it was closed when triggered
        if (!isActive) {
            if ('ontouchstart' in document.documentElement) {
                $backdrop.appendTo('body');
            }
            $parent.addClass('open');
            $trigger.closest('.mp-dropdown-toggle').attr('aria-expanded', 'true');
        }
    };
    return MemoryPlayerController;
}());
MemoryPlayerController.instance = [
    '$rootScope',
    '$scope',
    '$location',
    '$interval',
    'MemoryPlayerFactory',
    MemoryPlayerController
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
