var MemoryPlayerConfig = /** @class */ (function () {
    function MemoryPlayerConfig($locationProvider, JPlayerProvider) {
        this.$locationProvider = $locationProvider;
        this.JPlayerProvider = JPlayerProvider;
        this.JPlayerIds = {
            jPlayer: '#mp-jquery_jplayer',
            cssSelectorAncestor: '#mp-jp_container'
        };
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
        this.JPlayerProvider.$setIds(this.JPlayerIds);
        this.JPlayerProvider.$setOptions(this.JPlayerOptions);
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
    function MemoryPlayerRun($rootScope, $window) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.$rootScope.$on('$locationChangeSuccess', function ($event, newUrl, oldUrl) {
            if (newUrl !== oldUrl) {
                _this.$window.location.href = newUrl;
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
        .config(MemoryPlayerConfig.instance)
        .run(MemoryPlayerRun.instance);
})();
