
declare var jPlayerPlaylist: any;

class MemoryPlayerProvider implements angular.IServiceProvider {

    /**
     * @memberof MemoryPlayerProvider
     * @member {IJPlayerIds} id - The CSS selectors to instantiate a playlist jPlayer.
     * @private
     */
    private jPlayerIds: IJPlayerIds;


    /**
     * @memberof MemoryPlayerProvider
     * @member {any} jPlayerOptions - The options to instantiate a playlist jPlayer.
     * @private
     */
    private jPlayerOptions: any;



    $get(): IJPlayerProvider {

        let JPlayer: IPlaylistJPlayer;

        return {
            create: (playlist: Array<ITrack>,): void => {

                JPlayer = new jPlayerPlaylist(this.jPlayerIds, playlist, this.jPlayerOptions);
            },
            ids: this.jPlayerIds,
            instance: (): IPlaylistJPlayer => {

                return JPlayer;
            }
        };
    }


    $setIds(ids: IJPlayerIds): void {

        this.jPlayerIds = ids;
    }


    $setOptions(options: any): void {

        this.jPlayerOptions = options;
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .provider('JPlayer', MemoryPlayerProvider);
})();
