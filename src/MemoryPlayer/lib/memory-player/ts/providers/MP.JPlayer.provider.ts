
declare var jPlayerPlaylist: any;

class MemoryPlayerProvider implements angular.IServiceProvider {

    /**
     * @memberof MemoryPlayerProvider
     * @member {IPlaylistJPlayer} JPlayer - The jplayer instance for memory player.
     * @private
     */
    private JPlayer: IPlaylistJPlayer;


    /**
     * @memberof MemoryPlayerProvider
     * @member {IJPlayerIds} JPlayerIds - The CSS selectors to instantiate a playlist jplayer.
     * @private
     */
    private JPlayerIds: IJPlayerIds;


    /**
     * @memberof MemoryPlayerProvider
     * @member {any} JPlayerOptions - The options to instantiate a playlist jplayer.
     * @private
     */
    private JPlayerOptions: any;



    /**
     * Gets jplayer ids and instance.
     * @memberof MemoryPlayerProvider
     * @instance
     * @returns {IJPlayerProvider} - The return value of provider.
     */
    $get(): IJPlayerProvider {

        return {
            ids: this.JPlayerIds,
            create: (playlist: Array<ITrack>): void => {

                // If jplayer is defined then allow create
                if (angular.isUndefined(this.JPlayer)) {

                    // Sets immutable jplayer instance
                    this.JPlayer = new jPlayerPlaylist(this.JPlayerIds, playlist, this.JPlayerOptions);
                }
            },
            instance: (): IPlaylistJPlayer => {

                return this.JPlayer;
            }
        };
    }


    /**
     * Sets jplayer ids.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {IJPlayerIds} ids - The CSS selectors to instantiate a playlist jplayer.
     */
    $setIds(ids: IJPlayerIds): void {

        this.JPlayerIds = ids;
    }


    /**
     * Sets jplayer options.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {any} options - The options to instantiate a playlist jplayer.
     */
    $setOptions(options: any): void {

        this.JPlayerOptions = options;
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .provider('JPlayer', MemoryPlayerProvider);
})();
