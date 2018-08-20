
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
     * Gets jplayer ids and instance.
     * @memberof MemoryPlayerProvider
     * @instance
     * @returns {IJPlayerProvider} - The return value of provider.
     */
    $get(): IJPlayerProvider {

        return {
            ids: this.JPlayerIds,
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
     * Instantiates jplayer.
     * @memberof MemoryPlayerProvider
     * @instance
     * @param {IJPlayerIds} cssSelectors - The CSS selectors to instantiate a playlist jplayer.
     * @param {Array<ITrack>} playlist - The default playlist.
     * @param {any} options - The options to instantiate a playlist jplayer.
     */
    $setInstance(cssSelectors: IJPlayerIds, playlist: Array<ITrack>, options: any): void {

        window.setTimeout((): void => {

            this.JPlayer = new jPlayerPlaylist(cssSelectors, playlist, options);

        }, 300);
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .provider('JPlayer', MemoryPlayerProvider);
})();
