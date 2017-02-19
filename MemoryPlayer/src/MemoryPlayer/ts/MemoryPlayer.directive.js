var MemoryPlayerDirective = (function () {
    /**
     * Implements IDirective
     * @constructs MemoryPlayerDirective
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerFactory} MemoryPlayerFactory - The Memory Player factory.
     */
    function MemoryPlayerDirective($location, MemoryPlayerFactory) {
        var _this = this;
        this.$location = $location;
        this.MemoryPlayerFactory = MemoryPlayerFactory;
        /**
         * @memberof MemoryPlayerDirective
         * @member {string} restrict - The directive restriction.
         */
        this.restrict = 'A';
        /**
         * @memberof MemoryPlayerDirective
         * @member {boolean} scope - The directive scope.
         */
        this.scope = false;
        /**
         * @memberof MemoryPlayerDirective
         * @member {boolean} replace - Whether the directive should replace its calling node.
         */
        this.replace = true;
        /**
         * @memberof MemoryPlayerDirective
         * @member {string} templateUrl - The url to the HTML template.
         */
        this.templateUrl = '/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
            var playerState = _this.$location.search();
            if (playerState.hasOwnProperty('playlist') && playerState.hasOwnProperty('track') && playerState.hasOwnProperty('time') && playerState.hasOwnProperty('volume') && playerState.hasOwnProperty('isMuted') && playerState.hasOwnProperty('isPaused')) {
                var playerInfo_1 = {
                    track: parseInt(playerState.track),
                    time: parseInt(playerState.time),
                    volume: parseFloat(playerState.volume),
                    isMuted: playerState.isMuted,
                    isPaused: playerState.isPaused
                };
                MemoryPlayerFactory.fetchPlaylists(function () {
                    scope.player.playlists = MemoryPlayerFactory.getAllPlaylists();
                    MemoryPlayerFactory.createPlayer(playerState.playlist, playerInfo_1);
                });
            }
            else {
                MemoryPlayerFactory.fetchPlaylists(function () {
                    scope.player.playlists = MemoryPlayerFactory.getAllPlaylists();
                    for (var playlist in scope.player.playlists) {
                        break;
                    }
                    MemoryPlayerFactory.createPlayer(scope.player.playlists[playlist]._id, null);
                });
            }
        };
    }
    MemoryPlayerDirective.instance = function () {
        var directive = function ($location, MemoryPlayerFactory) {
            return new MemoryPlayerDirective($location, MemoryPlayerFactory);
        };
        directive['$inject'] = [
            '$location',
            'MemoryPlayerFactory'
        ];
        return directive;
    };
    return MemoryPlayerDirective;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
