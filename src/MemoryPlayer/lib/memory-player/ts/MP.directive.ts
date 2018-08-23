
class MemoryPlayerDirective implements angular.IDirective {

    public static instance() {
        var directive = ($location: angular.ILocationService, MemoryPlayerAPI: IMemoryPlayerAPI, MemoryPlayerState: IMemoryPlayerState, MemoryPlayerControls: IMemoryPlayerControls): MemoryPlayerDirective => {
            return new MemoryPlayerDirective($location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls);
        };

        directive['$inject'] = [
            '$location',
            'MemoryPlayerAPI',
            'MemoryPlayerState',
            'MemoryPlayerControls',
        ];

        return directive;
    }



    /**
     * @memberof MemoryPlayerDirective
     * @member {string} restrict - The directive restriction - attribute only.
     */
    public restrict: string = 'A';


    /**
     * @memberof MemoryPlayerDirective
     * @member {{ [boundProperty: string]: string }} scope - The directive scope.
     */
    public scope: { [boundProperty: string]: string } = {
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


    /**
     * @memberof MemoryPlayerDirective
     * @member {boolean} replace - Whether the directive should replace its calling node.
     */
    public replace: boolean = true;


    /**
     * @memberof MemoryPlayerDirective
     * @member {string} templateUrl - The url to the HTML template.
     */
    public templateUrl: string = '/lib/memory-player/dist/html/memory-player.html';


    /**
     * @memberof MemoryPlayerDirective
     * @member link - The link option for the directive.
     */
    public link: (scope: angular.IScope, element: JQuery, attrs: angular.IAttributes) => void;



    /**
     * Implements IDirective
     * @constructs MemoryPlayerDirective
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerAPI} MemoryPlayerAPI - The service that manages API calls.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     * @param {IMemoryPlayerControls} MemoryPlayerControls - The service that manages memory player controls.
     */
    constructor(
        private $location: angular.ILocationService,
        private MemoryPlayerAPI: IMemoryPlayerAPI,
        private MemoryPlayerState: IMemoryPlayerState,
        private MemoryPlayerControls: IMemoryPlayerControls
    ) {
        MemoryPlayerDirective.prototype.link = (scope: angular.IScope, element: JQuery, attrs: angular.IAttributes): void => {

            // Gets player state from URL
            let state: any = this.$location.search();


            // Gets playlists using API
            this.MemoryPlayerAPI.getPlaylists().then((response: IPlaylists): void => {

                // Sets playlists response in service
                this.MemoryPlayerState.setPlaylists(response);

                // Restart if available settings allow, else start fresh
                if (isRestartable(state)) {

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
            scope.$on('$locationChangeStart', ($event: angular.IAngularEvent, newUrl: string, oldUrl: string): void => {

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
        };
    }
}


// Test available settings for restartability
function isRestartable(state: any): boolean {

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

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
