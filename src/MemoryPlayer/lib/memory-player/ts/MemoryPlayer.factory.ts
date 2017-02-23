
declare var jPlayerPlaylist: any;

class MemoryPlayerFactory implements IMemoryPlayerFactory {

    public static instance() {
        var factory = ($rootScope: angular.IRootScopeService, $timeout: angular.ITimeoutService, MemoryPlayerAPI: IMemoryPlayerAPI) => {
            return new MemoryPlayerFactory($rootScope, $timeout, MemoryPlayerAPI);
        };

        factory['$inject'] = [
            '$rootScope',
            '$timeout',
            'MemoryPlayerAPI'
        ];

        return factory;
    }



    /**
     * Implements IMemoryPlayerFactory
     * @constructs MemoryPlayerFactory
     * @param {IRootScopeService} $rootScope - The core angular rootScope service.
     * @param {ITimeoutService} $timeout - The core angular timeout service.
     * @param {IMemoryPlayerAPI} MemoryPlayerAPI - The Memory Player API service.
     */
    constructor(private $rootScope: angular.IRootScopeService, private $timeout: angular.ITimeoutService, private MemoryPlayerAPI: IMemoryPlayerAPI) {
    }



    /**
     * @memberof MemoryPlayerFactory
     * @member {IMemoryPlaylists} _playlists - Is assigned the response from the playlists json file.
     * @private
     * @default null
     */
    private _playlists: IMemoryPlaylists = null;


    /**
     * @memberof MemoryPlayerFactory
     * @member {IMemoryPlaylist} _selectedPlaylist - Is assigned the selected playlist object.
     * @private
     * @default null
     */
    private _selectedPlaylist: IMemoryPlaylist = null;


    /**
     * @memberof MemoryPlayerFactory
     * @member {IMemoryTrack} _selectedTrack - Is assigned the active track object.
     * @private
     * @default null
     */
    private _selectedTrack: IMemoryTrack = null;


    /**
     * @memberof MemoryPlayerFactory
     * @member {number} _volume - Is assigned the volume setting of the player.
     * @private
     * @default 0.8
     */
    private _volume: number = 0.8;


    /**
     * @memberof MemoryPlayerFactory
     * @member {boolean} _isMuted - Is assigned true if the player is muted and false if it is not.
     * @private
     * @default false
     */
    private _isMuted: boolean = false;



    /**
     * @memberof MemoryPlayerFactory
     * @member {boolean} isPaused - Is assigned true if the player is paused and false if it is not.
     * @default true
     */
    public isPaused: boolean = true;



    /**
     * @memberof MemoryPlayerFactory
     * @member {IjPlayerPlaylist} _playerInstance - Is assigned the JS instance of the jPlayer plugin with its native methods.
     * @private
     * @default null
     */
    private _playerInstance: IjPlayerPlaylist = null;


    /**
     * @memberof MemoryPlayerFactory
     * @member {IjPlayer} _player - The object containing required ids to instantiate the jPlayer.
     * @private
     */
    private _player: IjPlayer = {
        jPlayer: '#jquery_jplayer',
        cssSelectorAncestor: '#jp_container'
    };


    /**
     * @memberof MemoryPlayerFactory
     * @member {string} _playerId - The HTML/CSS id of the jPlayer element.
     * @private
     * @default #jquery_jplayer
     */
    private _playerId: string = this._player.jPlayer;


    /**
     * @memberof MemoryPlayerFactory
     * @member {any} _playerOptions - The configuration object of the jPlayer instance.
     * @private
     */
    private _playerOptions: any = {
        swfPath: '/js',

        supplied: 'mp3',

        /**
         * @fires MemoryPlayer:trackPlayed
         */
        playing: () => {
            /**
             * @event MemoryPlayer:trackPlayed
             */
            this.$rootScope.$emit('MemoryPlayer:trackPlayed');
        },

        volumechange: (e: IjPlayerEvent) => {
            this._volume = e.jPlayer.options.volume;
            this._isMuted = e.jPlayer.options.muted;
        },

        /**
         * @fires MemoryPlayer:trackEnded
         */
        ended: () => {
            /**
             * @event MemoryPlayer:trackEnded
             */
            this.$rootScope.$emit('MemoryPlayer:trackEnded');
        },

        wmode: 'window',

        audioFullScreen: false,

        smoothPlayBar: false,

        keyEnabled: false,

        playlistOptions: {
            enableRemoveControls: false
        }
    };



    /**
     * Gets all the playlists returned in the JSON file.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {IMemoryPlaylists} - The playlists data returned from the JSON file.
     */
    public getAllPlaylists(): IMemoryPlaylists {
        return this._playlists;
    };


    /**
     * Sets the available playlists returned by the API.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {IMemoryPlaylists} playlists - The JSON response returned by the API.
     */
    public setAllPlaylists(playlists: IMemoryPlaylists): void {
        this._playlists = playlists;
    };


    /**
     * Fetches the playlists using the API method.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {Function} callback - The callback to execute if the API request is successful, i.e. the response is not null.
     */
    public fetchPlaylists(callback: Function): void {

        this.MemoryPlayerAPI.getPlaylists()
            .then((response: IMemoryPlaylists) => {

                if (response !== null) {

                    this.setAllPlaylists(response);

                    (angular.isFunction(callback)) ? callback() : false;
                }
            });

    };


    /**
     * Sets the auto play option on the player instance.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {boolean} isAutoPlayed - Set to true if auto play is to be turned on and false if it is not.
     */
    public autoPlay(isAutoPlayed: boolean): void {

        if (this._playerInstance !== null) {

            this._playerInstance.option('autoPlay', isAutoPlayed);
        }
    };


    /**
     * Gets the playback time of the player.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {number} - The current playback time of the jPlayer instance.
     */
    public getTime(): number {
        return Math.floor(angular.element(this._playerId).data('jPlayer').status.currentTime);
    };


    /**
     * Gets the volume of the player.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {string} - The current 2 digit decimal volume of the jPlayer instance.
     */
    public getVolume(): string {
        return this._volume.toFixed(2);
    };


    /**
     * Gets the boolean of whether the player is muted or not.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {boolean} - Set to true if the player is muted and false if it is not.
     */
    public getIsMuted(): boolean {
        return this._isMuted;
    };


    /**
     * Gets the current track.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {IMemoryTrack} - The object of the selected track.
     */
    public getTrack(): IMemoryTrack {
        return this._selectedTrack;
    };


    /**
     * Gets the current playlist.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {IMemoryPlaylist} - The object of the selected playlist.
     */
    public getPlaylist(): IMemoryPlaylist {
        return this._selectedPlaylist;
    };


    /**
     * Gets the current track id.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {number} - The id of the selected track.
     */
    public getTrackById(): number {
        return this._selectedTrack._id;
    };


    /**
     * Gets the current playlist id.
     * @memberof MemoryPlayerFactory
     * @instance
     * @returns {string} - The id of the selected playlist.
     */
    public getPlaylistById(): string {
        return this._selectedPlaylist._id;
    };


    /**
     * Sets the selected track.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {number} track - The id of the track to be selected.
     * @fires MemoryPlayer:trackChanged
     */
    public setTrack(track: number): void {

        this._selectedTrack = this.getPlaylist().playlist[track];

        /**
         * @event MemoryPlayer:trackChanged
         */
        this.$rootScope.$emit('MemoryPlayer:trackChanged', this._selectedTrack);

    };


    /**
     * Sets the selected playlist.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {string} album - The id of the playlist to be selected.
     * @fires MemoryPlayer:playlistChanged
     */
    public setPlaylist(album: string): void {

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


    /**
     * Creates an instance of the player.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {string} album - The id of the default or selected playlist.
     * @param {IMemoryPlayerInfo} playerInfo - Contains the data required to restart the player.
     */
    public createPlayer(album: string, playerInfo: IMemoryPlayerInfo): void {

        this.setPlaylist(album);

        this._playerInstance = new jPlayerPlaylist(this._player, this.getPlaylist().playlist, this._playerOptions);

        if (playerInfo !== null) {

            this.setTrack(playerInfo.track);

            angular.element(this._playerId).on($.jPlayer.event.ready, () => {

                this.$timeout(() => {

                    this._playerInstance.select(playerInfo.track);

                    angular.element(this._playerId).jPlayer('volume', playerInfo.volume);

                    if (playerInfo.isMuted !== 'false') {

                        angular.element(this._playerId).jPlayer('mute');

                        this._isMuted = true;
                    }

                    if (playerInfo.isPaused === 'false') {

                        angular.element(this._playerId).jPlayer('play', playerInfo.time);

                    } else {

                        angular.element(this._playerId).jPlayer('pause', playerInfo.time);
                    }

                }, 400);
            });

        }
    };


    /**
     * The play method and its business logic.
     * @memberof MemoryPlayerFactory
     * @instance
     *
     * @fires MemoryPlayer:trackPlayed
     */
    public play(): void {

        (this.isPaused) ? angular.element(this._playerId).jPlayer('play') : angular.element(this._playerId).jPlayer('pause');

        this.isPaused = !this.isPaused;

        if (this.isPaused) {

            /**
             * @event MemoryPlayer:trackPlayed
             */
            this.$rootScope.$emit('MemoryPlayer:isPaused', this.isPaused);
        }
    };


    /**
     * Plays the selected track.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {number} track - The id of the selected track.
     */
    public cueTrack(track: number): void {

        if (track !== this.getTrackById()) {

            this.setTrack(track);

            this._playerInstance.play(track);

        } else {

            this.play();
        }
    };


    /**
     * Business logic to play the next track.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    public next(): void {

        let trackId: number = this.getTrackById();

        if (trackId + 1 < this.getPlaylist().trackCount) {

            this.setTrack(trackId + 1);

            this._playerInstance.next();
        }
    };


    /**
     * Business logic to play the previous track.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    public previous(): void {

        let trackId: number = this.getTrackById();

        if (trackId > 0) {

            this.setTrack(trackId - 1);

            this._playerInstance.previous();
        }
    };


    /**
     * Business logic to set the player volume to its maximum.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    public maxVolume(): void {

        if (this._isMuted) {

            angular.element(this._playerId).jPlayer('unmute');

            this._isMuted = !this._isMuted;
        }

        angular.element(this._playerId).jPlayer('volume', 1)

    };


    /**
     * Business logic to toggle muting on the player.
     * @memberof MemoryPlayerFactory
     * @instance
     */
    public mute(): void {

        (this.getIsMuted()) ? angular.element(this._playerId).jPlayer('unmute') : angular.element(this._playerId).jPlayer('mute');

        this._isMuted = !this.getIsMuted();

    };


    /**
     * The method to trigger the track played event.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {Function} callback - The callback function used to update the value of isPaused in the controller scope.
     * @fires MemoryPlayer:trackPlayed
     */
    public trackPlayedEvent(callback: Function): void {

        this.isPaused = false;

        /**
         * @event MemoryPlayer.trackPlayed
         */
        angular.element(this._playerId).trigger('MemoryPlayer.trackPlayed');

        if (angular.isFunction(callback)) {

            callback({ isPaused: this.isPaused });
        }
    };


    /**
     * The method to trigger the track ended event and its business logic.
     * @memberof MemoryPlayerFactory
     * @instance
     * @param {Function} callback - The callback function used to update the selected track and the value of isPaused in the controller scope.
     */
    public trackEndedEvent(callback: Function): void {

        let trackId: number = this.getTrackById();

        if (trackId + 1 === this.getPlaylist().trackCount) {

            this.setTrack(0);

            this.isPaused = true;

            this._playerInstance.select(0);

        } else {

            this.setTrack(trackId + 1);
        }

        if (angular.isFunction(callback)) {

            callback({ track: this.getTrack(), isPaused: this.isPaused });
        }
    };
}


(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .factory('MemoryPlayerFactory', MemoryPlayerFactory.instance());
})();
