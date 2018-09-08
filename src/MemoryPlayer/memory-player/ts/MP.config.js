var MemoryPlayerConfig = /** @class */ (function () {
    /**
     * @constructs MemoryPlayerConfig
     * @param {ILocationProvider} $locationProvider - The core angular location provider service.
     * @param {MemoryPlayerProvider} JPlayerProvider - Provides jplayer for memory player.
     */
    function MemoryPlayerConfig($locationProvider, JPlayerProvider) {
        this.$locationProvider = $locationProvider;
        this.JPlayerProvider = JPlayerProvider;
        /**
         * @memberof MemoryPlayerConfig
         * @member {IJPlayerIds} JPlayerIds - The CSS selectors to instantiate a playlist jplayer.
         * @private
         */
        this.JPlayerIds = {
            jPlayer: '#mp-jquery_jplayer',
            cssSelectorAncestor: '#mp-jp_container'
        };
        /**
         * @memberof MemoryPlayerConfig
         * @member {any} JPlayerOptions - The options to instantiate a playlist jplayer.
         * @private
         */
        this.JPlayerOptions = {
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
    MemoryPlayerConfig.instance = [
        '$locationProvider',
        'JPlayerProvider',
        MemoryPlayerConfig
    ];
    return MemoryPlayerConfig;
}());
var MemoryPlayerRun = /** @class */ (function () {
    /**
     * @constructs MemoryPlayerRun
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {IWindowService} $window - The core angular window service.
     */
    function MemoryPlayerRun($rootScope, $window) {
        this.$rootScope = $rootScope;
        this.$window = $window;
        /**
         * Observes location change success
         */
        this.$rootScope.$on('$locationChangeSuccess', function ($event, newUrl, oldUrl) {
            // If page changes then navigate to new page
            if (newUrl !== oldUrl) {
                // Navigates to new page
                this.$window.location.href = newUrl;
            }
        });
    }
    MemoryPlayerRun.instance = [
        '$rootScope',
        '$window',
        MemoryPlayerRun
    ];
    return MemoryPlayerRun;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .config(MemoryPlayerConfig.instance);
    angular.module('MemoryPlayer')
        .run(MemoryPlayerRun.instance);
})();
