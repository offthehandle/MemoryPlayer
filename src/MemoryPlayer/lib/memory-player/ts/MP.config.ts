
class MemoryPlayerConfig {

    public static instance: any[] = [
        '$locationProvider',
        'JPlayerProvider',
        MemoryPlayerConfig
    ];



    /**
     * @constructs MemoryPlayerConfig
     * @param {ILocationProvider} $locationProvider - The core angular location provider service.
     * @param {MemoryPlayerProvider} JPlayerProvider - The provider service that manages jplayer.
     */
    constructor(
        private $locationProvider: angular.ILocationProvider,
        private JPlayerProvider: MemoryPlayerProvider
    ) {

        this.JPlayerProvider.$setIds(this.JPlayerIds);

        this.JPlayerProvider.$setOptions(this.JPlayerOptions);


        this.$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }



    private JPlayerIds = {
        jPlayer: '#mp-jquery_jplayer',
        cssSelectorAncestor: '#mp-jp_container'
    };


    private JPlayerOptions: any = {
        wmode: 'window',

        audioFullScreen: false,

        smoothPlayBar: false,

        keyEnabled: false,

        playlistOptions: {

            enableRemoveControls: false
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
     * @param {ILocationProvider} $locationProvider - The core angular location provider service.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private $window: angular.IWindowService
    ) {

        this.$rootScope.$on('$locationChangeSuccess', function ($event: angular.IAngularEvent, newUrl: string, oldUrl: string): void {

            if (newUrl !== oldUrl) {

                this.$window.location.href = newUrl;
            }

        });
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .config(MemoryPlayerConfig.instance);


    angular.module('MemoryPlayer')
        .run(MemoryPlayerRun.instance);
})();
