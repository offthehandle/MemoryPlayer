var MemoryPlayerAPI = (function () {
    /**
     * Implements IMemoryPlayerAPI
     * @constructs MemoryPlayerAPI
     * @param {IHttpService} $http - The core angular http service.
     * @param {ILogService} $log - The core angular log service.
     */
    function MemoryPlayerAPI($http, $log) {
        this.$http = $http;
        this.$log = $log;
        /**
         * @memberof MemoryPlayerAPI
         * @member {string} playlists - The path to playlists json file.
         * @private
         */
        this.playlists = '/lib/memory-player/dist/json/playlists.json';
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
    ;
    /**
     * Gets JSON file containing playlists.
     * @memberof MemoryPlayerAPI
     * @instance
     * @returns {IHttpPromise<IPlaylists>} - playlists on success and null on failure.
     */
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this.playlists)
            .then(function (response) {
            // Check for data in response
            if (response.hasOwnProperty('data') && response.data !== null) {
                // Return playlists
                return response.data;
            }
            else {
                // Remove player
                _this.removePlayer();
                return null;
            }
        }).catch(function (error) {
            // Remove player
            _this.removePlayer();
            // Log error
            _this.$log.log('XHR Failed for getPlaylists.');
            if (error.data) {
                _this.$log.log(error.data);
            }
            return null;
        });
    };
    return MemoryPlayerAPI;
}());
MemoryPlayerAPI.instance = [
    '$http',
    '$log',
    MemoryPlayerAPI
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerAPI', MemoryPlayerAPI.instance);
})();
