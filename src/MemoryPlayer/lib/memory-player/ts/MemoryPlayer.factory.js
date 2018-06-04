var MemoryPlayerFactory = (function () {
    function MemoryPlayerFactory($rootScope, $timeout, MemoryPlayerAPI) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        this._playlists = null;
        this._selectedPlaylist = null;
        this._selectedTrack = null;
        this._volume = 0.8;
        this._isMuted = false;
        this.isPaused = true;
        this._playerInstance = null;
        this._player = {
            jPlayer: '#mp-jquery_jplayer',
            cssSelectorAncestor: '#mp-jp_container'
        };
        this._playerId = this._player.jPlayer;
        this._playerOptions = {
            swfPath: '/js',
            supplied: 'mp3',
            loadeddata: function (event) {
                _this.$rootScope.$emit('MemoryPlayer:trackLoaded', Math.floor(event.jPlayer.status.duration));
            },
            playing: function () {
                _this.$rootScope.$emit('MemoryPlayer:trackPlayed');
            },
            volumechange: function (event) {
                _this._volume = event.jPlayer.options.volume;
                _this._isMuted = event.jPlayer.options.muted;
            },
            ended: function () {
                _this.$rootScope.$emit('MemoryPlayer:trackEnded');
            },
            wmode: 'window',
            audioFullScreen: false,
            smoothPlayBar: false,
            keyEnabled: false,
            playlistOptions: {
                enableRemoveControls: false
            }
        };
    }
    MemoryPlayerFactory.instance = function () {
        var factory = function ($rootScope, $timeout, MemoryPlayerAPI) {
            return new MemoryPlayerFactory($rootScope, $timeout, MemoryPlayerAPI);
        };
        factory['$inject'] = [
            '$rootScope',
            '$timeout',
            'MemoryPlayerAPI'
        ];
        return factory;
    };
    MemoryPlayerFactory.prototype.getAllPlaylists = function () {
        return this._playlists;
    };
    ;
    MemoryPlayerFactory.prototype.setAllPlaylists = function (playlists) {
        this._playlists = playlists;
    };
    ;
    MemoryPlayerFactory.prototype.fetchPlaylists = function (callback) {
        var _this = this;
        this.MemoryPlayerAPI.getPlaylists()
            .then(function (response) {
            if (response !== null) {
                _this.setAllPlaylists(response);
                (angular.isFunction(callback)) ? callback() : false;
            }
        });
    };
    ;
    MemoryPlayerFactory.prototype.autoPlay = function (isAutoPlayed) {
        if (this._playerInstance !== null) {
            this._playerInstance.option('autoPlay', isAutoPlayed);
        }
    };
    ;
    MemoryPlayerFactory.prototype.getTime = function () {
        return Math.floor(angular.element(this._playerId).data('jPlayer').status.currentTime);
    };
    ;
    MemoryPlayerFactory.prototype.getVolume = function () {
        return this._volume.toFixed(2);
    };
    ;
    MemoryPlayerFactory.prototype.getIsMuted = function () {
        return this._isMuted;
    };
    ;
    MemoryPlayerFactory.prototype.getTrack = function () {
        return this._selectedTrack;
    };
    ;
    MemoryPlayerFactory.prototype.getPlaylist = function () {
        return this._selectedPlaylist;
    };
    ;
    MemoryPlayerFactory.prototype.getTrackById = function () {
        return this._selectedTrack._id;
    };
    ;
    MemoryPlayerFactory.prototype.getPlaylistById = function () {
        return this._selectedPlaylist._id;
    };
    ;
    MemoryPlayerFactory.prototype.setTrack = function (track) {
        this._selectedTrack = this.getPlaylist().playlist[track];
        this.$rootScope.$emit('MemoryPlayer:trackChanged', this._selectedTrack);
    };
    ;
    MemoryPlayerFactory.prototype.setPlaylist = function (album) {
        this._selectedPlaylist = this.getAllPlaylists()[album];
        this.setTrack(0);
        if (this._playerInstance !== null) {
            this._playerInstance.setPlaylist(this._selectedPlaylist.playlist);
            this.autoPlay(true);
        }
        this.$rootScope.$emit('MemoryPlayer:playlistChanged', this._selectedPlaylist);
    };
    ;
    MemoryPlayerFactory.prototype.createPlayer = function (album, playerInfo) {
        var _this = this;
        this.setPlaylist(album);
        this._playerInstance = new jPlayerPlaylist(this._player, this.getPlaylist().playlist, this._playerOptions);
        if (angular.isDefined(playerInfo)) {
            this.setTrack(playerInfo.track);
            angular.element(this._playerId).on($.jPlayer.event.ready, function () {
                angular.element('#memory-player').removeClass('mp-loading');
                _this.$timeout(function () {
                    _this._playerInstance.select(playerInfo.track);
                    angular.element(_this._playerId).jPlayer('volume', playerInfo.volume);
                    if (playerInfo.isMuted !== 'false') {
                        angular.element(_this._playerId).jPlayer('mute');
                        _this._isMuted = true;
                    }
                    if (playerInfo.isPaused === 'false') {
                        angular.element(_this._playerId).jPlayer('play', playerInfo.time);
                    }
                    else {
                        angular.element(_this._playerId).jPlayer('pause', playerInfo.time);
                    }
                }, 400);
            });
        }
        else {
            angular.element(this._playerId).on($.jPlayer.event.ready, function () {
                angular.element('#memory-player').removeClass('mp-loading');
            });
        }
    };
    ;
    MemoryPlayerFactory.prototype.play = function () {
        (this.isPaused) ? angular.element(this._playerId).jPlayer('play') : angular.element(this._playerId).jPlayer('pause');
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.$rootScope.$emit('MemoryPlayer:isPaused', this.isPaused);
        }
    };
    ;
    MemoryPlayerFactory.prototype.cueTrack = function (track) {
        if (track !== this.getTrackById()) {
            this.setTrack(track);
            this._playerInstance.play(track);
        }
        else {
            this.play();
        }
    };
    ;
    MemoryPlayerFactory.prototype.next = function () {
        var trackId = this.getTrackById();
        if (trackId + 1 < this.getPlaylist().trackCount) {
            this.setTrack(trackId + 1);
            this._playerInstance.next();
        }
    };
    ;
    MemoryPlayerFactory.prototype.previous = function () {
        var trackId = this.getTrackById();
        if (trackId > 0) {
            this.setTrack(trackId - 1);
            this._playerInstance.previous();
        }
    };
    ;
    MemoryPlayerFactory.prototype.maxVolume = function () {
        if (this._isMuted) {
            angular.element(this._playerId).jPlayer('unmute');
            this._isMuted = !this._isMuted;
        }
        angular.element(this._playerId).jPlayer('volume', 1);
    };
    ;
    MemoryPlayerFactory.prototype.mute = function () {
        (this.getIsMuted()) ? angular.element(this._playerId).jPlayer('unmute') : angular.element(this._playerId).jPlayer('mute');
        this._isMuted = !this.getIsMuted();
    };
    ;
    MemoryPlayerFactory.prototype.trackPlayedEvent = function (callback) {
        this.isPaused = false;
        angular.element(this._playerId).trigger('MemoryPlayer.trackPlayed');
        if (angular.isFunction(callback)) {
            callback({ isPaused: this.isPaused });
        }
    };
    ;
    MemoryPlayerFactory.prototype.trackEndedEvent = function (callback) {
        var trackId = this.getTrackById();
        if (trackId + 1 === this.getPlaylist().trackCount) {
            this.setTrack(0);
            this.isPaused = true;
            this._playerInstance.select(0);
        }
        else {
            this.setTrack(trackId + 1);
        }
        if (angular.isFunction(callback)) {
            callback({ track: this.getTrack(), isPaused: this.isPaused });
        }
    };
    ;
    return MemoryPlayerFactory;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .factory('MemoryPlayerFactory', MemoryPlayerFactory.instance());
})();
