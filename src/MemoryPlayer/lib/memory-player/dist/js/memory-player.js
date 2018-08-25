(function () {
    'use strict';
    angular.module('MemoryPlayer', []);
})();

var MemoryPlayerProvider = (function () {
    function MemoryPlayerProvider() {
    }
    /**
     * Gets jplayer ids and instance.
     * @memberof MemoryPlayerProvider
     * @instance
     * @returns {IJPlayerProvider} - The return value of provider.
     */
    MemoryPlayerProvider.prototype.$get = function () {
        var _this = this;
        return {
            ids: this.JPlayerIds,
            create: function (playlist) {
                // If jplayer is undefined then allow create
                if (angular.isUndefined(_this.JPlayer)) {
                    // Sets immutable jplayer instance
                    _this.JPlayer = new jPlayerPlaylist(_this.JPlayerIds, playlist, _this.JPlayerOptions);
                }
            },
            instance: function () {
                return _this.JPlayer;
            }
        };
    };
    /**
     * Sets jplayer ids.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {IJPlayerIds} ids - The CSS selectors to instantiate a playlist jplayer.
     */
    MemoryPlayerProvider.prototype.$setIds = function (ids) {
        this.JPlayerIds = ids;
    };
    /**
     * Sets jplayer options.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {any} options - The options to instantiate a playlist jplayer.
     */
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
            swfPath: '/js/jquery.jplayer.swf',
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
         * @member {string} playlists - The path to retrieve playlists.
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
     * Gets playlists JSON response.
     * @memberof MemoryPlayerAPI
     * @instance
     * @returns {IHttpPromise<IPlaylists>} - playlists on success and null on failure.
     */
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this.playlists)
            .then(function (response) {
            // If response has data then return it
            if (response.hasOwnProperty('data') && response.data !== null) {
                // Returns playlists
                return response.data;
            }
            else {
                // Removes player
                _this.removePlayer();
                return null;
            }
        }).catch(function (error) {
            // Removes player
            _this.removePlayer();
            // Logs error
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
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     */
    function MemoryPlayerControls($rootScope, JPlayer, MemoryPlayerState) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerState = MemoryPlayerState;
        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        // Waits for player ready
        this.$rootScope.$on('MP:Ready', function ($event) {
            /**
             * Observes player volume change.
             */
            angular.element(_this.jPlayerId).bind($.jPlayer.event.volumechange, function (event) {
                // Updates volume
                _this.MemoryPlayerState.setVolume(event.jPlayer.options.volume);
                // Updates is muted
                _this.MemoryPlayerState.setIsMuted(event.jPlayer.options.muted);
            });
            /**
             * Observes current track ended.
             */
            angular.element(_this.jPlayerId).bind($.jPlayer.event.ended, function () {
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
        });
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
         * Observe custom event that YouTube video has played and prevents simultaneous playback.
         */
        angular.element(document).on('YT.VideoPlayed', function () {
            // If player is playing then toggle playback to pause
            if (!_this.MemoryPlayerState.getIsPaused()) {
                // Pauses player
                _this.play();
            }
        });
    }
    /**
     * Checks if current track is last in playlist.
     * @memberof MemoryPlayerControls
     * @instance
     * @returns {boolean} - True if current track is last else false.
     * @private
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
            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);
        }
    };
    /**
     * Toggles play and pause.
     * @memberof MemoryPlayerControls
     * @instance
     */
    MemoryPlayerControls.prototype.play = function () {
        // Gets play state
        var isPaused = this.MemoryPlayerState.getIsPaused();
        // Toggles play
        (isPaused) ? this.JPlayer.instance().play() : this.JPlayer.instance().pause();
        // Updates play state
        this.MemoryPlayerState.setIsPaused(!isPaused);
        // If playing then notify other media
        if (!isPaused) {
            angular.element(this.jPlayerId).trigger('MP.TrackPlayed');
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
            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);
        }
    };
    /**
     * Restarts player with previous settings.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {IRestartSettings} settings - Settings required to restart player.
     * @private
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
        // If playing then update
        if (settings.isPaused !== true) {
            playState = 'play';
            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);
        }
        // Sets player to current time and playback state
        angular.element(this.jPlayerId).jPlayer(playState, settings.time);
    };
    /**
     * Plays selected playlist.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    MemoryPlayerControls.prototype.selectPlaylist = function (playlistName) {
        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlistName);
        // Gets current playlist
        var playlist = this.MemoryPlayerState.getPlaylist().playlist;
        // Sets current playlist in player
        this.JPlayer.instance().setPlaylist(playlist);
        // Plays first track
        this.JPlayer.instance().play();
        // Updates play state
        this.MemoryPlayerState.setIsPaused(false);
    };
    /**
     * Plays selected track.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {number} trackIndex - The index of selected track in playlist.
     */
    MemoryPlayerControls.prototype.selectTrack = function (trackIndex) {
        // If selected track is different from current then set track and play, else toggle play
        if (trackIndex !== this.MemoryPlayerState.getTrackId()) {
            // Updates current track
            this.MemoryPlayerState.setTrack(trackIndex);
            // Plays selected track
            this.JPlayer.instance().play(trackIndex);
            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);
        }
        else {
            // Toggles play
            this.play();
        }
    };
    /**
     * Creates player and executes restart with previous settings if available.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlist - The name of current playlist.
     * @param {IRestartSettings} settings - Settings required to restart player.
     */
    MemoryPlayerControls.prototype.showtime = function (playlist, settings) {
        var _this = this;
        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlist);
        // Creates jplayer instance with current playlist
        this.JPlayer.create(this.MemoryPlayerState.getPlaylist().playlist);
        // Waits for player ready
        angular.element(this.jPlayerId).bind($.jPlayer.event.ready, function () {
            // If settings exist then restart
            if (angular.isDefined(settings)) {
                // Restarts player
                _this.restart(settings);
            }
            // Removes loading class
            angular.element('#memory-player').removeClass('mp-loading');
            // Notifies that player setup is complete
            _this.$rootScope.$broadcast('MP:Ready');
        });
    };
    /**
     * Toggles playlist dropdown.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {JQueryEventObject} $event - The event from trigger element.
     */
    MemoryPlayerControls.prototype.toggleDropdown = function ($event) {
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
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     */
    function MemoryPlayerState(JPlayer) {
        this.JPlayer = JPlayer;
        // Stores player id for optimization
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
     * @param {boolean} isPaused - The play state.
     */
    MemoryPlayerState.prototype.setIsPaused = function (isPaused) {
        // Updates play state
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
     * Sets current playlist.
     * @memberof MemoryPlayerState
     * @instance
     * @param {string} playlistName - The name of selected playlist.
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
        // Rounds current playback time down
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
     * Sets current track.
     * @memberof MemoryPlayerState
     * @instance
     * @param {number} trackIndex - The id of selected track.
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

var MemoryPlayerSharing = (function () {
    /**
     * Implements IMemoryPlayerSharing
     * @constructs MemoryPlayerSharing
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     */
    function MemoryPlayerSharing($rootScope, JPlayer, MemoryPlayerState) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerState = MemoryPlayerState;
        /**
         * @memberof MemoryPlayerSharing
         * @member {string} sharelink - The link back URL to share media in memory player.
         */
        this.sharelink = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        // Initializes share link to ignore time
        this.isTimeUsed = false;
        // Sets initial start time for share link
        this.sharelinkTime = '00:00';
        // Sets initial values for share link
        if (angular.isDefined(this.MemoryPlayerState.getPlaylist())) {
            this.setShareVal('playlist', this.MemoryPlayerState.getPlaylist()._id);
        }
        if (angular.isDefined(this.MemoryPlayerState.getTrack())) {
            this.setShareVal('track', this.MemoryPlayerState.getTrack()._id);
        }
        // Watches state service for playlist change
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylist();
        }, function (newPlaylist, oldPlaylist) {
            // If playlist changes then update
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {
                // Updates current playlist
                _this.setShareVal('playlist', newPlaylist._id);
            }
        });
        // Watches state service for track change
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getTrack();
        }, function (newTrack, oldTrack) {
            // If track changes then update
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {
                // Updates current track
                _this.setShareVal('track', newTrack._id);
                // Resets is time used
                if (_this.isTimeUsed) {
                    _this.useTime();
                }
            }
        });
        // Waits for player ready
        this.$rootScope.$on('MP:Ready', function ($event) {
            /**
             * Observes player loaded.
             */
            angular.element(_this.jPlayerId).bind($.jPlayer.event.loadeddata, function (event) {
                _this.$rootScope.$evalAsync(function () {
                    // Updates track length
                    _this.trackDuration = event.jPlayer.status.duration;
                });
            });
        });
    }
    /**
     * Cancels timer when user focuses start time input.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    MemoryPlayerSharing.prototype.cancelTimer = function () {
        // Cancels time update observer
        angular.element(this.jPlayerId).unbind($.jPlayer.event.timeupdate);
    };
    /**
     * Updates value specified by key.
     * @memberof MemoryPlayerSharing
     * @instance
     * @param {string} key - The key of value to be set.
     * @param {string | number} value - The value to set.
     */
    MemoryPlayerSharing.prototype.setShareVal = function (key, value) {
        // Sets default share link values
        var sharelink = [], playlist = { name: 'playlist', value: null }, track = { name: 'track', value: null }, time = { name: 'time', value: 0 }, volume = { name: 'volume', value: 0.8 }, isMuted = { name: 'isMuted', value: false }, isPaused = { name: 'isPaused', value: false };
        // Gets query string
        var settings = this.sharelink.split('?')[1] || null;
        // If share link is a string convert params to objects
        if (angular.isString(settings)) {
            // Decodes the URI
            settings = decodeURIComponent((settings).replace(/\+/g, '%20'));
            var params = settings.split(/&(?!amp;)/g);
            // Stores all editable values from prior setting
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
        // Updates edited value
        switch (key) {
            case 'playlist':
                playlist.value = value;
                break;
            case 'track':
                track.value = value;
                break;
            case 'time':
                var parsedTime = value;
                // If time has a semicolon convert to seconds
                if (parsedTime.indexOf(':') > -1) {
                    // Converts hh:mm:ss to seconds
                    parsedTime = parsedTime.split(':')
                        .reverse()
                        .map(Number)
                        .reduce(function (total, currentValue, index) {
                        return total + currentValue * Math.pow(60, index);
                    });
                }
                // If start time is less than track length set value, else start from beginning
                time.value = (parsedTime < this.trackDuration) ? parsedTime : 0;
                break;
        }
        // Stores all values in ordered array
        sharelink.push(playlist);
        sharelink.push(track);
        sharelink.push(time);
        sharelink.push(volume);
        sharelink.push(isMuted);
        sharelink.push(isPaused);
        // Converts array to query string
        var updatedSettings = $.param(sharelink);
        // Sets share link with updated values
        this.sharelink = this.sharelink.split('?')[0] + "?" + updatedSettings;
    };
    /**
     * Copies share link to clipboard.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    MemoryPlayerSharing.prototype.share = function () {
        // Gets share link element
        var sharelink = document.getElementById('mp-share-link');
        // Selects share link text
        sharelink.select();
        // Copies text to clipboard
        document.execCommand('copy');
    };
    /**
     * Updates time in share link.
     * @memberof MemoryPlayerSharing
     * @instance
     * @param {string} updatedTime - The updated sharelink time.
     */
    MemoryPlayerSharing.prototype.updateTime = function (updatedTime) {
        // Includes time in share link
        this.isTimeUsed = true;
        // Sets time in share link
        this.setShareVal('time', updatedTime);
    };
    /**
     * Updates the share link time value when start time is used.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    MemoryPlayerSharing.prototype.useTime = function () {
        // Sets use time to latest user setting
        this.isTimeUsed = !this.isTimeUsed;
    };
    return MemoryPlayerSharing;
}());
MemoryPlayerSharing.instance = [
    '$rootScope',
    'JPlayer',
    'MemoryPlayerState',
    MemoryPlayerSharing
];
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
    return MemoryPlayerController;
}());
MemoryPlayerController.instance = [
    '$scope',
    'MemoryPlayerState',
    'MemoryPlayerControls',
    'MemoryPlayerSharing',
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
        this.scope = {
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
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
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

var SharingDirective = (function () {
    function SharingDirective(JPlayer, MemoryPlayerSharing) {
        var _this = this;
        this.JPlayer = JPlayer;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        this.restrict = 'A';
        this.scope = {
            currentTrack: '<',
            cancelTimer: '&',
            share: '&',
            toggleDropdown: '&',
            updateTime: '&',
            useTime: '&'
        };
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/mp-sharing.html';
        SharingDirective.prototype.link = function (scope, element, attrs) {
            scope.isTimeUsed = false;
            scope.sharelink = null;
            scope.sharelinkTime = '00:00';
            var unbindSharelinkWatch = scope.$watch(function () {
                return _this.MemoryPlayerSharing.sharelink;
            }, function (newSharelink, oldSharelink) {
                if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {
                    scope.sharelink = newSharelink;
                }
            });
            var unbindIsTimeUsedWatch = scope.$watch(function () {
                return _this.MemoryPlayerSharing.isTimeUsed;
            }, function (newValue, oldValue) {
                if (angular.isDefined(newValue) && newValue !== oldValue) {
                    scope.isTimeUsed = newValue;
                    if (scope.isTimeUsed) {
                        angular.element(_this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, function (event) {
                            scope.$evalAsync(function () {
                                scope.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                                _this.MemoryPlayerSharing.setShareVal('time', scope.sharelinkTime);
                            });
                        });
                    }
                    else {
                        angular.element(_this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);
                        scope.sharelinkTime = '00:00';
                        _this.MemoryPlayerSharing.setShareVal('time', '0');
                    }
                }
            });
            scope.$on('$destroy', function () {
                unbindSharelinkWatch();
                unbindIsTimeUsedWatch();
            });
        };
    }
    SharingDirective.instance = function () {
        var directive = function (JPlayer, MemoryPlayerSharing) {
            return new SharingDirective(JPlayer, MemoryPlayerSharing);
        };
        directive['$inject'] = [
            'JPlayer',
            'MemoryPlayerSharing',
        ];
        return directive;
    };
    return SharingDirective;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .directive('sharing', SharingDirective.instance());
})();
