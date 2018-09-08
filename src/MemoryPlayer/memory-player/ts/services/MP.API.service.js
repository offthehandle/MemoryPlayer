var MemoryPlayerAPI = /** @class */ (function () {
    /**
     * Implements IMemoryPlayerAPI
     * @constructs MemoryPlayerAPI
     * @param {IHttpService} $http - The core angular http service.
     * @param {ILogService} $log - The core angular log service.
     */
    function MemoryPlayerAPI($http, $log) {
        this.$http = $http;
        this.$log = $log;
        // Sets URL to playlists json
        this.playlists = '/memory-player/dist/json/playlists.json';
    }
    /**
     * Removes player if playlists unavailable.
     * @memberof MemoryPlayerAPI
     * @instance
     * @private
     */
    MemoryPlayerAPI.prototype.removePlayer = function () {
        angular.element('#memory-player').remove();
    };
    /**
     * Gets playlists JSON response.
     * @memberof MemoryPlayerAPI
     * @instance
     * @returns {IHttpPromise<IPlaylists>} - playlists on success and null on failure.
     */
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this.playlists)
            .then(function (response) {
            // If response has data then return it
            if (response.hasOwnProperty('data') && response.data !== null) {
                // Returns playlists
                return response.data;
            }
            else {
                // Removes player
                _this.removePlayer();
                return null;
            }
        }).catch(function (error) {
            // Removes player
            _this.removePlayer();
            // Logs error
            _this.$log.log('XHR Failed for getPlaylists.');
            if (error.data) {
                _this.$log.log(error.data);
            }
            return null;
        });
    };
    MemoryPlayerAPI.instance = [
        '$http',
        '$log',
        MemoryPlayerAPI
    ];
    return MemoryPlayerAPI;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerAPI', MemoryPlayerAPI.instance);
})();
