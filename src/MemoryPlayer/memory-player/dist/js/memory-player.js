(function () {
    'use strict';
    angular.module('MemoryPlayer', []);
})();

var MemoryPlayerProvider = (function () {
    function MemoryPlayerProvider() {
    }
    MemoryPlayerProvider.prototype.$get = function () {
        var _this = this;
        return {
            ids: this.JPlayerIds,
            create: function (tracks) {
                if (angular.isUndefined(_this.JPlayer)) {
                    _this.JPlayer = new jPlayerPlaylist(_this.JPlayerIds, tracks, _this.JPlayerOptions);
                }
            },
            instance: function () {
                return _this.JPlayer;
            }
        };
    };
    MemoryPlayerProvider.prototype.$setIds = function (ids) {
        this.JPlayerIds = ids;
    };
    MemoryPlayerProvider.prototype.$setOptions = function (options) {
        this.JPlayerOptions = options;
    };
    return MemoryPlayerProvider;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .provider('JPlayer', MemoryPlayerProvider);
})();

var MemoryPlayerConfig = (function () {
    function MemoryPlayerConfig($locationProvider, JPlayerProvider) {
        this.$locationProvider = $locationProvider;
        this.JPlayerProvider = JPlayerProvider;
        this.JPlayerIds = {
            jPlayer: '#mp-jquery_jplayer',
            cssSelectorAncestor: '#mp-jp_container'
        };
        this.JPlayerOptions = {
            swfPath: '/Scripts/jquery.jplayer.swf',
            supplied: 'mp3',
            wmode: 'window',
            audioFullScreen: false,
            smoothPlayBar: false,
            keyEnabled: false,
            playlistOptions: {
                enableRemoveControls: false,
                displayTime: 0,
                addTime: 0,
                removeTime: 0,
                shuffleTime: 0
            }
        };
        this.JPlayerProvider.$setIds(this.JPlayerIds);
        this.JPlayerProvider.$setOptions(this.JPlayerOptions);
        this.$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
    MemoryPlayerConfig.instance = [
        '$locationProvider',
        'JPlayerProvider',
        MemoryPlayerConfig
    ];
    return MemoryPlayerConfig;
}());
var MemoryPlayerRun = (function () {
    function MemoryPlayerRun($rootScope, $window) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.$rootScope.$on('$locationChangeSuccess', function ($event, newUrl, oldUrl) {
            if (newUrl !== oldUrl) {
                _this.$window.location.href = newUrl;
            }
        });
    }
    MemoryPlayerRun.instance = [
        '$rootScope',
        '$window',
        MemoryPlayerRun
    ];
    return MemoryPlayerRun;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .config(MemoryPlayerConfig.instance)
        .run(MemoryPlayerRun.instance);
})();

var MemoryPlayerAPI = (function () {
    function MemoryPlayerAPI($http, $log) {
        this.$http = $http;
        this.$log = $log;
        this.playlists = '/memory-player/dist/json/playlists.json';
    }
    MemoryPlayerAPI.prototype.removePlayer = function () {
        angular.element('#memory-player').remove();
    };
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this.playlists)
            .then(function (response) {
            if (response.hasOwnProperty('data') && response.data !== null) {
                return response.data;
            }
            else {
                _this.removePlayer();
                return null;
            }
        }).catch(function (error) {
            _this.removePlayer();
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
            angular.element(this.jPlayerId).trigger('MP.TrackPlayed');
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
            angular.element(this.jPlayerId).trigger('MP.TrackPlayed');
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
        angular.element(this.jPlayerId).trigger('MP.TrackPlayed');
    };
    MemoryPlayerControls.prototype.selectTrack = function (trackIndex) {
        if (trackIndex !== this.MemoryPlayerState.getTrackId()) {
            this.MemoryPlayerState.setTrack(trackIndex);
            this.JPlayer.instance().play(trackIndex);
            this.MemoryPlayerState.setIsPaused(false);
            angular.element(this.jPlayerId).trigger('MP.TrackPlayed');
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
        var $trigger = angular.element($event.target), $parent = $trigger.closest('.mp-dropdown'), isActive = $parent.hasClass('open'), $backdrop = angular.element(document.createElement('div')).addClass('mp-dropdown-backdrop');
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

var MemoryPlayerState = (function () {
    function MemoryPlayerState(JPlayer) {
        this.JPlayer = JPlayer;
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        this.isMuted = false;
        this.isPaused = true;
        this.volume = 0.80;
    }
    MemoryPlayerState.prototype.getIsMuted = function () {
        return this.isMuted;
    };
    MemoryPlayerState.prototype.setIsMuted = function (isMuted) {
        this.isMuted = isMuted;
    };
    MemoryPlayerState.prototype.getIsPaused = function () {
        return this.isPaused;
    };
    MemoryPlayerState.prototype.setIsPaused = function (isPaused) {
        this.isPaused = isPaused;
    };
    MemoryPlayerState.prototype.getPlaylist = function () {
        return this.currentPlaylist;
    };
    MemoryPlayerState.prototype.setPlaylist = function (playlistName) {
        this.currentPlaylist = this.playlists[playlistName];
        this.setTrack(0);
    };
    MemoryPlayerState.prototype.getPlaylistId = function () {
        return this.currentPlaylist._id;
    };
    MemoryPlayerState.prototype.getPlaylists = function () {
        return this.playlists;
    };
    MemoryPlayerState.prototype.setPlaylists = function (playlists) {
        this.playlists = playlists;
    };
    MemoryPlayerState.prototype.getTime = function () {
        return Math.floor(angular.element(this.jPlayerId).data('jPlayer').status.currentTime);
    };
    MemoryPlayerState.prototype.getTrack = function () {
        return this.currentTrack;
    };
    MemoryPlayerState.prototype.setTrack = function (trackIndex) {
        this.currentTrack = this.currentPlaylist.tracks[trackIndex];
    };
    MemoryPlayerState.prototype.getTrackId = function () {
        return this.currentTrack._id;
    };
    MemoryPlayerState.prototype.getVolume = function () {
        return this.volume.toFixed(2);
    };
    MemoryPlayerState.prototype.setVolume = function (volume) {
        this.volume = volume;
    };
    MemoryPlayerState.instance = [
        'JPlayer',
        MemoryPlayerState
    ];
    return MemoryPlayerState;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerState', MemoryPlayerState.instance);
})();

var MemoryPlayerSharing = (function () {
    function MemoryPlayerSharing($rootScope, JPlayer, MemoryPlayerState) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerState = MemoryPlayerState;
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        this.isTimeUsed = false;
        this.sharelink = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        this.sharelinkTime = '00:00';
        if (angular.isDefined(this.MemoryPlayerState.getPlaylist())) {
            this.setShareVal('playlist', this.MemoryPlayerState.getPlaylist()._id);
        }
        if (angular.isDefined(this.MemoryPlayerState.getTrack())) {
            this.setShareVal('track', this.MemoryPlayerState.getTrack()._id);
        }
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylist();
        }, function (newPlaylist, oldPlaylist) {
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {
                _this.setShareVal('playlist', newPlaylist._id);
            }
        });
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getTrack();
        }, function (newTrack, oldTrack) {
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {
                _this.setShareVal('track', newTrack._id);
                if (_this.isTimeUsed) {
                    _this.useTime();
                }
            }
        });
        this.$rootScope.$on('MP:Ready', function ($event) {
            angular.element(_this.jPlayerId).bind($.jPlayer.event.loadeddata, function (event) {
                _this.$rootScope.$evalAsync(function () {
                    _this.trackDuration = event.jPlayer.status.duration;
                });
            });
        });
    }
    MemoryPlayerSharing.prototype.cancelTimer = function () {
        angular.element(this.jPlayerId).unbind($.jPlayer.event.timeupdate);
    };
    MemoryPlayerSharing.prototype.setShareVal = function (key, value) {
        var sharelink = [], playlist = { name: 'playlist', value: null }, track = { name: 'track', value: null }, time = { name: 'time', value: 0 }, volume = { name: 'volume', value: 0.8 }, isMuted = { name: 'isMuted', value: false }, isPaused = { name: 'isPaused', value: false };
        var settings = this.sharelink.split('?')[1] || null;
        if (angular.isString(settings)) {
            settings = decodeURIComponent((settings).replace(/\+/g, '%20'));
            var params = settings.split(/&(?!amp;)/g);
            params.map(function (param) {
                var setting = param.split('=');
                switch (setting[0]) {
                    case 'playlist':
                        playlist.value = setting[1];
                        break;
                    case 'track':
                        track.value = setting[1];
                        break;
                    case 'time':
                        time.value = setting[1];
                        break;
                }
            });
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
        sharelink.push(playlist);
        sharelink.push(track);
        sharelink.push(time);
        sharelink.push(volume);
        sharelink.push(isMuted);
        sharelink.push(isPaused);
        var updatedSettings = $.param(sharelink);
        this.sharelink = this.sharelink.split('?')[0] + "?" + updatedSettings;
    };
    MemoryPlayerSharing.prototype.share = function () {
        var sharelink = document.getElementById('mp-share-link');
        sharelink.select();
        document.execCommand('copy');
    };
    MemoryPlayerSharing.prototype.updateTime = function (updatedTime) {
        this.isTimeUsed = true;
        this.setShareVal('time', updatedTime);
    };
    MemoryPlayerSharing.prototype.useTime = function () {
        this.isTimeUsed = !this.isTimeUsed;
    };
    MemoryPlayerSharing.instance = [
        '$rootScope',
        'JPlayer',
        'MemoryPlayerState',
        MemoryPlayerSharing
    ];
    return MemoryPlayerSharing;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerSharing', MemoryPlayerSharing.instance);
})();

var MemoryPlayerController = (function () {
    function MemoryPlayerController($scope, MemoryPlayerState, MemoryPlayerControls, MemoryPlayerSharing) {
        var _this = this;
        this.$scope = $scope;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        this.isShareable = true;
        this.playlists = this.MemoryPlayerState.getPlaylists();
        this.currentPlaylist = this.MemoryPlayerState.getPlaylist();
        this.currentTrack = this.MemoryPlayerState.getTrack();
        this.isPaused = this.MemoryPlayerState.getIsPaused();
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylists();
        }, function (newPlaylists, oldPlaylists) {
            if (angular.isDefined(newPlaylists) && newPlaylists !== oldPlaylists) {
                _this.playlists = newPlaylists;
            }
        });
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylist();
        }, function (newPlaylist, oldPlaylist) {
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {
                _this.currentPlaylist = newPlaylist;
            }
        });
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getTrack();
        }, function (newTrack, oldTrack) {
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {
                _this.currentTrack = newTrack;
            }
        });
        this.$scope.$watch(function () {
            return _this.MemoryPlayerState.getIsPaused();
        }, function (newState, oldState) {
            if (angular.isDefined(newState) && newState !== oldState) {
                _this.isPaused = newState;
            }
        });
    }
    MemoryPlayerController.prototype.cancelTimer = function () {
        this.MemoryPlayerSharing.cancelTimer();
    };
    MemoryPlayerController.prototype.maxVolume = function () {
        this.MemoryPlayerControls.maxVolume();
    };
    MemoryPlayerController.prototype.mute = function () {
        this.MemoryPlayerControls.mute();
    };
    MemoryPlayerController.prototype.next = function () {
        this.MemoryPlayerControls.next();
    };
    MemoryPlayerController.prototype.play = function () {
        this.MemoryPlayerControls.play();
    };
    MemoryPlayerController.prototype.previous = function () {
        this.MemoryPlayerControls.previous();
    };
    MemoryPlayerController.prototype.selectPlaylist = function (playlistName) {
        this.MemoryPlayerControls.selectPlaylist(playlistName);
    };
    MemoryPlayerController.prototype.selectTrack = function (trackIndex) {
        this.MemoryPlayerControls.selectTrack(trackIndex);
    };
    MemoryPlayerController.prototype.share = function () {
        this.MemoryPlayerSharing.share();
    };
    MemoryPlayerController.prototype.toggleDropdown = function ($event) {
        this.MemoryPlayerControls.toggleDropdown($event);
    };
    MemoryPlayerController.prototype.updateTime = function (updatedTime) {
        this.MemoryPlayerSharing.updateTime(updatedTime);
    };
    MemoryPlayerController.prototype.useTime = function () {
        this.MemoryPlayerSharing.useTime();
    };
    MemoryPlayerController.instance = [
        '$scope',
        'MemoryPlayerState',
        'MemoryPlayerControls',
        'MemoryPlayerSharing',
        MemoryPlayerController
    ];
    return MemoryPlayerController;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();

var MPPlayerController = (function () {
    function MPPlayerController($rootScope, $location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        var state = this.$location.search();
        this.MemoryPlayerAPI.getPlaylists().then(function (response) {
            _this.MemoryPlayerState.setPlaylists(response);
            if (_this.isRestartable(state)) {
                var settings = {
                    track: parseInt(state.track),
                    time: parseInt(state.time),
                    volume: parseFloat(state.volume),
                    isMuted: state.isMuted,
                    isPaused: state.isPaused,
                };
                _this.MemoryPlayerControls.showtime(state.playlist, settings);
            }
            else {
                var playlist = Object.keys(response)[0];
                _this.MemoryPlayerControls.showtime(response[playlist]._id);
            }
        });
        this.unbindLocationChange = this.$rootScope.$on('$locationChangeStart', function ($event, newUrl, oldUrl) {
            if (newUrl !== oldUrl) {
                var newUrlPath = _this.$location.url();
                _this.$location.path(newUrlPath.split('?')[0]).search({
                    playlist: _this.MemoryPlayerState.getPlaylistId(),
                    track: _this.MemoryPlayerState.getTrackId(),
                    time: _this.MemoryPlayerState.getTime(),
                    volume: _this.MemoryPlayerState.getVolume(),
                    isMuted: _this.MemoryPlayerState.getIsMuted(),
                    isPaused: _this.MemoryPlayerState.getIsPaused()
                });
            }
        });
    }
    MPPlayerController.prototype.isRestartable = function (state) {
        var isRestartable = true;
        if (!state.hasOwnProperty('isMuted')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('isPaused')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('playlist')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('time')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('track')) {
            isRestartable = false;
        }
        if (!state.hasOwnProperty('volume')) {
            isRestartable = false;
        }
        return isRestartable;
    };
    MPPlayerController.prototype.$onDestroy = function () {
        this.unbindLocationChange();
    };
    MPPlayerController.instance = [
        '$rootScope',
        '$location',
        'MemoryPlayerAPI',
        'MemoryPlayerState',
        'MemoryPlayerControls',
        MPPlayerController
    ];
    return MPPlayerController;
}());
var MemoryPlayerComponent = (function () {
    function MemoryPlayerComponent() {
        this.controller = MPPlayerController.instance;
        this.controllerAs = 'player';
        this.bindings = {
            cancelTimer: '&',
            currentPlaylist: '<',
            currentTrack: '<',
            isPaused: '<',
            isShareable: '<',
            maxVolume: '&',
            mute: '&',
            next: '&',
            play: '&',
            playlists: '<',
            previous: '&',
            selectPlaylist: '&',
            selectTrack: '&',
            share: '&',
            toggleDropdown: '&',
            updateTime: '&',
            useTime: '&'
        };
        this.templateUrl = '/memory-player/dist/html/memory-player.html';
    }
    return MemoryPlayerComponent;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .component('memoryPlayer', new MemoryPlayerComponent());
})();

var MPSharingController = (function () {
    function MPSharingController($rootScope, JPlayer, MemoryPlayerSharing) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        this.sharelink = this.MemoryPlayerSharing.sharelink;
        this.isTimeUsed = false;
        this.sharelinkTime = '00:00';
        this.unbindSharelink = this.$rootScope.$watch(function () {
            return _this.MemoryPlayerSharing.sharelink;
        }, function (newSharelink, oldSharelink) {
            if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {
                _this.sharelink = newSharelink;
            }
        });
        this.unbindIsTimeUsed = this.$rootScope.$watch(function () {
            return _this.MemoryPlayerSharing.isTimeUsed;
        }, function (newValue, oldValue) {
            if (angular.isDefined(newValue) && newValue !== oldValue) {
                _this.isTimeUsed = newValue;
                if (_this.isTimeUsed) {
                    angular.element(_this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, function (event) {
                        _this.$rootScope.$evalAsync(function () {
                            _this.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                            _this.MemoryPlayerSharing.setShareVal('time', _this.sharelinkTime);
                        });
                    });
                }
                else {
                    angular.element(_this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);
                    _this.sharelinkTime = '00:00';
                    _this.MemoryPlayerSharing.setShareVal('time', '0');
                }
            }
        });
    }
    MPSharingController.prototype.$onDestroy = function () {
        this.unbindSharelink();
        this.unbindIsTimeUsed();
    };
    MPSharingController.instance = [
        '$rootScope',
        'JPlayer',
        'MemoryPlayerSharing',
        MPSharingController
    ];
    return MPSharingController;
}());
var MPSharingComponent = (function () {
    function MPSharingComponent() {
        this.controller = MPSharingController.instance;
        this.controllerAs = 'sharing';
        this.bindings = {
            currentTrack: '<',
            cancelTimer: '&',
            share: '&',
            toggleDropdown: '&',
            updateTime: '&',
            useTime: '&'
        };
        this.templateUrl = '/memory-player/dist/html/mp-sharing.html';
    }
    return MPSharingComponent;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .component('mpSharing', new MPSharingComponent());
})();
