
interface IMemoryPlayerDirectiveScope extends angular.IScope {
    player: any;
}

class MemoryPlayerDirective implements angular.IDirective {

    public static instance() {
        var directive = ($location: angular.ILocationService, MemoryPlayerFactory: IMemoryPlayerFactory) => {
            return new MemoryPlayerDirective($location, MemoryPlayerFactory);
        };

        directive['$inject'] = [
            '$location',
            'MemoryPlayerFactory'
        ];

        return directive;
    }


    /**
     * @memberof MemoryPlayerDirective
     * @member {string} restrict - The directive restriction.
     */
    public restrict: string = 'A';


    /**
     * @memberof MemoryPlayerDirective
     * @member {boolean} scope - The directive scope.
     */
    public scope: boolean = false;


    /**
     * @memberof MemoryPlayerDirective
     * @member {boolean} replace - Whether the directive should replace its calling node.
     */
    public replace: boolean = true;


    /**
     * @memberof MemoryPlayerDirective
     * @member {string} templateUrl - The url to the HTML template.
     */
    public templateUrl: string = '/dist/html/memory-player.html';


    /**
     * @memberof MemoryPlayerDirective
     * @member link - The link option for the directive.
     */
    public link: (scope: IMemoryPlayerDirectiveScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => void;



    /**
     * Implements IDirective
     * @constructs MemoryPlayerDirective
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerFactory} MemoryPlayerFactory - The Memory Player factory.
     */
    constructor(private $location: angular.ILocationService, private MemoryPlayerFactory: IMemoryPlayerFactory) {
        MemoryPlayerDirective.prototype.link = (scope: IMemoryPlayerDirectiveScope, element: angular.IAugmentedJQuery, attrs: angular.IAttributes) => {

            let playerState = this.$location.search();

            if (playerState.hasOwnProperty('playlist') && playerState.hasOwnProperty('track') && playerState.hasOwnProperty('time') && playerState.hasOwnProperty('volume') && playerState.hasOwnProperty('isMuted') && playerState.hasOwnProperty('isPaused')) {

                let playerInfo: IMemoryPlayerInfo = {
                    track: parseInt(playerState.track),
                    time: parseInt(playerState.time),
                    volume: parseFloat(playerState.volume),
                    isMuted: playerState.isMuted,
                    isPaused: playerState.isPaused
                };

                MemoryPlayerFactory.fetchPlaylists(() => {

                    scope.player.playlists = MemoryPlayerFactory.getAllPlaylists();

                    MemoryPlayerFactory.createPlayer(playerState.playlist, playerInfo);
                });

            } else {

                MemoryPlayerFactory.fetchPlaylists(() => {

                    scope.player.playlists = MemoryPlayerFactory.getAllPlaylists();

                    for (var playlist in scope.player.playlists) {
                        break;
                    }

                    MemoryPlayerFactory.createPlayer(scope.player.playlists[playlist]._id, null);
                });
            }
        };
    }
}


(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
