var MemoryPlayerProvider = (function () {
    function MemoryPlayerProvider() {
    }
    /**
     * Gets jplayer ids and instance.
     * @memberof MemoryPlayerProvider
     * @instance
     * @returns {IJPlayerProvider} - The return value of provider.
     */
    MemoryPlayerProvider.prototype.$get = function () {
        var _this = this;
        return {
            ids: this.JPlayerIds,
            create: function (playlist) {
                // If jplayer is defined then allow create
                if (angular.isUndefined(_this.JPlayer)) {
                    // Sets immutable jplayer instance
                    _this.JPlayer = new jPlayerPlaylist(_this.JPlayerIds, playlist, _this.JPlayerOptions);
                }
            },
            instance: function () {
                return _this.JPlayer;
            }
        };
    };
    /**
     * Sets jplayer ids.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {IJPlayerIds} ids - The CSS selectors to instantiate a playlist jplayer.
     */
    MemoryPlayerProvider.prototype.$setIds = function (ids) {
        this.JPlayerIds = ids;
    };
    /**
     * Sets jplayer options.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {any} options - The options to instantiate a playlist jplayer.
     */
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
