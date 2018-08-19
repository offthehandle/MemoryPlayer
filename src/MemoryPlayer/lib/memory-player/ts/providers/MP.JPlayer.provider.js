var MemoryPlayerProvider = (function () {
    function MemoryPlayerProvider() {
    }
    MemoryPlayerProvider.prototype.$get = function () {
        var _this = this;
        var JPlayer;
        return {
            create: function (playlist) {
                JPlayer = new jPlayerPlaylist(_this.jPlayerIds, playlist, _this.jPlayerOptions);
            },
            ids: this.jPlayerIds,
            instance: function () {
                return JPlayer;
            }
        };
    };
    MemoryPlayerProvider.prototype.$setIds = function (ids) {
        this.jPlayerIds = ids;
    };
    MemoryPlayerProvider.prototype.$setOptions = function (options) {
        this.jPlayerOptions = options;
    };
    return MemoryPlayerProvider;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .provider('JPlayer', MemoryPlayerProvider);
})();
