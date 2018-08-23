var SharingDirective = (function () {
    function SharingDirective(JPlayer, MemoryPlayerSharing) {
        var _this = this;
        this.JPlayer = JPlayer;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        this.restrict = 'A';
        this.scope = {
            currentTrack: '<',
            cancelTimer: '&',
            share: '&',
            toggleDropdown: '&',
            updateTime: '&',
            useTime: '&'
        };
        this.replace = true;
        this.templateUrl = '/lib/memory-player/dist/html/mp-sharing.html';
        SharingDirective.prototype.link = function (scope, element, attrs) {
            scope.isTimeUsed = false;
            scope.sharelink = null;
            scope.sharelinkTime = '00:00';
            var unbindSharelinkWatch = scope.$watch(function () {
                return _this.MemoryPlayerSharing.sharelink;
            }, function (newSharelink, oldSharelink) {
                if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {
                    scope.sharelink = newSharelink;
                }
            });
            var unbindIsTimeUsedWatch = scope.$watch(function () {
                return _this.MemoryPlayerSharing.isTimeUsed;
            }, function (newValue, oldValue) {
                if (angular.isDefined(newValue) && newValue !== oldValue) {
                    scope.isTimeUsed = newValue;
                    if (scope.isTimeUsed) {
                        angular.element(_this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, function (event) {
                            scope.$evalAsync(function () {
                                scope.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                                _this.MemoryPlayerSharing.setShareVal('time', scope.sharelinkTime);
                            });
                        });
                    }
                    else {
                        angular.element(_this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);
                        _this.MemoryPlayerSharing.setShareVal('time', '0');
                    }
                }
            });
            scope.$on('$destroy', function () {
                unbindSharelinkWatch();
                unbindIsTimeUsedWatch();
            });
        };
    }
    SharingDirective.instance = function () {
        var directive = function (JPlayer, MemoryPlayerSharing) {
            return new SharingDirective(JPlayer, MemoryPlayerSharing);
        };
        directive['$inject'] = [
            'JPlayer',
            'MemoryPlayerSharing',
        ];
        return directive;
    };
    return SharingDirective;
}());
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .directive('sharing', SharingDirective.instance());
})();
