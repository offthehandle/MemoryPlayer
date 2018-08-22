var SharingDirective = (function () {
    function SharingDirective(MemoryPlayerSharing) {
        this.MemoryPlayerSharing = MemoryPlayerSharing;
        this.restrict = 'A';
        this.scope = true;
        this.replace = true;
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
