var MemoryPlayerDirective = (function () {
    /**
     * Implements IDirective
     * @constructs MemoryPlayerDirective
     * @param {ILocationService} $location - The core angular location service.
     */
    function MemoryPlayerDirective($location) {
        var _this = this;
        this.$location = $location;
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
            scope.isShareable = scope.$eval(attrs['isShareable']) || false;
            var playerState = _this.$location.search();
            if (playerState.hasOwnProperty('playlist') && playerState.hasOwnProperty('track') && playerState.hasOwnProperty('time') && playerState.hasOwnProperty('volume') && playerState.hasOwnProperty('isMuted') && playerState.hasOwnProperty('isPaused')) {
                var playerInfo = {
                    track: parseInt(playerState.track),
                    time: parseInt(playerState.time),
                    volume: parseFloat(playerState.volume),
                    isMuted: playerState.isMuted,
                    isPaused: playerState.isPaused
                };
                scope.$emit('MemoryPlayer:directiveReady', { playlist: playerState.playlist, info: playerInfo });
            }
            else {
                scope.$emit('MemoryPlayer:directiveReady', null);
            }
        };
    }
    MemoryPlayerDirective.instance = function () {
        var directive = function ($location) {
            return new MemoryPlayerDirective($location);
        };
        directive['$inject'] = [
            '$location'
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
