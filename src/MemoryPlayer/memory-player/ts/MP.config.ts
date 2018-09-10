
class MemoryPlayerConfig {

    public static instance: any[] = [
        '$locationProvider',
        'JPlayerProvider',
        MemoryPlayerConfig
    ];



    /**
     * @constructs MemoryPlayerConfig
     * @param {ILocationProvider} $locationProvider - The core angular location provider service.
     * @param {MemoryPlayerProvider} JPlayerProvider - Provides jplayer for memory player.
     */
    constructor(
        private $locationProvider: angular.ILocationProvider,
        private JPlayerProvider: MemoryPlayerProvider
    ) {

        // Sets jplayer ids
        this.JPlayerProvider.$setIds(this.JPlayerIds);

        // Sets jplayer options
        this.JPlayerProvider.$setOptions(this.JPlayerOptions);


        // Configures HTML5 mode
        this.$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }



    /**
     * @memberof MemoryPlayerConfig
     * @member {IJPlayerIds} JPlayerIds - The CSS selectors to instantiate a playlist jplayer.
     * @private
     */
    private JPlayerIds: IJPlayerIds = {
        jPlayer: '#mp-jquery_jplayer',
        cssSelectorAncestor: '#mp-jp_container'
    };


    /**
     * @memberof MemoryPlayerConfig
     * @member {any} JPlayerOptions - The options to instantiate a playlist jplayer.
     * @private
     */
    private JPlayerOptions: any = {
        swfPath: '/js/jquery.jplayer.swf',

        supplied: 'mp3',

        wmode: 'window',

        audioFullScreen: false,

        smoothPlayBar: false,

        keyEnabled: false,

        playlistOptions: {

            enableRemoveControls: false,

            displayTime: 0,

            addTime: 0,

            removeTime: 0,

            shuffleTime: 0
        }
    };
}



class MemoryPlayerRun {

    public static instance: any[] = [
        '$rootScope',
        '$window',
        MemoryPlayerRun
    ];



    /**
     * @constructs MemoryPlayerRun
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {IWindowService} $window - The core angular window service.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private $window: angular.IWindowService
    ) {

        /**
         * Observes location change success
         */
        this.$rootScope.$on('$locationChangeSuccess', ($event: angular.IAngularEvent, newUrl: string, oldUrl: string): void => {

            // If page changes then navigate to new page
            if (newUrl !== oldUrl) {

                // Navigates to new page
                this.$window.location.href = newUrl;
            }
        });
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .config(MemoryPlayerConfig.instance)
        .run(MemoryPlayerRun.instance);
})();
