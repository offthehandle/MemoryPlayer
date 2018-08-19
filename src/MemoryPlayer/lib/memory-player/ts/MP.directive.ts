
class MemoryPlayerDirective implements angular.IDirective {

    public static instance() {
        var directive = ($location: angular.ILocationService, MemoryPlayerAPI: IMemoryPlayerAPI, MemoryPlayerState: IMemoryPlayerState, MemoryPlayerControls: IMemoryPlayerControls) => {
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
     * @member {boolean} scope - The directive scope.
     */
    public scope: boolean = true;


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
        MemoryPlayerDirective.prototype.link = (scope: IMemoryPlayerDirective, element: JQuery, attrs: angular.IAttributes) => {

            // Set option for share link
            scope.isShareable = scope.$eval(attrs['isShareable']) || false;

            // Get player state from URL
            let state: any = this.$location.search();


            // Get playlists from json file
            this.MemoryPlayerAPI.getPlaylists().then((response: IPlaylists) => {

                // Set playlists response in service
                this.MemoryPlayerState.setPlaylists(response);

                // Restart if available settings allow, else start fresh
                if (isRestartable(state)) {

                    // Set restart settings
                    let settings: IRestartSettings = {
                        track: parseInt(state.track),
                        time: parseInt(state.time),
                        volume: parseFloat(state.volume),
                        isMuted: state.isMuted,
                        isPaused: state.isPaused,
                    };

                    this.MemoryPlayerControls.showtime(state.playlist, settings);

                } else {

                    // Get name of first playlist
                    let playlist: string = Object.keys(response)[0];

                    // Set player to it
                    this.MemoryPlayerControls.showtime(response[playlist]._id);
                }
            });


            /**
             * Core Angular event used to append query string for continuous playback.
             *
             * ?playlist=playlist&track=track&time=time&volume=volume&isMuted=isMuted&isPaused=isPaused
             *
             * playlist = id of the selected playlist
             * track = id of the selected track
             * time = track time returned by internal jPlayer event
             * volume = the player volume
             * isMuted = the player is muted (true) or not (false)
             * isPaused = the player is paused (true) or not (false)
             *
             * @listens MemoryPlayerState#event:$locationChangeStart
             */
            scope.$on('$locationChangeStart', ($event: angular.IAngularEvent, newUrl: string, oldUrl: string) => {

                if (newUrl !== oldUrl) {

                    var newUrlPath = this.$location.url();

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

    // Set success as initial test result
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


    // Return test result
    return isRestartable;
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
