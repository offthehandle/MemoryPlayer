var MemoryPlayerAPI = (function () {
    function MemoryPlayerAPI($http, $log) {
        this.$http = $http;
        this.$log = $log;
        this.playlists = '/memory-player/dist/json/playlists.json';
    }
    MemoryPlayerAPI.prototype.removePlayer = function () {
        angular.element('#memory-player').remove();
    };
    MemoryPlayerAPI.prototype.getPlaylists = function () {
        var _this = this;
        return this.$http.get(this.playlists)
            .then(function (response) {
            if (response.hasOwnProperty('data') && response.data !== null) {
                return response.data;
            }
            else {
                _this.removePlayer();
                return null;
            }
        }).catch(function (error) {
            _this.removePlayer();
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
