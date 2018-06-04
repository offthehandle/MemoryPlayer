/*! Memory Player module. Copyright 2015-2018 Adam De Lucia. */(function () {
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
    return MemoryPlayerAPI;
}());
MemoryPlayerAPI.instance = [
    '$http',
    '$log',
    MemoryPlayerAPI
];
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

var MemoryPlayerDirective = (function () {
    function MemoryPlayerDirective($location) {
        var _this = this;
        this.$location = $location;
        this.restrict = 'A';
        this.scope = true;
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
            scope.isShareable = scope.$eval(attrs['isShareable']) || false;
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
