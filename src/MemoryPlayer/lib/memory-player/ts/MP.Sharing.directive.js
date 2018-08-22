var SharingDirective = (function () {
    /**
     * Implements IDirective
     * @constructs SharingDirective
     * @param {IMemoryPlayerSharing} MemoryPlayerSharing - The service that manages memory player link sharing.
     */
    function SharingDirective(MemoryPlayerSharing) {
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        /**
         * @memberof SharingDirective
         * @member {string} restrict - The directive restriction - attribute only.
         */
        this.restrict = 'A';
        /**
         * @memberof SharingDirective
         * @member {boolean} scope - The directive scope.
         */
        this.scope = true;
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
        };
    }
    SharingDirective.instance = function () {
        var directive = function (MemoryPlayerSharing) {
            return new SharingDirective(MemoryPlayerSharing);
        };
        directive['$inject'] = [
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
