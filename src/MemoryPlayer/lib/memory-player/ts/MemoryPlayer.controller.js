var MemoryPlayerController = (function () {
    function MemoryPlayerController($rootScope, $scope, $location, $interval, MemoryPlayerFactory) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$location = $location;
        this.$interval = $interval;
        this.MemoryPlayerFactory = MemoryPlayerFactory;
        this.playlists = null;
        this.selectedPlaylist = null;
        this.selectedTrack = null;
        this.trackDuration = 0;
        this.isPaused = true;
        this.isShareable = true;
        this.shareLink = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        this.isTimeUsed = false;
        this.shareLinkTime = '00:00';
        this.shareLinkTimer = null;
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
                    _this.MemoryPlayerFactory.createPlayer(_this.playlists[playlist]._id);
                }
                else {
                    _this.MemoryPlayerFactory.createPlayer(remembered.playlist, remembered.info);
                }
            });
        });
        this.$rootScope.$on('MemoryPlayer:playlistChanged', function (event, playlist) {
            _this.selectedPlaylist = playlist;
            if (_this.isShareable) {
                _this.setShareLink('playlist', playlist._id);
            }
        });
        this.$rootScope.$on('MemoryPlayer:trackChanged', function (event, track) {
            _this.selectedTrack = track;
            if (_this.isShareable) {
                _this.setShareLink('track', track._id);
                if (_this.isTimeUsed) {
                    _this.useTime();
                }
            }
        });
        this.$rootScope.$on('MemoryPlayer:trackLoaded', function (event, duration) {
            _this.trackDuration = duration;
        });
        this.$rootScope.$on('MemoryPlayer:isPaused', function (event, isPaused) {
            if (_this.isShareable && _this.shareLinkTimer !== null) {
                _this.$interval.cancel(_this.shareLinkTimer);
            }
            _this.isPaused = isPaused;
        });
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
        this.$rootScope.$on('MemoryPlayer:trackEnded', function () {
            _this.MemoryPlayerFactory.trackEndedEvent(function (playerInfo) {
                _this.selectedTrack = playerInfo.track;
                _this.isPaused = playerInfo.isPaused;
                _this.$scope.$apply();
            });
        });
        angular.element(document).on('youtube.onVideoPlayed', function () {
            if (!_this.isPaused) {
                _this.play();
                _this.$scope.$apply();
            }
        });
        angular.element(document).on('click.mp.dropdown', function (event) {
            var $dropdown = angular.element('.mp-dropdown');
            if (!angular.element(event.target).closest('.mp-dropdown-toggle').length && $dropdown.hasClass('open')) {
                $dropdown.removeClass('open');
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', function (event) {
            var $dropdown = angular.element('.mp-dropdown');
            angular.element(event.target).remove();
            $dropdown.removeClass('open');
            $dropdown.find('a').attr('aria-expanded', 'false');
        });
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', function (event) {
            event.stopPropagation();
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
    MemoryPlayerController.prototype.setShareLink = function (key, value) {
        var shareLink = [], playlist = { name: 'playlist', value: null }, track = { name: 'track', value: null }, time = { name: 'time', value: 0 }, volume = { name: 'volume', value: 0.8 }, isMuted = { name: 'isMuted', value: false }, isPaused = { name: 'isPaused', value: true };
        var playerSettings = this.shareLink.split('?')[1] || null;
        if (playerSettings !== null) {
            playerSettings = decodeURIComponent((playerSettings).replace(/\+/g, '%20'));
            var ps = playerSettings.split(/&(?!amp;)/g);
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
        switch (key) {
            case 'playlist':
                playlist.value = value;
                break;
            case 'track':
                track.value = value;
                break;
            case 'time':
                var parsedTime = value;
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
        shareLink.push(playlist);
        shareLink.push(track);
        shareLink.push(time);
        shareLink.push(volume);
        shareLink.push(isMuted);
        shareLink.push(isPaused);
        this.shareLink = this.shareLink.split('?')[0] + "?" + $.param(shareLink);
    };
    MemoryPlayerController.prototype.useTime = function () {
        this.isTimeUsed = !this.isTimeUsed;
        if (this.isTimeUsed) {
            this.setShareLink('time', this.shareLinkTime);
        }
        else {
            this.setShareLink('time', '0');
        }
    };
    MemoryPlayerController.prototype.updateTime = function () {
        if (this.shareLinkTimer !== null) {
            this.$interval.cancel(this.shareLinkTimer);
        }
        this.isTimeUsed = true;
        this.setShareLink('time', this.shareLinkTime);
    };
    MemoryPlayerController.prototype.cancelTimer = function () {
        if (this.shareLinkTimer !== null) {
            this.$interval.cancel(this.shareLinkTimer);
        }
    };
    MemoryPlayerController.prototype.share = function () {
        var shareLink = document.getElementById('mp-share-link');
        shareLink.select();
        document.execCommand('copy');
    };
    MemoryPlayerController.prototype.toggleDropdown = function (event) {
        var $trigger = angular.element(event.target), $parent = $trigger.closest('.mp-dropdown'), isActive = $parent.hasClass('open'), $backdrop = angular.element(document.createElement('div')).addClass('mp-dropdown-backdrop');
        angular.element('.mp-dropdown-backdrop').remove();
        angular.element('.mp-dropdown-toggle').each(function () {
            if (!angular.element(this).closest('.mp-dropdown').hasClass('open'))
                return;
            angular.element(this).attr('aria-expanded', 'false');
            angular.element(this).closest('.mp-dropdown').removeClass('open');
        });
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
