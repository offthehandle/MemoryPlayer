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
        this.$rootScope.$on('MemoryPlayer:playlistChanged', function (event, playlist) {
            _this.selectedPlaylist = playlist;
        });
        this.$rootScope.$on('MemoryPlayer:trackChanged', function (event, track) {
            _this.selectedTrack = track;
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
        angular.element(document).on('youtube.onVideoPlayed', function () {
            if (!_this.isPaused) {
                _this.play();
                _this.$scope.$apply();
            }
        });
        angular.element(document).on('click.mp.dropdown', function (e) {
            var $dropdown = angular.element('.mp-dropdown');
            if (!angular.element(e.target).hasClass('mp-dropdown-toggle') && $dropdown.hasClass('open')) {
                $dropdown.removeClass('open');
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', function (e) {
            var $dropdown = angular.element('.mp-dropdown');
            angular.element(e.target).remove();
            $dropdown.removeClass('open');
            $dropdown.find('a').attr('aria-expanded', 'false');
        });
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', function (e) {
            e.stopPropagation();
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
    MemoryPlayerController.prototype.toggleDropdown = function ($event) {
        var $trigger = angular.element($event.target), $parent = $trigger.closest('.mp-dropdown'), isActive = $parent.hasClass('open'), $backdrop = $(document.createElement('div')).addClass('mp-dropdown-backdrop');
        angular.element('.mp-dropdown-backdrop').remove();
        $parent.removeClass('open');
        $trigger.attr('aria-expanded', 'false');
        if (!isActive) {
            if ('ontouchstart' in document.documentElement) {
                $backdrop.appendTo('body');
            }
            $parent.addClass('open');
            $trigger.attr('aria-expanded', 'true');
        }
    };
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
