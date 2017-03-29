/*! Memory Player module. Copyright 2015-2017 Adam De Lucia. */(function () {
    'use strict';
    angular.module('MemoryPlayer', []);
})();

var MemoryPlayerAPI = (function () {
    function MemoryPlayerAPI($http, $log) {
        this.$http = $http;
        this.$log = $log;
        this._endPoint = '/lib/memory-player/dist/json/playlists.json';
    }
    MemoryPlayerAPI.prototype._emptyAudioPlayer = function () {
        angular.element('#memory-player').remove();
    };
    ;
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this._endPoint)
            .then(function (response) {
            if (response.hasOwnProperty('data') && response.data !== null) {
                return response.data;
            }
            else {
                _this._emptyAudioPlayer();
                return null;
            }
        }).catch(function (error) {
            _this._emptyAudioPlayer();
            _this.$log.log('XHR Failed for getPlaylists.');
            if (error.data) {
                _this.$log.log(error.data);
            }
            return null;
        });
    };
    MemoryPlayerAPI.instance = [
        '$http',
        '$log',
        MemoryPlayerAPI
    ];
    return MemoryPlayerAPI;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerAPI', MemoryPlayerAPI.instance);
})();

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
            jPlayer: '#jquery_jplayer',
            cssSelectorAncestor: '#jp_container'
        };
        this._playerId = this._player.jPlayer;
        this._playerOptions = {
            swfPath: '/js',
            supplied: 'mp3',
            playing: function () {
                _this.$rootScope.$emit('MemoryPlayer:trackPlayed');
            },
            volumechange: function (e) {
                _this._volume = e.jPlayer.options.volume;
                _this._isMuted = e.jPlayer.options.muted;
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
        if (playerInfo !== null) {
            this.setTrack(playerInfo.track);
            angular.element(this._playerId).on($.jPlayer.event.ready, function () {
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

var MemoryPlayerDirective = (function () {
    function MemoryPlayerDirective($location) {
        var _this = this;
        this.$location = $location;
        this.restrict = 'A';
        this.scope = false;
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
            var playerState = _this.$location.search();
            if (playerState.hasOwnProperty('playlist') && playerState.hasOwnProperty('track') && playerState.hasOwnProperty('time') && playerState.hasOwnProperty('volume') && playerState.hasOwnProperty('isMuted') && playerState.hasOwnProperty('isPaused')) {
                var playerInfo = {
                    track: parseInt(playerState.track),
                    time: parseInt(playerState.time),
                    volume: parseFloat(playerState.volume),
                    isMuted: playerState.isMuted,
                    isPaused: playerState.isPaused
                };
                scope.$emit('MemoryPlayer:directiveReady', { playlist: playerState.playlist, info: playerInfo });
            }
            else {
                scope.$emit('MemoryPlayer:directiveReady', null);
            }
        };
    }
    MemoryPlayerDirective.instance = function () {
        var directive = function ($location) {
            return new MemoryPlayerDirective($location);
        };
        directive['$inject'] = [
            '$location'
        ];
        return directive;
    };
    return MemoryPlayerDirective;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
