var MemoryPlayerControls = (function () {
    function MemoryPlayerControls($rootScope, JPlayer, MemoryPlayerState) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerState = MemoryPlayerState;
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        this.$rootScope.$on('MP:Ready', function ($event) {
            angular.element(_this.jPlayerId).bind($.jPlayer.event.volumechange, function (event) {
                _this.MemoryPlayerState.setVolume(event.jPlayer.options.volume);
                _this.MemoryPlayerState.setIsMuted(event.jPlayer.options.muted);
            });
            angular.element(_this.jPlayerId).bind($.jPlayer.event.ended, function () {
                if (!_this.isEnd()) {
                    var trackId_1 = (_this.MemoryPlayerState.getTrackId() + 1);
                    _this.$rootScope.$evalAsync(function () {
                        _this.MemoryPlayerState.setTrack(trackId_1);
                    });
                }
                else {
                    _this.$rootScope.$evalAsync(function () {
                        _this.selectTrack(0);
                    });
                }
            });
        });
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', function (event) {
            event.stopPropagation();
        });
        angular.element(document).on('click.mp.dropdown', function (event) {
            var $dropdown = angular.element('.mp-dropdown');
            if (!angular.element(event.target).closest('.mp-dropdown-toggle').length && $dropdown.hasClass('open')) {
                $dropdown.removeClass('open');
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', function (event) {
            angular.element(event.target).remove();
            var $dropdown = angular.element('.mp-dropdown');
            $dropdown.removeClass('open');
            $dropdown.find('a').attr('aria-expanded', 'false');
        });
        angular.element(document).on('YT.VideoPlayed', function () {
            if (!_this.MemoryPlayerState.getIsPaused()) {
                _this.$rootScope.$evalAsync(function () {
                    _this.play();
                });
            }
        });
    }
    MemoryPlayerControls.prototype.isEnd = function () {
        var trackId = (this.MemoryPlayerState.getTrackId() + 1), currentPlaylist = this.MemoryPlayerState.getPlaylist();
        return !(trackId < currentPlaylist.trackCount);
    };
    MemoryPlayerControls.prototype.maxVolume = function () {
        if (this.MemoryPlayerState.getIsMuted()) {
            angular.element(this.jPlayerId).jPlayer('unmute');
            this.MemoryPlayerState.setIsMuted(false);
        }
        angular.element(this.jPlayerId).jPlayer('volume', 1);
    };
    MemoryPlayerControls.prototype.mute = function () {
        var isMuted = this.MemoryPlayerState.getIsMuted();
        (isMuted) ? angular.element(this.jPlayerId).jPlayer('unmute') : angular.element(this.jPlayerId).jPlayer('mute');
        this.MemoryPlayerState.setIsMuted(!isMuted);
    };
    MemoryPlayerControls.prototype.next = function () {
        if (!this.isEnd()) {
            var trackId = (this.MemoryPlayerState.getTrackId() + 1);
            this.MemoryPlayerState.setTrack(trackId);
            this.JPlayer.instance().next();
            this.MemoryPlayerState.setIsPaused(false);
        }
    };
    MemoryPlayerControls.prototype.play = function () {
        var isPaused = this.MemoryPlayerState.getIsPaused();
        (isPaused) ? this.JPlayer.instance().play() : this.JPlayer.instance().pause();
        this.MemoryPlayerState.setIsPaused(!isPaused);
        if (isPaused) {
            angular.element(this.jPlayerId).trigger('MP.TrackPlayed');
        }
    };
    MemoryPlayerControls.prototype.previous = function () {
        var trackId = (this.MemoryPlayerState.getTrackId() - 1);
        if (trackId >= 0) {
            this.MemoryPlayerState.setTrack(trackId);
            this.JPlayer.instance().previous();
            this.MemoryPlayerState.setIsPaused(false);
        }
    };
    MemoryPlayerControls.prototype.restart = function (settings) {
        this.MemoryPlayerState.setTrack(settings.track);
        this.JPlayer.instance().select(settings.track);
        angular.element(this.jPlayerId).jPlayer('volume', settings.volume);
        if (settings.isMuted === true) {
            angular.element(this.jPlayerId).jPlayer('mute');
            this.MemoryPlayerState.setIsMuted(true);
        }
        var playState = 'pause';
        if (settings.isPaused !== true) {
            playState = 'play';
            this.MemoryPlayerState.setIsPaused(false);
        }
        angular.element(this.jPlayerId).jPlayer(playState, settings.time);
    };
    MemoryPlayerControls.prototype.selectPlaylist = function (playlistName) {
        this.MemoryPlayerState.setPlaylist(playlistName);
        var tracks = this.MemoryPlayerState.getPlaylist().tracks;
        this.JPlayer.instance().setPlaylist(tracks);
        this.JPlayer.instance().play();
        this.MemoryPlayerState.setIsPaused(false);
    };
    MemoryPlayerControls.prototype.selectTrack = function (trackIndex) {
        if (trackIndex !== this.MemoryPlayerState.getTrackId()) {
            this.MemoryPlayerState.setTrack(trackIndex);
            this.JPlayer.instance().play(trackIndex);
            this.MemoryPlayerState.setIsPaused(false);
        }
        else {
            this.play();
        }
    };
    MemoryPlayerControls.prototype.showtime = function (playlist, settings) {
        var _this = this;
        this.MemoryPlayerState.setPlaylist(playlist);
        this.JPlayer.create(this.MemoryPlayerState.getPlaylist().tracks);
        angular.element(this.jPlayerId).bind($.jPlayer.event.ready, function () {
            if (angular.isDefined(settings)) {
                _this.restart(settings);
            }
            _this.$rootScope.$broadcast('MP:Ready');
            angular.element('#memory-player').removeClass('mp-loading');
        });
    };
    MemoryPlayerControls.prototype.toggleDropdown = function ($event) {
        var $trigger = angular.element(event.target), $parent = $trigger.closest('.mp-dropdown'), isActive = $parent.hasClass('open'), $backdrop = angular.element(document.createElement('div')).addClass('mp-dropdown-backdrop');
        angular.element('.mp-dropdown-backdrop').remove();
        angular.element('.mp-dropdown-toggle').each(function () {
            if (!angular.element(this).closest('.mp-dropdown').hasClass('open'))
                return;
            angular.element(this).closest('.mp-dropdown').removeClass('open');
            angular.element(this).attr('aria-expanded', 'false');
        });
        if (!isActive) {
            if ('ontouchstart' in document.documentElement) {
                $backdrop.appendTo('body');
            }
            $parent.addClass('open');
            $trigger.closest('.mp-dropdown-toggle').attr('aria-expanded', 'true');
        }
    };
    MemoryPlayerControls.instance = [
        '$rootScope',
        'JPlayer',
        'MemoryPlayerState',
        MemoryPlayerControls
    ];
    return MemoryPlayerControls;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerControls', MemoryPlayerControls.instance);
})();
