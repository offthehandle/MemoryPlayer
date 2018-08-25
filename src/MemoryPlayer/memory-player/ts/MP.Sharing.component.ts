
class MPSharingController implements angular.IController {

    public static instance: any[] = [
        '$rootScope',
        'JPlayer',
        'MemoryPlayerSharing',
        MPSharingController
    ];



    /**
     * Implements IController
     * @constructs MPSharingController
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerSharing} MemoryPlayerSharing - The service that manages memory player link sharing.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private JPlayer: IJPlayerProvider,
        private MemoryPlayerSharing: IMemoryPlayerSharing
    ) {

        // Sets initial sharing values
        this.isTimeUsed = false;
        this.sharelink = null;
        this.sharelinkTime = '00:00';


        // Watches sharing service for sharelink change
        this.unbindSharelink = this.$rootScope.$watch((): string => {

            return this.MemoryPlayerSharing.sharelink;

        }, (newSharelink, oldSharelink): void => {

            // If sharelink changes then update
            if (angular.isDefined(newSharelink) && newSharelink !== oldSharelink) {

                // Updates sharelink
                this.sharelink = newSharelink;
            }
        });


        // Watches sharing service for is time used change
        this.unbindIsTimeUsed = this.$rootScope.$watch((): boolean => {

            return this.MemoryPlayerSharing.isTimeUsed;

        }, (newValue, oldValue): void => {

            // If is time used changes then update
            if (angular.isDefined(newValue) && newValue !== oldValue) {

                // Updates is time used
                this.isTimeUsed = newValue;


                // If time is used then bind time update, else unbind and start at beginning
                if (this.isTimeUsed) {

                    /**
                     * Observes time updated.
                     */
                    angular.element(this.JPlayer.ids.jPlayer).bind($.jPlayer.event.timeupdate, (event: IjPlayerEvent): void => {

                        this.$rootScope.$evalAsync((): void => {

                            // Updates share link time
                            this.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);

                            this.MemoryPlayerSharing.setShareVal('time', this.sharelinkTime);
                        });
                    });

                } else {

                    // Unbinds time update
                    angular.element(this.JPlayer.ids.jPlayer).unbind($.jPlayer.event.timeupdate);

                    // Starts at beginning
                    this.sharelinkTime = '00:00';

                    this.MemoryPlayerSharing.setShareVal('time', '0');
                }
            }
        });
    }



    /**
     * @memberof MPSharingController
     * @member {boolean} isTimeUsed - Current playlist.
     */
    public isTimeUsed: boolean;


    /**
     * @memberof MPSharingController
     * @member {string} sharelink - Current playlist.
     */
    public sharelink: string;


    /**
     * @memberof MPSharingController
     * @member {string} sharelinkTime - Current playlist.
     */
    public sharelinkTime: string;



    /**
     * Unbinds sharelink watch
     * @memberof MPSharingController
     * @instance
     * @private
     */
    private unbindSharelink: () => void;


    /**
     * Unbinds is time used watch
     * @memberof MPSharingController
     * @instance
     * @private
     */
    private unbindIsTimeUsed: () => void;



    // Cleans up watches to prevent memory leaks
    public $onDestroy() {

        this.unbindSharelink();
        this.unbindIsTimeUsed();
    }
}



class MPSharingComponent implements angular.IComponentOptions {

    /**
     * @memberof MPSharingComponent
     * @member {any} controller - The component controller.
     */
    public controller: any;


    /**
     * @memberof MPSharingComponent
     * @member {string} controllerAs - The reference to component controller.
     */
    public controllerAs: string;


    /**
     * @memberof MPSharingComponent
     * @member {{ [boundProperty: string]: string }} bindings - The component properties bound to the controller.
     */
    public bindings: { [boundProperty: string]: string };


    /**
     * @memberof MPSharingComponent
     * @member {string} templateUrl - The url to the HTML template.
     */
    public templateUrl: string;



    /**
     * Implements IComponentOptions
     * @constructs MPSharingComponent
     */
    constructor() {

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
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .component('mpSharing', new MPSharingComponent());
})();
