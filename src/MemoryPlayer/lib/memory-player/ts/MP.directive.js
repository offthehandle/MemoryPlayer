var MemoryPlayerDirective = (function () {
    /**
     * Implements IDirective
     * @constructs MemoryPlayerDirective
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerAPI} MemoryPlayerAPI - The service that manages API calls.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     * @param {IMemoryPlayerControls} MemoryPlayerControls - The service that manages memory player controls.
     */
    function MemoryPlayerDirective($location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$location = $location;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        /**
         * @memberof MemoryPlayerDirective
         * @member {string} restrict - The directive restriction - attribute only.
         */
        this.restrict = 'A';
        /**
         * @memberof MemoryPlayerDirective
         * @member {boolean} scope - The directive scope.
         */
        this.scope = true;
        /**
         * @memberof MemoryPlayerDirective
         * @member {boolean} replace - Whether the directive should replace its calling node.
         */
        this.replace = true;
        /**
         * @memberof MemoryPlayerDirective
         * @member {string} templateUrl - The url to the HTML template.
         */
        this.templateUrl = '/lib/memory-player/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
            // Set option for share link
            scope.isShareable = scope.$eval(attrs['isShareable']) || false;
            // Get player state from URL
            var state = _this.$location.search();
            // Get playlists from json file
            _this.MemoryPlayerAPI.getPlaylists().then(function (response) {
                // Set playlists response in service
                _this.MemoryPlayerState.setPlaylists(response);
                // Restart if available settings allow, else start fresh
                if (isRestartable(state)) {
                    // Set restart settings
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
                    // Get name of first playlist
                    var playlist = Object.keys(response)[0];
                    // Set player to it
                    _this.MemoryPlayerControls.showtime(response[playlist]._id);
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
// Test available settings for restartability
function isRestartable(state) {
    // Set success as initial test result
    var isRestartable = true;
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
