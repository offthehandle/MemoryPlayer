var MemoryPlayerProvider = (function () {
    function MemoryPlayerProvider() {
    }
    MemoryPlayerProvider.prototype.$get = function () {
        var _this = this;
        return {
            ids: this.JPlayerIds,
            create: function (tracks) {
                if (angular.isUndefined(_this.JPlayer)) {
                    _this.JPlayer = new jPlayerPlaylist(_this.JPlayerIds, tracks, _this.JPlayerOptions);
                }
            },
            instance: function () {
                return _this.JPlayer;
            }
        };
    };
    MemoryPlayerProvider.prototype.$setIds = function (ids) {
        this.JPlayerIds = ids;
    };
    MemoryPlayerProvider.prototype.$setOptions = function (options) {
        this.JPlayerOptions = options;
    };
    return MemoryPlayerProvider;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .provider('JPlayer', MemoryPlayerProvider);
})();
