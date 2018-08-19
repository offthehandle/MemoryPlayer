var MemoryPlayerSharing = (function () {
    /**
     * Implements IMemoryPlayerSharing
     * @constructs MemoryPlayerSharing
     * @param {IIntervalService} $interval - The core angular interval service.
     */
    function MemoryPlayerSharing($interval) {
        /**
         * Event reporting that the selected track is loaded.
         *
         * @listens MemoryPlayerState#event:MemoryPlayer:TrackLoaded
         */
        //this.$rootScope.$on('MemoryPlayer:TrackLoaded', ($event: angular.IAngularEvent, duration: number) => {
        this.$interval = $interval;
        /**
         * @memberof MemoryPlayerController
         * @member {boolean} isShareable - True if the share link is enabled and false if it is not.
         * @default true
         */
        this.isShareable = true;
        /**
         * @memberof MemoryPlayerController
         * @member {string} shareLink - The share link URL.
         */
        this.shareLink = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        /**
         * @memberof MemoryPlayerController
         * @member {boolean} isTimeUsed - True if the share link start time is used and false if it is not.
         * @default false
         */
        this.isTimeUsed = false;
        /**
         * @memberof MemoryPlayerController
         * @member {number} shareLinkTime - The start time for the share link if used.
         * @default 0
         */
        this.shareLinkTime = '00:00';
        /**
         * @memberof MemoryPlayerController
         * @member {IPromise<any>} shareLinkTimer - The timer used to update share link time.
         * @default null
         */
        this.shareLinkTimer = null;
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
     * Updates the share link value specified by the key.
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} key - The key of the share option to be set.
     * @param {string | number} value - The value of the share option to be set.
     */
    MemoryPlayerSharing.prototype.setShareLink = function (key, value) {
        var shareLink = [], playlist = { name: 'playlist', value: null }, track = { name: 'track', value: null }, time = { name: 'time', value: 0 }, volume = { name: 'volume', value: 0.8 }, isMuted = { name: 'isMuted', value: false }, isPaused = { name: 'isPaused', value: true };
        var playerSettings = this.shareLink.split('?')[1] || null;
        // Converts share link from string to objects
        if (playerSettings !== null) {
            playerSettings = decodeURIComponent((playerSettings).replace(/\+/g, '%20'));
            var ps = playerSettings.split(/&(?!amp;)/g);
            // Stores all editable share option values from prior settings
            for (var i = 0, l = ps.length; i < l; i++) {
                var pair = ps[i].split('=');
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
                var parsedTime = value;
                // Converts hh:mm:ss to seconds
                if (parsedTime.indexOf(':') > -1) {
                    parsedTime = parsedTime.split(':')
                        .reverse()
                        .map(Number)
                        .reduce(function (total, currentValue, index) {
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
        this.shareLink = this.shareLink.split('?')[0] + "?" + $.param(shareLink);
    };
    /**
     * Updates the share link time value when start time is used.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerSharing.prototype.useTime = function () {
        this.isTimeUsed = !this.isTimeUsed;
        if (this.isTimeUsed) {
            this.setShareLink('time', this.shareLinkTime);
        }
        else {
            this.setShareLink('time', '0');
        }
    };
    /**
     * Triggers update when start time is changed.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerSharing.prototype.updateTime = function () {
        if (this.shareLinkTimer !== null) {
            this.$interval.cancel(this.shareLinkTimer);
        }
        this.isTimeUsed = true;
        this.setShareLink('time', this.shareLinkTime);
    };
    /**
     * Cancels timer when start time input is focused.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerSharing.prototype.cancelTimer = function () {
        if (this.shareLinkTimer !== null) {
            this.$interval.cancel(this.shareLinkTimer);
        }
    };
    /**
     * Copies the share link to the clipboard.
     * @memberof MemoryPlayerController
     * @instance
     */
    MemoryPlayerSharing.prototype.share = function () {
        var shareLink = document.getElementById('mp-share-link');
        shareLink.select();
        document.execCommand('copy');
    };
    return MemoryPlayerSharing;
}());
MemoryPlayerSharing.instance = [
    '$interval',
    MemoryPlayerSharing
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerSharing', MemoryPlayerSharing.instance);
})();
