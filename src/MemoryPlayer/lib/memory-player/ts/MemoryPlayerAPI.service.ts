
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
    constructor(private $http: angular.IHttpService, private $log: angular.ILogService) {
    }



    /**
     * @memberof MemoryPlayerAPI
     * @member {string} _endPoint - The path to the playlists json file.
     * @private
     */
    private _endPoint: string = '/lib/memory-player/dist/json/playlists.json';


    /**
     * Removes the player from the page if it does not initialize successfully.
     * @memberof MemoryPlayerAPI
     * @instance
     * @private
     */
    private _emptyAudioPlayer(): void {
        angular.element('#memory-player').remove();
    };



    /**
     * Gets the JSON file containing the playlists data.
     * @memberof MemoryPlayerAPI
     * @instance
     * @returns {IHttpPromise} - A promise that returns the data from the playlists json file on success and null on failure.
     */
    public getPlaylists(): angular.IHttpPromise<{}> {

        return this.$http.get(this._endPoint)
            .then((response: angular.IHttpPromiseCallbackArg<IMemoryPlaylists>): angular.IHttpPromiseCallbackArg<IMemoryPlaylists> => {

                if (response.hasOwnProperty('data') && response.data !== null) {

                    return response.data;

                } else {

                    this._emptyAudioPlayer();

                    return null;
                }

            }).catch((error: angular.IHttpPromiseCallbackArg<IHttpErrorResponse>): angular.IHttpPromiseCallbackArg<IHttpErrorResponse> => {

                this._emptyAudioPlayer();

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
