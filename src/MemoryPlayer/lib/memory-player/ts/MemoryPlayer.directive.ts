
class MemoryPlayerDirective implements angular.IDirective {

    public static instance() {
        var directive = ($location: angular.ILocationService) => {
            return new MemoryPlayerDirective($location);
        };

        directive['$inject'] = [
            '$location'
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
     */
    constructor(
        private $location: angular.ILocationService
    ) {
        MemoryPlayerDirective.prototype.link = (scope: angular.IScope, element: JQuery, attrs: angular.IAttributes) => {

            scope.isShareable = scope.$eval(attrs['isShareable']) || false;

            let playerState = this.$location.search();

            if (playerState.hasOwnProperty('playlist') && playerState.hasOwnProperty('track') && playerState.hasOwnProperty('time') && playerState.hasOwnProperty('volume') && playerState.hasOwnProperty('isMuted') && playerState.hasOwnProperty('isPaused')) {

                let playerInfo: IMemoryPlayerInfo = {
                    track: parseInt(playerState.track),
                    time: parseInt(playerState.time),
                    volume: parseFloat(playerState.volume),
                    isMuted: playerState.isMuted,
                    isPaused: playerState.isPaused
                };

                scope.$emit('MemoryPlayer:directiveReady', { playlist: playerState.playlist, info: playerInfo });

            } else {

                scope.$emit('MemoryPlayer:directiveReady', null);
            }
        };
    }
}


(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
