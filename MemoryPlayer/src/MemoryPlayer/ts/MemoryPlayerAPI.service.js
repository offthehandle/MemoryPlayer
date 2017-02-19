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
         * @member {string} _endPoint - The path to the playlists json file.
         * @private
         */
        this._endPoint = '/dist/json/playlists.json';
    }
    /**
     * Removes the player from the page if it does not initialize successfully.
     * @memberof MemoryPlayerAPI
     * @instance
     * @private
     */
    MemoryPlayerAPI.prototype._emptyAudioPlayer = function () {
        angular.element('#memory-player').remove();
    };
    ;
    /**
     * Gets the JSON file containing the playlists data.
     * @memberof MemoryPlayerAPI
     * @instance
     * @returns {IHttpPromise} - A promise that returns the data from the playlists json file on success and null on failure.
     */
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this._endPoint)
            .then(function (response) {
            if (response.hasOwnProperty('data') && response.data !== null) {
                return response.data;
            }
            else {
                _this._emptyAudioPlayer();
                return null;
            }
        }).catch(function (error) {
            _this._emptyAudioPlayer();
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
