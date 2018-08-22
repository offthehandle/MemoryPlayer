
class SharingDirective implements angular.IDirective {

    public static instance() {
        var directive = (MemoryPlayerSharing: IMemoryPlayerSharing): SharingDirective => {
            return new SharingDirective(MemoryPlayerSharing);
        };

        directive['$inject'] = [
            'MemoryPlayerSharing',
        ];

        return directive;
    }



    /**
     * @memberof SharingDirective
     * @member {string} restrict - The directive restriction - attribute only.
     */
    public restrict: string = 'A';


    /**
     * @memberof SharingDirective
     * @member {boolean} scope - The directive scope.
     */
    public scope: boolean = true;


    /**
     * @memberof SharingDirective
     * @member {boolean} replace - Whether the directive should replace its calling node.
     */
    public replace: boolean = true;


    /**
     * @memberof SharingDirective
     * @member {string} templateUrl - The url to the HTML template.
     */
    public templateUrl: string = '/lib/memory-player/dist/html/mp-sharing.html';


    /**
     * @memberof SharingDirective
     * @member link - The link option for the directive.
     */
    public link: (scope: angular.IScope, element: JQuery, attrs: angular.IAttributes) => void;



    /**
     * Implements IDirective
     * @constructs SharingDirective
     * @param {IMemoryPlayerSharing} MemoryPlayerSharing - The service that manages memory player link sharing.
     */
    constructor(
        private MemoryPlayerSharing: IMemoryPlayerSharing
    ) {
        SharingDirective.prototype.link = (scope: angular.IScope, element: JQuery, attrs: angular.IAttributes): void => {
        };
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .directive('sharing', SharingDirective.instance());
})();
