/*! Memory Player module. Copyright 2015-2018 Adam De Lucia. */(function () {
    'use strict';
    angular.module('MemoryPlayer', []);
})();

var MemoryPlayerProvider = (function () {
    function MemoryPlayerProvider() {
    }
    MemoryPlayerProvider.prototype.$get = function () {
        var _this = this;
        var JPlayer;
        return {
            create: function (playlist) {
                JPlayer = new jPlayerPlaylist(_this.jPlayerIds, playlist, _this.jPlayerOptions);
            },
            ids: this.jPlayerIds,
            instance: function () {
                return JPlayer;
            }
        };
    };
    MemoryPlayerProvider.prototype.$setIds = function (ids) {
        this.jPlayerIds = ids;
    };
    MemoryPlayerProvider.prototype.$setOptions = function (options) {
        this.jPlayerOptions = options;
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
            wmode: 'window',
            audioFullScreen: false,
            smoothPlayBar: false,
            keyEnabled: false,
            playlistOptions: {
                enableRemoveControls: false
            }
        };
        this.JPlayerProvider.$setIds(this.JPlayerIds);
        this.JPlayerProvider.$setOptions(this.JPlayerOptions);
        this.$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
    return MemoryPlayerConfig;
}());
MemoryPlayerConfig.instance = [
    '$locationProvider',
    'JPlayerProvider',
    MemoryPlayerConfig
];
var MemoryPlayerRun = (function () {
    function MemoryPlayerRun($rootScope, $window) {
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.$rootScope.$on('$locationChangeSuccess', function ($event, newUrl, oldUrl) {
            if (newUrl !== oldUrl) {
                this.$window.location.href = newUrl;
            }
        });
    }
    return MemoryPlayerRun;
}());
MemoryPlayerRun.instance = [
    '$rootScope',
    '$window',
    MemoryPlayerRun
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .config(MemoryPlayerConfig.instance);
    angular.module('MemoryPlayer')
        .run(MemoryPlayerRun.instance);
})();

var MemoryPlayerAPI = (function () {
    /**
     * Implements IMemoryPlayerAPI
     * @constructs MemoryPlayerAPI
     * @param {IHttpService} $http - The core angular http service.
     * @param {ILogService} $log - The core angular log service.
     */
    function MemoryPlayerAPI($http, $log) {
        this.$http = $http;
        this.$log = $log;
        /**
         * @memberof MemoryPlayerAPI
         * @member {string} playlists - The path to playlists json file.
         * @private
         */
        this.playlists = '/lib/memory-player/dist/json/playlists.json';
    }
    /**
     * Removes player if playlists unavailable.
     * @memberof MemoryPlayerAPI
     * @instance
     * @private
     */
    MemoryPlayerAPI.prototype.removePlayer = function () {
        angular.element('#memory-player').remove();
    };
    ;
    /**
     * Gets JSON file containing playlists.
     * @memberof MemoryPlayerAPI
     * @instance
     * @returns {IHttpPromise<IPlaylists>} - playlists on success and null on failure.
     */
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this.playlists)
            .then(function (response) {
            // Check for data in response
            if (response.hasOwnProperty('data') && response.data !== null) {
                // Return playlists
                return response.data;
            }
            else {
                // Remove player
                _this.removePlayer();
                return null;
            }
        }).catch(function (error) {
            // Remove player
            _this.removePlayer();
            // Log error
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

var MemoryPlayerControls = (function () {
    /**
     * Implements IMemoryPlayerControls
     * @constructs MemoryPlayerControls
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {ITimeoutService} $timeout - The core angular timeout service.
     * @param {MemoryPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     */
    function MemoryPlayerControls($rootScope, $timeout, JPlayer, MemoryPlayerState) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.JPlayer = JPlayer;
        this.MemoryPlayerState = MemoryPlayerState;
        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        /**
         * Observes open playlist dropdown click inside to prevent close.
         */
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', function (event) {
            event.stopPropagation();
        });
        /**
         * Observes click to close open playlist dropdown.
         */
        angular.element(document).on('click.mp.dropdown', function (event) {
            var $dropdown = angular.element('.mp-dropdown');
            // If dropdown is open then close it
            if (!angular.element(event.target).closest('.mp-dropdown-toggle').length && $dropdown.hasClass('open')) {
                // Closes dropdown
                $dropdown.removeClass('open');
                // Updates aria for accessibility
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });
        /**
         * Observes click to close open playlist dropdown on mobile devices.
         */
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', function (event) {
            // Removes dropdown backdrop
            angular.element(event.target).remove();
            var $dropdown = angular.element('.mp-dropdown');
            // Closes dropdown
            $dropdown.removeClass('open');
            // Updates aria for accessibility
            $dropdown.find('a').attr('aria-expanded', 'false');
        });
        /**
         * Observe that YouTube video has played and prevents simultaneous playback.
         */
        angular.element(document).on('youtube.onVideoPlayed', function () {
            // If player is playing then toggle play
            if (!_this.MemoryPlayerState.getIsPaused()) {
                // Stops player
                _this.play();
            }
        });
    }
    /**
     * Checks if current track is last in playlist.
     * @memberof MemoryPlayerControls
     * @instance
     * @returns {boolean} - True if track is last else false.
     */
    MemoryPlayerControls.prototype.isEnd = function () {
        // Compares track index to playlist length
        var trackId = (this.MemoryPlayerState.getTrackId() + 1), currentPlaylist = this.MemoryPlayerState.getPlaylist();
        return !(trackId < currentPlaylist.trackCount);
    };
    /**
     * Sets player to max volume.
     * @memberof MemoryPlayerControls
     * @instance
     */
    MemoryPlayerControls.prototype.maxVolume = function () {
        // If muted then unmute
        if (this.MemoryPlayerState.getIsMuted()) {
            // Unmutes player
            angular.element(this.jPlayerId).jPlayer('unmute');
            // Updates is muted
            this.MemoryPlayerState.setIsMuted(false);
        }
        // Sets max volume
        angular.element(this.jPlayerId).jPlayer('volume', 1);
    };
    /**
     * Toggles mute and unmute.
     * @memberof MemoryPlayerControls
     * @instance
     */
    MemoryPlayerControls.prototype.mute = function () {
        // Gets is muted
        var isMuted = this.MemoryPlayerState.getIsMuted();
        // Toggles mute
        (isMuted) ? angular.element(this.jPlayerId).jPlayer('unmute') : angular.element(this.jPlayerId).jPlayer('mute');
        // Updates is muted
        this.MemoryPlayerState.setIsMuted(!isMuted);
    };
    /**
     * Plays next track.
     * @memberof MemoryPlayerControls
     * @instance
     */
    MemoryPlayerControls.prototype.next = function () {
        // If current track is not last in playlist then play next
        if (!this.isEnd()) {
            // Gets next track id
            var trackId = (this.MemoryPlayerState.getTrackId() + 1);
            // Updates current track
            this.MemoryPlayerState.setTrack(trackId);
            // Plays next track
            this.JPlayer.instance().next();
            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
    };
    /**
     * Toggles play and pause.
     * @memberof MemoryPlayerControls
     * @instance
     *
     * @fires MemoryPlayerState#MemoryPlayer:Pause
     */
    MemoryPlayerControls.prototype.play = function () {
        // Gets is paused
        var isPaused = this.MemoryPlayerState.getIsPaused();
        // Toggles play
        (isPaused) ? this.JPlayer.instance().play() : this.JPlayer.instance().pause();
        // Updates is paused
        this.MemoryPlayerState.setIsPaused(!isPaused);
        // If playing then notify other media
        if (!isPaused) {
            angular.element(this.jPlayerId).trigger('MemoryPlayer.TrackPlayed');
        }
    };
    /**
     * Plays previous track.
     * @memberof MemoryPlayerControls
     * @instance
     */
    MemoryPlayerControls.prototype.previous = function () {
        // Gets previous track id
        var trackId = (this.MemoryPlayerState.getTrackId() - 1);
        // If current track is not first in playlist then play previous
        if (trackId >= 0) {
            // Updates current track
            this.MemoryPlayerState.setTrack(trackId);
            // Plays previous track
            this.JPlayer.instance().previous();
            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
    };
    /**
     * Restarts player with previous settings.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {IRestartSettings} settings - Settings required to restart player.
     */
    MemoryPlayerControls.prototype.restart = function (settings) {
        // Updates current track
        this.MemoryPlayerState.setTrack(settings.track);
        // Sets player to current track
        this.JPlayer.instance().select(settings.track);
        // Sets player to current volume
        angular.element(this.jPlayerId).jPlayer('volume', settings.volume);
        // If is muted then set player and update state
        if (settings.isMuted === true) {
            // Mutes player
            angular.element(this.jPlayerId).jPlayer('mute');
            // Updates is muted
            this.MemoryPlayerState.setIsMuted(true);
        }
        // Assigns variable to set playback state
        var playState = 'pause';
        // If not is paused then update
        if (settings.isPaused !== true) {
            playState = 'play';
            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
        // Sets player to current time and playback state
        angular.element(this.jPlayerId).jPlayer(playState, settings.time);
    };
    /**
     * Plays selected track.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    MemoryPlayerControls.prototype.selectPlaylist = function (playlistName) {
        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlistName);
        // If player is defined set playlist and play
        if (angular.isDefined(this.JPlayer.instance)) {
            // Gets current playlist
            var playlist = this.MemoryPlayerState.getPlaylist().playlist;
            // Sets current playlist in player
            this.JPlayer.instance().setPlaylist(playlist);
            // Plays first track
            this.JPlayer.instance().option('autoPlay', true);
            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
    };
    /**
     * Plays selected track.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {number} trackIndex - The index of selected track in playlist.
     */
    MemoryPlayerControls.prototype.selectTrack = function (trackIndex) {
        // If selected track is different from current then set track and play, else resume
        if (trackIndex !== this.MemoryPlayerState.getTrackId()) {
            // Updates current track
            this.MemoryPlayerState.setTrack(trackIndex);
            // Plays selected track
            this.JPlayer.instance().play(trackIndex);
            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
        else {
            // Resumes track
            this.play();
        }
    };
    /**
     * Creates player and restarts with previous settings if available.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlist - The name of current playlist.
     * @param {IRestartSettings} settings - Settings required to restart player.
     */
    MemoryPlayerControls.prototype.showtime = function (playlist, settings) {
        var _this = this;
        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlist);
        // Instantiates jPlayer
        this.JPlayer.create(this.MemoryPlayerState.getPlaylist().playlist);
        /**
         * Observes player ready.
         */
        angular.element(this.jPlayerId).on($.jPlayer.event.ready, function () {
            // Small timeout before configuration
            _this.$timeout(function () {
                /**
                 * Observes player loaded.
                 */
                angular.element(_this.jPlayerId).on($.jPlayer.event.loadeddata, function (event) {
                    console.log(Math.floor(event.jPlayer.status.duration));
                });
                /**
                 * Observes player volume change.
                 */
                angular.element(_this.jPlayerId).on($.jPlayer.event.volumechange, function (event) {
                    // Updates volume
                    _this.MemoryPlayerState.setVolume(event.jPlayer.options.volume);
                    // Updates is muted
                    _this.MemoryPlayerState.setIsMuted(event.jPlayer.options.muted);
                });
                /**
                 * Observes current track ended.
                 */
                angular.element(_this.jPlayerId).on($.jPlayer.event.ended, function () {
                    // If playlist is not over then update state, else start from beginning
                    if (!_this.isEnd()) {
                        // Gets next track id
                        var trackId_1 = (_this.MemoryPlayerState.getTrackId() + 1);
                        _this.$rootScope.$evalAsync(function () {
                            // Updates current track
                            _this.MemoryPlayerState.setTrack(trackId_1);
                        });
                    }
                    else {
                        _this.$rootScope.$evalAsync(function () {
                            // Starts playlist from beginning
                            _this.selectTrack(0);
                        });
                    }
                });
                // If settings exist then restart
                if (angular.isDefined(settings)) {
                    _this.restart(settings);
                }
                // Removes loading class
                angular.element('#memory-player').removeClass('mp-loading');
            }, 400);
        });
    };
    /**
     * Toggles playlist dropdown.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {JQueryEventObject} event - The event from trigger element.
     */
    MemoryPlayerControls.prototype.toggleDropdown = function (event) {
        // Sets values to update dropdown state
        var $trigger = angular.element(event.target), $parent = $trigger.closest('.mp-dropdown'), isActive = $parent.hasClass('open'), $backdrop = angular.element(document.createElement('div')).addClass('mp-dropdown-backdrop');
        // Removes dropdown backdrop
        angular.element('.mp-dropdown-backdrop').remove();
        // Resets each dropdown
        angular.element('.mp-dropdown-toggle').each(function () {
            // Ignores closed dropdowns
            if (!angular.element(this).closest('.mp-dropdown').hasClass('open'))
                return;
            // Closes open dropdowns
            angular.element(this).closest('.mp-dropdown').removeClass('open');
            // Updates aria for accessibility
            angular.element(this).attr('aria-expanded', 'false');
        });
        // If dropdown was closed then open it
        if (!isActive) {
            // If user is on mobile device append backdrop
            if ('ontouchstart' in document.documentElement) {
                $backdrop.appendTo('body');
            }
            // Opens dropdown
            $parent.addClass('open');
            // Updates aria for accessibility
            $trigger.closest('.mp-dropdown-toggle').attr('aria-expanded', 'true');
        }
    };
    return MemoryPlayerControls;
}());
MemoryPlayerControls.instance = [
    '$rootScope',
    '$timeout',
    'JPlayer',
    'MemoryPlayerState',
    MemoryPlayerControls
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerControls', MemoryPlayerControls.instance);
})();

var MemoryPlayerState = (function () {
    /**
     * Implements IMemoryPlayerState
     * @constructs MemoryPlayerState
     * @param {MemoryPlayerProvider} JPlayer - The provider service that manages jplayer.
     */
    function MemoryPlayerState(JPlayer) {
        this.JPlayer = JPlayer;
        // Initializes JPlayer id
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        // Initializes some player settings
        this.isMuted = false;
        this.isPaused = true;
        this.volume = 0.80;
    }
    /**
     * Gets boolean that player is muted or not.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {boolean} - True if player is muted else false.
     */
    MemoryPlayerState.prototype.getIsMuted = function () {
        return this.isMuted;
    };
    /**
     * Sets boolean that player is muted or not.
     * @memberof MemoryPlayerState
     * @instance
     * @param {boolean} isMuted - The muted state.
     */
    MemoryPlayerState.prototype.setIsMuted = function (isMuted) {
        // Updates muted state
        this.isMuted = isMuted;
    };
    /**
     * Gets boolean that player is paused or not.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {boolean} - True if player is paused else false.
     */
    MemoryPlayerState.prototype.getIsPaused = function () {
        return this.isPaused;
    };
    /**
     * Sets boolean that player is paused or not.
     * @memberof MemoryPlayerState
     * @instance
     * @param {boolean} isPaused - The paused state.
     */
    MemoryPlayerState.prototype.setIsPaused = function (isPaused) {
        // Updates paused state
        this.isPaused = isPaused;
    };
    /**
     * Gets current playlist.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {IPlaylist} - The playlist.
     */
    MemoryPlayerState.prototype.getPlaylist = function () {
        return this.currentPlaylist;
    };
    /**
     * Sets selected playlist.
     * @memberof MemoryPlayerState
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     * @fires MemoryPlayerState#MemoryPlayer:NewPlaylist
     */
    MemoryPlayerState.prototype.setPlaylist = function (playlistName) {
        // Updates current playlist
        this.currentPlaylist = this.playlists[playlistName];
        // Sets current track to first track in current playlist
        this.setTrack(0);
    };
    /**
     * Gets current playlist id.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {string} - The id of playlist.
     */
    MemoryPlayerState.prototype.getPlaylistId = function () {
        return this.currentPlaylist._id;
    };
    /**
     * Gets playlists.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {IPlaylists} - The playlists.
     */
    MemoryPlayerState.prototype.getPlaylists = function () {
        return this.playlists;
    };
    /**
     * Sets playlists returned by API.
     * @memberof MemoryPlayerState
     * @instance
     * @param {IPlaylists} playlists - The playlists.
     */
    MemoryPlayerState.prototype.setPlaylists = function (playlists) {
        // Updates current playlists
        this.playlists = playlists;
    };
    /**
     * Gets current playback time of player.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {number} - The playback time of player.
     */
    MemoryPlayerState.prototype.getTime = function () {
        // Rounds current playback time
        return Math.floor(angular.element(this.jPlayerId).data('jPlayer').status.currentTime);
    };
    /**
     * Gets current track.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {ITrack} - The track.
     */
    MemoryPlayerState.prototype.getTrack = function () {
        return this.currentTrack;
    };
    /**
     * Sets selected track.
     * @memberof MemoryPlayerState
     * @instance
     * @param {number} trackIndex - The id of selected track.
     * @fires MemoryPlayerState#MemoryPlayer:NewTrack
     */
    MemoryPlayerState.prototype.setTrack = function (trackIndex) {
        // Updates current track
        this.currentTrack = this.currentPlaylist.playlist[trackIndex];
    };
    /**
     * Gets current track id.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {number} - The id of track.
     */
    MemoryPlayerState.prototype.getTrackId = function () {
        return this.currentTrack._id;
    };
    /**
     * Gets current volume of player.
     * @memberof MemoryPlayerState
     * @instance
     * @returns {string} - The 2 digit decimal volume of player.
     */
    MemoryPlayerState.prototype.getVolume = function () {
        return this.volume.toFixed(2);
    };
    /**
     * Sets volume of player.
     * @memberof MemoryPlayerState
     * @instance
     */
    MemoryPlayerState.prototype.setVolume = function (volume) {
        this.volume = volume;
    };
    return MemoryPlayerState;
}());
MemoryPlayerState.instance = [
    'JPlayer',
    MemoryPlayerState
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerState', MemoryPlayerState.instance);
})();

var MemoryPlayerController = (function () {
    function MemoryPlayerController($scope, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$scope = $scope;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
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
    MemoryPlayerController.prototype.toggleDropdown = function (event) {
        this.MemoryPlayerControls.toggleDropdown(event);
    };
    return MemoryPlayerController;
}());
MemoryPlayerController.instance = [
    '$scope',
    'MemoryPlayerState',
    'MemoryPlayerControls',
    MemoryPlayerController
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();

var MemoryPlayerDirective = (function () {
    function MemoryPlayerDirective($location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$location = $location;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        this.restrict = 'A';
        this.scope = true;
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
            scope.isShareable = scope.$eval(attrs['isShareable']) || false;
            var state = _this.$location.search();
            _this.MemoryPlayerAPI.getPlaylists().then(function (response) {
                _this.MemoryPlayerState.setPlaylists(response);
                if (isRestartable(state)) {
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
            scope.$on('$locationChangeStart', function ($event, newUrl, oldUrl) {
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
        };
    }
    MemoryPlayerDirective.instance = function () {
        var directive = function ($location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls) {
            return new MemoryPlayerDirective($location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls);
        };
        directive['$inject'] = [
            '$location',
            'MemoryPlayerAPI',
            'MemoryPlayerState',
            'MemoryPlayerControls',
        ];
        return directive;
    };
    return MemoryPlayerDirective;
}());
function isRestartable(state) {
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
}
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
