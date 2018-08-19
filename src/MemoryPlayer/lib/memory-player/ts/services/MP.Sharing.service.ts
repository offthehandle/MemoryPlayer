
class MemoryPlayerSharing implements IMemoryPlayerSharing {

    public static instance: any[] = [
        '$rootScope',
        '$timeout',
        '$interval',
        'JPlayer',
        'MemoryPlayerState',
        MemoryPlayerSharing
    ];



    /**
     * Implements IMemoryPlayerSharing
     * @constructs MemoryPlayerSharing
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {ITimeoutService} $timeout - The core angular timeout service.
     * @param {IIntervalService} $interval - The core angular interval service.
     * @param {MemoryPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private $timeout: angular.ITimeoutService,
        private $interval: angular.IIntervalService,
        private JPlayer: IJPlayerProvider,
        private MemoryPlayerState: IMemoryPlayerState
    ) {

        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;


        // If sharing is enabled then set initial values
        if (this.isShareable) {

            this.setShareLink('playlist', this.MemoryPlayerState.getPlaylist()._id);
            this.setShareLink('track', this.MemoryPlayerState.getTrack()._id);
        }


        // Watches state service for playlist change
        this.$rootScope.$watch((): IPlaylist => {

            return this.MemoryPlayerState.getPlaylist();

        }, (newPlaylist, oldPlaylist): void => {

            // If playlist changes then update
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {

                // Updates current playlist
                this.setShareLink('playlist', newPlaylist);
            }
        });


        // Watches state service for track change
        this.$rootScope.$watch((): ITrack => {

            return this.MemoryPlayerState.getTrack();

        }, (newTrack, oldTrack): void => {

            // If track changes then update
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {

                // Updates current track
                this.setShareLink('track', newTrack);
            }
        });


        this.$timeout((): void => {

            /**
             * Observes player loaded.
             */
            angular.element(this.jPlayerId).bind($.jPlayer.event.loadeddata, function (event: IjPlayerEvent): void {

                this.trackDuration = event.jPlayer.status.duration;
            });

            /**
             * Observes playback started.
             */
            angular.element(this.jPlayerId).bind($.jPlayer.event.playing, function (event: IjPlayerEvent): void {

                console.log(event.jPlayer.status.currentTime);
            });

        }, 200);


        /**
         * Observes that track has played.
         *
         * @listens MemoryPlayerState#event:MemoryPlayer:TrackPlayed
         */
        //this.$rootScope.$on('MemoryPlayer:TrackPlayed', (): void => {

        //    if (this.isShareable) {

        //        if (this.shareLinkTimer !== null) {

        //            this.$interval.cancel(this.shareLinkTimer);
        //        }

        //        this.shareLinkTimer = this.$interval((): void => {

        //            this.shareLinkTime = $.jPlayer.convertTime(this.MemoryPlayerService.getTime());

        //        }, 1000);
        //    }
        //});


        /**
         * Event reporting that the track has changed.
         *
         * @listens MemoryPlayerState#event:MemoryPlayer:NewTrack
         */
        //this.$rootScope.$on('MemoryPlayer:NewTrack', ($event: angular.IAngularEvent, track: ITrack): void => {

        //    if (this.isShareable) {

        //        this.setShareLink('track', track._id);

        //        if (this.isTimeUsed) {

        //            this.useTime();
        //        }
        //    }
        //});
    }



    /**
     * @memberof MemoryPlayerController
     * @member {boolean} isShareable - True if the share link is enabled and false if it is not.
     * @default true
     */
    public isShareable: boolean = true;


    /**
     * @memberof MemoryPlayerController
     * @member {boolean} isTimeUsed - True if the share link start time is used and false if it is not.
     * @default false
     */
    public isTimeUsed: boolean = false;


    /**
     * @memberof MemoryPlayerControls
     * @member {string} jPlayerId - The player id from {@link MemoryPlayerProvider}.
     * @private
     */
    private jPlayerId: string;


    /**
     * @memberof MemoryPlayerController
     * @member {string} shareLink - The share link URL.
     */
    public shareLink: string = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;


    /**
     * @memberof MemoryPlayerController
     * @member {number} shareLinkTime - The start time for the share link if used.
     * @default 0
     */
    public shareLinkTime: string = '00:00';


    /**
     * @memberof MemoryPlayerController
     * @member {IPromise<any>} shareLinkTimer - The timer used to update share link time.
     * @default null
     */
    public shareLinkTimer: angular.IPromise<any> = null;


    /**
     * @memberof MemoryPlayerController
     * @member {number} trackDuration - The duration of the current track.
     * @default 0
     */
    private trackDuration: number;



    /**
     * Cancels timer when start time input is focused.
     * @memberof MemoryPlayerController
     * @instance
     */
    public cancelTimer(): void {

        if (this.shareLinkTimer !== null) {

            this.$interval.cancel(this.shareLinkTimer);
        }
    }


    /**
     * Updates the share link value specified by the key.
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} key - The key of the share option to be set.
     * @param {string | number} value - The value of the share option to be set.
     */
    public setShareLink(key: string, value: string | number | any): void {

        let shareLink: Array<IShare> = [],
            playlist: IShare = { name: 'playlist', value: null },
            track: IShare = { name: 'track', value: null },
            time: IShare = { name: 'time', value: 0 },
            volume: IShare = { name: 'volume', value: 0.8 },
            isMuted: IShare = { name: 'isMuted', value: false },
            isPaused: IShare = { name: 'isPaused', value: true };

        let playerSettings: string = this.shareLink.split('?')[1] || null;

        // Converts share link from string to objects
        if (playerSettings !== null) {

            playerSettings = decodeURIComponent((playerSettings).replace(/\+/g, '%20'));

            let ps: Array<string> = playerSettings.split(/&(?!amp;)/g);

            // Stores all editable share option values from prior settings
            for (let i = 0, l = ps.length; i < l; i++) {

                let pair = ps[i].split('=');

                switch (pair[0]) {
                    case 'playlist':
                        playlist.value = pair[1];
                        break;

                    case 'track':
                        track.value = pair[1];
                        break;

                    case 'time':
                        time.value = pair[1];
                        break;
                }
            }
        }

        // Updates the edited share option value
        switch (key) {
            case 'playlist':
                playlist.value = value;
                break;

            case 'track':
                track.value = value;
                break;

            case 'time':
                let parsedTime = value;

                // Converts hh:mm:ss to seconds
                if (parsedTime.indexOf(':') > -1) {

                    parsedTime = parsedTime.split(':')
                        .reverse()
                        .map(Number)
                        .reduce(function (total: number, currentValue: number, index: number) {
                            return total + currentValue * Math.pow(60, index);
                        });
                }

                time.value = (parsedTime < this.trackDuration) ? parsedTime : 0;
                break;
        }

        // Stores all share option values in ordered array
        shareLink.push(playlist);
        shareLink.push(track);
        shareLink.push(time);
        shareLink.push(volume);
        shareLink.push(isMuted);
        shareLink.push(isPaused);

        // Sets share link string with updated values
        this.shareLink = `${this.shareLink.split('?')[0]}?${$.param(shareLink)}`;
    }


    /**
     * Copies the share link to the clipboard.
     * @memberof MemoryPlayerController
     * @instance
     */
    public share(): void {

        let shareLink = document.getElementById('mp-share-link') as HTMLInputElement;

        shareLink.select();

        document.execCommand('copy');
    }


    /**
     * Triggers update when start time is changed.
     * @memberof MemoryPlayerController
     * @instance
     */
    public updateTime(): void {

        if (this.shareLinkTimer !== null) {

            this.$interval.cancel(this.shareLinkTimer);
        }

        this.isTimeUsed = true;

        this.setShareLink('time', this.shareLinkTime);
    }


    /**
     * Updates the share link time value when start time is used.
     * @memberof MemoryPlayerController
     * @instance
     */
    public useTime(): void {

        this.isTimeUsed = !this.isTimeUsed;

        if (this.isTimeUsed) {

            this.setShareLink('time', this.shareLinkTime);

        } else {

            this.setShareLink('time', '0');
        }
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .service('MemoryPlayerSharing', MemoryPlayerSharing.instance);
})();
