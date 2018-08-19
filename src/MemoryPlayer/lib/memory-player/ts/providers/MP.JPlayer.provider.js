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
     * Instantiates jplayer.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {IJPlayerIds} cssSelectors - The CSS selectors to instantiate a playlist jplayer.
     * @param {Array<ITrack>} playlist - The default playlist.
     * @param {any} options - The options to instantiate a playlist jplayer.
     */
    MemoryPlayerProvider.prototype.$setInstance = function (cssSelectors, playlist, options) {
        var _this = this;
        window.setTimeout(function () {
            _this.JPlayer = new jPlayerPlaylist(cssSelectors, playlist, options);
        }, 200);
    };
    return MemoryPlayerProvider;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .provider('JPlayer', MemoryPlayerProvider);
})();
