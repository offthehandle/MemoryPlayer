var MemoryPlayerDirective = (function () {
    function MemoryPlayerDirective($location, MemoryPlayerFactory) {
        var _this = this;
        this.$location = $location;
        this.MemoryPlayerFactory = MemoryPlayerFactory;
        this.restrict = 'A';
        this.scope = false;
        this.replace = true;
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
