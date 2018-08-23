
class MemoryPlayerAPI implements IMemoryPlayerAPI {

    public static instance: any[] = [
        '$http',
        '$log',
        MemoryPlayerAPI
    ];



    /**
     * Implements IMemoryPlayerAPI
     * @constructs MemoryPlayerAPI
     * @param {IHttpService} $http - The core angular http service.
     * @param {ILogService} $log - The core angular log service.
     */
    constructor(
        private $http: angular.IHttpService,
        private $log: angular.ILogService
    ) { }



    /**
     * @memberof MemoryPlayerAPI
     * @member {string} playlists - The path to retrieve playlists.
     * @private
     */
    private playlists: string = '/lib/memory-player/dist/json/playlists.json';


    /**
     * Removes player if playlists unavailable.
     * @memberof MemoryPlayerAPI
     * @instance
     * @private
     */
    private removePlayer(): void {

        angular.element('#memory-player').remove();
    };



    /**
     * Gets playlists JSON response.
     * @memberof MemoryPlayerAPI
     * @instance
     * @returns {IHttpPromise<IPlaylists>} - playlists on success and null on failure.
     */
    public getPlaylists(): angular.IHttpPromise<IPlaylists> {

        return this.$http.get(this.playlists)
            .then((response: angular.IHttpPromiseCallbackArg<IPlaylists>): angular.IHttpPromiseCallbackArg<IPlaylists> => {

                // If response has data then return it
                if (response.hasOwnProperty('data') && response.data !== null) {

                    // Returns playlists
                    return response.data;

                } else {

                    // Removes player
                    this.removePlayer();

                    return null;
                }

            }).catch((error: angular.IHttpPromiseCallbackArg<IHttpErrorResponse>): angular.IHttpPromiseCallbackArg<IHttpErrorResponse> => {

                // Removes player
                this.removePlayer();

                // Logs error
                this.$log.log('XHR Failed for getPlaylists.');

                if (error.data) {

                    this.$log.log(error.data);
                }

                return null;
            });
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .service('MemoryPlayerAPI', MemoryPlayerAPI.instance);
})();
