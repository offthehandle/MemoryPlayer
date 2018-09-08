
class MPPlayerController implements angular.IController {

    public static instance: any[] = [
        '$rootScope',
        '$location',
        'MemoryPlayerAPI',
        'MemoryPlayerState',
        'MemoryPlayerControls',
        MPPlayerController
    ];



    /**
     * Implements IController
     * @constructs MPPlayerController
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerAPI} MemoryPlayerAPI - The service that manages API calls.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     * @param {IMemoryPlayerControls} MemoryPlayerControls - The service that manages memory player controls.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private $location: angular.ILocationService,
        private MemoryPlayerAPI: IMemoryPlayerAPI,
        private MemoryPlayerState: IMemoryPlayerState,
        private MemoryPlayerControls: IMemoryPlayerControls
    ) {

        // Gets player state from URL
        let state: any = this.$location.search();


        // Gets playlists using API
        this.MemoryPlayerAPI.getPlaylists().then((response: IPlaylists): void => {

            // Sets playlists response in service
            this.MemoryPlayerState.setPlaylists(response);

            // If available settings allow then restart, else start fresh
            if (this.isRestartable(state)) {

                // Sets restart settings
                let settings: IRestartSettings = {
                    track: parseInt(state.track),
                    time: parseInt(state.time),
                    volume: parseFloat(state.volume),
                    isMuted: state.isMuted,
                    isPaused: state.isPaused,
                };

                // Restarts player
                this.MemoryPlayerControls.showtime(state.playlist, settings);

            } else {

                // Gets name of first playlist
                let playlist: string = Object.keys(response)[0];

                // Starts player fresh
                this.MemoryPlayerControls.showtime(response[playlist]._id);
            }
        });


        /**
         * Core Angular event used to append query string for continued playback.
         *
         * ?playlist=playlist&track=track&time=time&volume=volume&isMuted&isPaused
         *
         * playlist = id of the current playlist
         * track = id of the current track
         * time = current playback time
         * volume = current player volume
         * isMuted = the player is muted or not (=false)
         * isPaused = the player is paused or not (=false)
         */
        this.unbindLocationChange = this.$rootScope.$on('$locationChangeStart', ($event: angular.IAngularEvent, newUrl: string, oldUrl: string): void => {

            // If new page is requested then append query string
            if (newUrl !== oldUrl) {

                let newUrlPath = this.$location.url();

                this.$location.path(newUrlPath.split('?')[0]).search({
                    playlist: this.MemoryPlayerState.getPlaylistId(),
                    track: this.MemoryPlayerState.getTrackId(),
                    time: this.MemoryPlayerState.getTime(),
                    volume: this.MemoryPlayerState.getVolume(),
                    isMuted: this.MemoryPlayerState.getIsMuted(),
                    isPaused: this.MemoryPlayerState.getIsPaused()
                });
            }
        });
    }



    /**
     * Tests available settings for restartability
     * @memberof MPPlayerController
     * @instance
     * @private
     */
    private isRestartable(state: any): boolean {

        // Sets success as initial test result
        let isRestartable: boolean = true;


        // If any required setting is missing, set failure result
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


        // Returns test result
        return isRestartable;
    }


    /**
     * Unbinds location change start listener
     * @memberof MPPlayerController
     * @instance
     * @private
     */
    private unbindLocationChange: () => void;



    // Cleans up watches to prevent memory leaks
    public $onDestroy() {

        this.unbindLocationChange();
    }
}



class MemoryPlayerComponent implements angular.IComponentOptions {

    /**
     * @memberof MemoryPlayerComponent
     * @member {any} controller - The component controller.
     */
    public controller: any;


    /**
     * @memberof MemoryPlayerComponent
     * @member {string} controllerAs - The reference to component controller.
     */
    public controllerAs: string;


    /**
     * @memberof MemoryPlayerComponent
     * @member {{ [boundProperty: string]: string }} bindings - The component properties bound to the controller.
     */
    public bindings: { [boundProperty: string]: string };


    /**
     * @memberof MemoryPlayerComponent
     * @member {string} templateUrl - The url to the HTML template.
     */
    public templateUrl: string;



    /**
     * Implements IComponentOptions
     * @constructs MemoryPlayerComponent
     */
    constructor() {

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
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .component('memoryPlayer', new MemoryPlayerComponent());
})();
