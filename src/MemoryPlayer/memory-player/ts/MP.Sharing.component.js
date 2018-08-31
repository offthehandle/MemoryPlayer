var MPSharingController = (function () {
    /**
     * Implements IController
     * @constructs MPSharingController
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerSharing} MemoryPlayerSharing - The service that manages memory player link sharing.
     */
    function MPSharingController($rootScope, JPlayer, MemoryPlayerSharing) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        // Sets initial sharing values
        this.sharelink = this.MemoryPlayerSharing.sharelink;
        this.isTimeUsed = false;
        this.sharelinkTime = '00:00';
        // Watches sharing service for sharelink change
        this.unbindSharelink = this.$rootScope.$watch(function () {
            return _this.MemoryPlayerSharing.sharelink;
        }, function (newSharelink, oldSharelink) {
            // If sharelink changes then update
            if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {
                // Updates sharelink
                _this.sharelink = newSharelink;
            }
        });
        // Watches sharing service for is time used change
        this.unbindIsTimeUsed = this.$rootScope.$watch(function () {
            return _this.MemoryPlayerSharing.isTimeUsed;
        }, function (newValue, oldValue) {
            // If is time used changes then update
            if (angular.isDefined(newValue) && newValue !== oldValue) {
                // Updates is time used
                _this.isTimeUsed = newValue;
                // If time is used then bind time update, else unbind and start at beginning
                if (_this.isTimeUsed) {
                    /**
                     * Observes time updated.
                     */
                    angular.element(_this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, function (event) {
                        _this.$rootScope.$evalAsync(function () {
                            // Updates share link time
                            _this.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                            _this.MemoryPlayerSharing.setShareVal('time', _this.sharelinkTime);
                        });
                    });
                }
                else {
                    // Unbinds time update
                    angular.element(_this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);
                    // Starts at beginning
                    _this.sharelinkTime = '00:00';
                    _this.MemoryPlayerSharing.setShareVal('time', '0');
                }
            }
        });
    }
    // Cleans up watches to prevent memory leaks
    MPSharingController.prototype.$onDestroy = function () {
        this.unbindSharelink();
        this.unbindIsTimeUsed();
    };
    return MPSharingController;
}());
MPSharingController.instance = [
    '$rootScope',
    'JPlayer',
    'MemoryPlayerSharing',
    MPSharingController
];
var MPSharingComponent = (function () {
    /**
     * Implements IComponentOptions
     * @constructs MPSharingComponent
     */
    function MPSharingComponent() {
        this.controller = MPSharingController.instance;
        this.controllerAs = 'sharing';
        this.bindings = {
            currentTrack: '<',
            cancelTimer: '&',
            share: '&',
            toggleDropdown: '&',
            updateTime: '&',
            useTime: '&'
        };
        this.templateUrl = '/memory-player/dist/html/mp-sharing.html';
    }
    return MPSharingComponent;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .component('mpSharing', new MPSharingComponent());
})();
