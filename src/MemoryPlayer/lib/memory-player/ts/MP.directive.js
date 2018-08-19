var MemoryPlayerDirective = (function () {
    function MemoryPlayerDirective($location, MemoryPlayerAPI, MemoryPlayerState, MemoryPlayerControls) {
        var _this = this;
        this.$location = $location;
        this.MemoryPlayerAPI = MemoryPlayerAPI;
        this.MemoryPlayerState = MemoryPlayerState;
        this.MemoryPlayerControls = MemoryPlayerControls;
        this.restrict = 'A';
        this.scope = true;
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/memory-player.html';
        MemoryPlayerDirective.prototype.link = function (scope, element, attrs) {
            scope.isShareable = scope.$eval(attrs['isShareable']) || false;
            var state = _this.$location.search();
            _this.MemoryPlayerAPI.getPlaylists().then(function (response) {
                _this.MemoryPlayerState.setPlaylists(response);
                if (isRestartable(state)) {
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
                    var playlist = Object.keys(response)[0];
                    _this.MemoryPlayerControls.showtime(response[playlist]._id);
                }
            });
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
function isRestartable(state) {
    var isRestartable = true;
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
    return isRestartable;
}
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .directive('memoryPlayer', MemoryPlayerDirective.instance());
})();
