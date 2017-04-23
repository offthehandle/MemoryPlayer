var MemoryPlayerDirective = (function () {
    function MemoryPlayerDirective($location) {
        var _this = this;
        this.$location = $location;
        this.restrict = 'A';
        this.scope = false;
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
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
