
class MemoryPlayerSharing implements IMemoryPlayerSharing {

    public static instance: any[] = [
        '$interval',
        MemoryPlayerSharing
    ];



    /**
     * Implements IMemoryPlayerSharing
     * @constructs MemoryPlayerSharing
     * @param {IIntervalService} $interval - The core angular interval service.
     */
    constructor(
        private $interval: angular.IIntervalService
    ) {


        /**
         * Event reporting that the selected track is loaded.
         *
         * @listens MemoryPlayerState#event:MemoryPlayer:TrackLoaded
         */
        //this.$rootScope.$on('MemoryPlayer:TrackLoaded', ($event: angular.IAngularEvent, duration: number) => {

        //    this.trackDuration = duration;
        //});


        /**
         * Event reporting that the playlist has changed.
         *
         * @listens MemoryPlayerState#event:MemoryPlayer:NewPlaylist
         */
        //this.$rootScope.$on('MemoryPlayer:NewPlaylist', ($event: angular.IAngularEvent, playlist: IPlaylist) => {

            //if (this.isShareable) {

            //    this.setShareLink('playlist', playlist._id);
            //}
        //});


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

        //        this.shareLinkTimer = this.$interval(() => {

        //            this.shareLinkTime = $.jPlayer.convertTime(this.MemoryPlayerService.getTime());

        //        }, 1000);
        //    }
        //});


        /**
         * Event reporting that the track has changed.
         *
         * @listens MemoryPlayerState#event:MemoryPlayer:NewTrack
         */
        //this.$rootScope.$on('MemoryPlayer:NewTrack', ($event: angular.IAngularEvent, track: ITrack) => {

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
     * @member {number} trackDuration - The duration of the current track.
     * @default 0
     */
    private trackDuration: number;





    /**
     * @memberof MemoryPlayerController
     * @member {boolean} isShareable - True if the share link is enabled and false if it is not.
     * @default true
     */
    public isShareable: boolean = true;


    /**
     * @memberof MemoryPlayerController
     * @member {string} shareLink - The share link URL.
     */
    public shareLink: string = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;


    /**
     * @memberof MemoryPlayerController
     * @member {boolean} isTimeUsed - True if the share link start time is used and false if it is not.
     * @default false
     */
    public isTimeUsed: boolean = false;


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
     * Copies the share link to the clipboard.
     * @memberof MemoryPlayerController
     * @instance
     */
    public share(): void {

        let shareLink = document.getElementById('mp-share-link') as HTMLInputElement;

        shareLink.select();

        document.execCommand('copy');
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .service('MemoryPlayerSharing', MemoryPlayerSharing.instance);
})();
