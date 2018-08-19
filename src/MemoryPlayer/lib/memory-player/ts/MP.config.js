var MemoryPlayerConfig = (function () {
    /**
     * @constructs MemoryPlayerConfig
     * @param {ILocationProvider} $locationProvider - The core angular location provider service.
     * @param {MemoryPlayerProvider} JPlayerProvider - The provider service that manages jplayer.
     */
    function MemoryPlayerConfig($locationProvider, JPlayerProvider) {
        this.$locationProvider = $locationProvider;
        this.JPlayerProvider = JPlayerProvider;
        this.JPlayerIds = {
            jPlayer: '#mp-jquery_jplayer',
            cssSelectorAncestor: '#mp-jp_container'
        };
        this.JPlayerOptions = {
            wmode: 'window',
            audioFullScreen: false,
            smoothPlayBar: false,
            keyEnabled: false,
            playlistOptions: {
                enableRemoveControls: false
            }
        };
        this.JPlayerProvider.$setIds(this.JPlayerIds);
        this.JPlayerProvider.$setOptions(this.JPlayerOptions);
        this.$locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }
    return MemoryPlayerConfig;
}());
MemoryPlayerConfig.instance = [
    '$locationProvider',
    'JPlayerProvider',
    MemoryPlayerConfig
];
var MemoryPlayerRun = (function () {
    /**
     * @constructs MemoryPlayerRun
     * @param {ILocationProvider} $locationProvider - The core angular location provider service.
     */
    function MemoryPlayerRun($rootScope, $window) {
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.$rootScope.$on('$locationChangeSuccess', function ($event, newUrl, oldUrl) {
            if (newUrl !== oldUrl) {
                this.$window.location.href = newUrl;
            }
        });
    }
    return MemoryPlayerRun;
}());
MemoryPlayerRun.instance = [
    '$rootScope',
    '$window',
    MemoryPlayerRun
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .config(MemoryPlayerConfig.instance);
    angular.module('MemoryPlayer')
        .run(MemoryPlayerRun.instance);
})();
