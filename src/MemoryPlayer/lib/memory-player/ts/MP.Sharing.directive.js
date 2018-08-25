var SharingDirective = (function () {
    /**
     * Implements IDirective
     * @constructs SharingDirective
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerSharing} MemoryPlayerSharing - The service that manages memory player link sharing.
     */
    function SharingDirective(JPlayer, MemoryPlayerSharing) {
        var _this = this;
        this.JPlayer = JPlayer;
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        /**
         * @memberof SharingDirective
         * @member {string} restrict - The directive restriction - attribute only.
         */
        this.restrict = 'A';
        /**
         * @memberof SharingDirective
         * @member {{[boundProperty: string]: string}} scope - The directive scope.
         */
        this.scope = {
            currentTrack: '<',
            cancelTimer: '&',
            share: '&',
            toggleDropdown: '&',
            updateTime: '&',
            useTime: '&'
        };
        /**
         * @memberof SharingDirective
         * @member {boolean} replace - Whether the directive should replace its calling node.
         */
        this.replace = true;
        /**
         * @memberof SharingDirective
         * @member {string} templateUrl - The url to the HTML template.
         */
        this.templateUrl = '/lib/memory-player/dist/html/mp-sharing.html';
        SharingDirective.prototype.link = function (scope, element, attrs) {
            // Sets initial sharing values
            scope.isTimeUsed = false;
            scope.sharelink = null;
            scope.sharelinkTime = '00:00';
            // Watches sharing service for sharelink change
            var unbindSharelinkWatch = scope.$watch(function () {
                return _this.MemoryPlayerSharing.sharelink;
            }, function (newSharelink, oldSharelink) {
                // If sharelink changes then update
                if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {
                    // Updates sharelink
                    scope.sharelink = newSharelink;
                }
            });
            // Watches sharing service for is time used change
            var unbindIsTimeUsedWatch = scope.$watch(function () {
                return _this.MemoryPlayerSharing.isTimeUsed;
            }, function (newValue, oldValue) {
                // If is time used changes then update
                if (angular.isDefined(newValue) && newValue !== oldValue) {
                    // Updates is time used
                    scope.isTimeUsed = newValue;
                    // If time is used then bind time update, else unbind and start at beginning
                    if (scope.isTimeUsed) {
                        /**
                         * Observes time updated.
                         */
                        angular.element(_this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, function (event) {
                            scope.$evalAsync(function () {
                                // Updates share link time
                                scope.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                                _this.MemoryPlayerSharing.setShareVal('time', scope.sharelinkTime);
                            });
                        });
                    }
                    else {
                        // Unbind time update
                        angular.element(_this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);
                        // Starts at beginning
                        scope.sharelinkTime = '00:00';
                        _this.MemoryPlayerSharing.setShareVal('time', '0');
                    }
                }
            });
            // Cleans up watches to prevent memory leaks
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
