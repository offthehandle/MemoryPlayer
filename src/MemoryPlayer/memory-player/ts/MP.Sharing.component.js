var MPSharingController = (function () {
    function MPSharingController($rootScope, JPlayer, MemoryPlayerSharing) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.JPlayer = JPlayer;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        this.isTimeUsed = false;
        this.sharelink = null;
        this.sharelinkTime = '00:00';
        this.unbindSharelink = this.$rootScope.$watch(function () {
            return _this.MemoryPlayerSharing.sharelink;
        }, function (newSharelink, oldSharelink) {
            if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {
                _this.sharelink = newSharelink;
            }
        });
        this.unbindIsTimeUsed = this.$rootScope.$watch(function () {
            return _this.MemoryPlayerSharing.isTimeUsed;
        }, function (newValue, oldValue) {
            if (angular.isDefined(newValue) && newValue !== oldValue) {
                _this.isTimeUsed = newValue;
                if (_this.isTimeUsed) {
                    angular.element(_this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, function (event) {
                        _this.$rootScope.$evalAsync(function () {
                            _this.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                            _this.MemoryPlayerSharing.setShareVal('time', _this.sharelinkTime);
                        });
                    });
                }
                else {
                    angular.element(_this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);
                    _this.sharelinkTime = '00:00';
                    _this.MemoryPlayerSharing.setShareVal('time', '0');
                }
            }
        });
    }
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
