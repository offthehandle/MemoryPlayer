
class SharingDirective implements angular.IDirective {

    public static instance() {
        var directive = (JPlayer: IJPlayerProvider, MemoryPlayerSharing: IMemoryPlayerSharing): SharingDirective => {
            return new SharingDirective(JPlayer, MemoryPlayerSharing);
        };

        directive['$inject'] = [
            'JPlayer',
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
     * @member {{[boundProperty: string]: string}} scope - The directive scope.
     */
    public scope: { [boundProperty: string]: string } = {
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
    public link: (scope: ISharing, element: JQuery, attrs: angular.IAttributes) => void;



    /**
     * Implements IDirective
     * @constructs SharingDirective
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerSharing} MemoryPlayerSharing - The service that manages memory player link sharing.
     */
    constructor(
        private JPlayer: IJPlayerProvider,
        private MemoryPlayerSharing: IMemoryPlayerSharing
    ) {
        SharingDirective.prototype.link = (scope: ISharing, element: JQuery, attrs: angular.IAttributes): void => {

            // Sets initial sharing values
            scope.isTimeUsed = false;
            scope.sharelink = null;
            scope.sharelinkTime = '00:00';


            // Watches sharing service for sharelink change
            let unbindSharelinkWatch = scope.$watch((): string => {

                return this.MemoryPlayerSharing.sharelink;

            }, function (newSharelink, oldSharelink): void {

                // If sharelink changes then update
                if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {

                    // Updates sharelink
                    scope.sharelink = newSharelink;
                }
            });


            // Watches sharing service for is time used change
            let unbindIsTimeUsedWatch = scope.$watch((): boolean => {

                return this.MemoryPlayerSharing.isTimeUsed;

            }, (newValue, oldValue): void => {

                // If is time used changes then update
                if (angular.isDefined(newValue) && newValue !== oldValue) {

                    // Updates is time used
                    scope.isTimeUsed = newValue;


                    // If time is used then bind time update, else unbind and start at beginning
                    if (scope.isTimeUsed) {

                        /**
                         * Observes time updated.
                         */
                        angular.element(this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, (event: IjPlayerEvent): void => {

                            scope.$evalAsync((): void => {

                                // Updates share link time
                                scope.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);

                                this.MemoryPlayerSharing.setShareVal('time', scope.sharelinkTime);
                            });
                        });

                    } else {

                        // Unbind time update
                        angular.element(this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);

                        // Starts at beginning
                        this.MemoryPlayerSharing.setShareVal('time', '0');
                    }
                }
            });


            // Cleans up watches to prevent memory leaks
            scope.$on('$destroy', function (): void {

                unbindSharelinkWatch();
                unbindIsTimeUsedWatch();
            });
        };
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .directive('sharing', SharingDirective.instance());
})();
