var MemoryPlayerFactory = (function () {
    /**
     * Implements IMemoryPlayerFactory
     * @constructs MemoryPlayerFactory
     * @param {IRootScopeService} $rootScope - The core angular rootScope service.
     * @param {ITimeoutService} $timeout - The core angular timeout service.
     * @param {IMemoryPlayerAPI} MemoryPlayerAPI - The Memory Player API service.
     */
    function MemoryPlayerFactory($rootScope, $timeout, MemoryPlayerAPI) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        /**
         * @memberof MemoryPlayerFactory
         * @member {IMemoryPlaylists} _playlists - Is assigned the response from the playlists json file.
         * @private
         * @default null
         */
        this._playlists = null;
        /**
         * @memberof MemoryPlayerFactory
         * @member {IMemoryPlaylist} _selectedPlaylist - Is assigned the selected playlist object.
         * @private
         * @default null
         */
        this._selectedPlaylist = null;
        /**
         * @memberof MemoryPlayerFactory
         * @member {IMemoryTrack} _selectedTrack - Is assigned the active track object.
         * @private
         * @default null
         */
        this._selectedTrack = null;
        /**
         * @memberof MemoryPlayerFactory
         * @member {number} _volume - Is assigned the volume setting of the player.
         * @private
         * @default 0.8
         */
        this._volume = 0.8;
        /**
         * @memberof MemoryPlayerFactory
         * @member {boolean} _isMuted - Is assigned true if the player is muted and false if it is not.
         * @private
         * @default false
         */
        this._isMuted = false;
        /**
         * @memberof MemoryPlayerFactory
         * @member {boolean} isPaused - Is assigned true if the player is paused and false if it is not.
         * @default true
         */
        this.isPaused = true;
        /**
         * @memberof MemoryPlayerFactory
         * @member {IjPlayerPlaylist} _playerInstance - Is assigned the JS instance of the jPlayer plugin with its available, native methods.
         * @private
         * @default null
         */
        this._playerInstance = null;
        /**
         * @memberof MemoryPlayerFactory
         * @member {IjPlayer} _player - The object containing required ids to instantiate the jPlayer.
         * @private
         */
        this._player = {
            jPlayer: '#jquery_jplayer',
            cssSelectorAncestor: '#jp_container'
        };
        /**
         * @memberof MemoryPlayerFactory
         * @member {string} _playerId - The HTML/CSS id of the jPlayer element.
         * @private
         * @default #jquery_jplayer
         */
        this._playerId = this._player.jPlayer;
        /**
         * @memberof MemoryPlayerFactory
         * @member {any} _playerOptions - The configuration object of the jPlayer instance.
         * @private
         */
        this._playerOptions = {
            swfPath: '/Scripts',
            supplied: 'mp3',
            /**
             * @fires MemoryPlayer:trackPlayed
             */
            playing: function () {
                /**
                 * @event MemoryPlayer:trackPlayed
                 */
                _this.$rootScope.$emit('MemoryPlayer:trackPlayed');
            },
            volumechange: function (e) {
                _this._volume = e.jPlayer.options.volume;
                _this._isMuted = e.jPlayer.options.muted;
            },
            /**
             * @fires MemoryPlayer:trackEnded
             */
            ended: function () {
                /**
                 * @event MemoryPlayer:trackEnded
                 */
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
    /**
     * Gets all the playlists returned in the JSON file.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {IMemoryPlaylists} - The playlists data returned from the JSON file.
     */
    MemoryPlayerFactory.prototype.getAllPlaylists = function () {
        return this._playlists;
    };
    ;
    /**
     * Sets the available playlists returned by the API.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {IMemoryPlaylists} playlists - The JSON response returned by the API.
     */
    MemoryPlayerFactory.prototype.setAllPlaylists = function (playlists) {
        this._playlists = playlists;
    };
    ;
    /**
     * Fetches the playlists using the API method.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {Function} callback - The callback to execute if the API request is successful, i.e. the response is not null.
     */
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
    /**
     * Sets the auto play option on the player instance.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {boolean} isAutoPlayed - Set to true if auto play is to be turned on and false if it is not.
     */
    MemoryPlayerFactory.prototype.autoPlay = function (isAutoPlayed) {
        if (this._playerInstance !== null) {
            this._playerInstance.option('autoPlay', isAutoPlayed);
        }
    };
    ;
    /**
     * Gets the playback time of the player.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {number} - The current playback time of the jPlayer instance.
     */
    MemoryPlayerFactory.prototype.getTime = function () {
        return Math.floor(angular.element(this._playerId).data('jPlayer').status.currentTime);
    };
    ;
    /**
     * Gets the volume of the player.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {string} - The current 2 digit decimal volume of the jPlayer instance.
     */
    MemoryPlayerFactory.prototype.getVolume = function () {
        return this._volume.toFixed(2);
    };
    ;
    /**
     * Gets the boolean of whether the player is muted or not.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {boolean} - Set to true if the player is muted and false if it is not.
     */
    MemoryPlayerFactory.prototype.getIsMuted = function () {
        return this._isMuted;
    };
    ;
    /**
     * Gets the current track.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {IMemoryTrack} - The object of the selected track.
     */
    MemoryPlayerFactory.prototype.getTrack = function () {
        return this._selectedTrack;
    };
    ;
    /**
     * Gets the current playlist.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {IMemoryPlaylist} - The object of the selected playlist.
     */
    MemoryPlayerFactory.prototype.getPlaylist = function () {
        return this._selectedPlaylist;
    };
    ;
    /**
     * Gets the current track id.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {number} - The id of the selected track.
     */
    MemoryPlayerFactory.prototype.getTrackById = function () {
        return this._selectedTrack._id;
    };
    ;
    /**
     * Gets the current playlist id.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {string} - The id of the selected playlist.
     */
    MemoryPlayerFactory.prototype.getPlaylistById = function () {
        return this._selectedPlaylist._id;
    };
    ;
    /**
     * Sets the selected track.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {number} track - The id of the track to be selected.
     * @fires MemoryPlayer:trackChanged
     */
    MemoryPlayerFactory.prototype.setTrack = function (track) {
        this._selectedTrack = this.getPlaylist().playlist[track];
        /**
         * @event MemoryPlayer:trackChanged
         */
        this.$rootScope.$emit('MemoryPlayer:trackChanged', this._selectedTrack);
    };
    ;
    /**
     * Sets the selected playlist.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {string} album - The id of the playlist to be selected.
     * @fires MemoryPlayer:playlistChanged
     */
    MemoryPlayerFactory.prototype.setPlaylist = function (album) {
        this._selectedPlaylist = this.getAllPlaylists()[album];
        this.setTrack(0);
        if (this._playerInstance !== null) {
            this._playerInstance.setPlaylist(this._selectedPlaylist.playlist);
            this.autoPlay(true);
        }
        /**
         * @event MemoryPlayer:playlistChanged
         */
        this.$rootScope.$emit('MemoryPlayer:playlistChanged', this._selectedPlaylist);
    };
    ;
    /**
     * Creates an instance of the player.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {string} album - The id of the default or selected playlist.
     * @param {IMemoryPlayerInfo} playerInfo - Contains the data required to restart the player.
     */
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
    /**
     * The play method and its business logic.
     * @memberof MemoryPlayerFactory
     * @instance
     *
     * @fires MemoryPlayer:trackPlayed
     */
    MemoryPlayerFactory.prototype.play = function () {
        (this.isPaused) ? angular.element(this._playerId).jPlayer('play') : angular.element(this._playerId).jPlayer('pause');
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            /**
             * @event MemoryPlayer:trackPlayed
             */
            this.$rootScope.$emit('MemoryPlayer:isPaused', this.isPaused);
        }
    };
    ;
    /**
     * Plays the selected track.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {number} track - The id of the selected track.
     */
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
    /**
     * Business logic to play the next track.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    MemoryPlayerFactory.prototype.next = function () {
        var trackId = this.getTrackById();
        if (trackId + 1 < this.getPlaylist().trackCount) {
            this.setTrack(trackId + 1);
            this._playerInstance.next();
        }
    };
    ;
    /**
     * Business logic to play the previous track.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    MemoryPlayerFactory.prototype.previous = function () {
        var trackId = this.getTrackById();
        if (trackId > 0) {
            this.setTrack(trackId - 1);
            this._playerInstance.previous();
        }
    };
    ;
    /**
     * Business logic to set the player volume to its maximum.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    MemoryPlayerFactory.prototype.maxVolume = function () {
        if (this._isMuted) {
            angular.element(this._playerId).jPlayer('unmute');
            this._isMuted = !this._isMuted;
        }
        angular.element(this._playerId).jPlayer('volume', 1);
    };
    ;
    /**
     * Business logic to toggle muting on the player.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    MemoryPlayerFactory.prototype.mute = function () {
        (this.getIsMuted()) ? angular.element(this._playerId).jPlayer('unmute') : angular.element(this._playerId).jPlayer('mute');
        this._isMuted = !this.getIsMuted();
    };
    ;
    /**
     * The method to trigger the track played event.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {Function} callback - The callback function used to update the value of isPaused in the controller scope.
     * @fires MemoryPlayer:trackPlayed
     */
    MemoryPlayerFactory.prototype.trackPlayedEvent = function (callback) {
        this.isPaused = false;
        /**
         * @event MemoryPlayer:trackPlayed
         */
        angular.element(this._playerId).trigger('MemoryPlayer.trackPlayed');
        if (angular.isFunction(callback)) {
            callback({ isPaused: this.isPaused });
        }
    };
    ;
    /**
     * The method to trigger the track ended event and its business logic.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {Function} callback - The callback function used to update the selected track and the value of isPaused in the controller scope.
     */
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
