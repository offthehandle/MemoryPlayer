var MemoryPlayerSharing = (function () {
    /**
     * Implements IMemoryPlayerSharing
     * @constructs MemoryPlayerSharing
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {ITimeoutService} $timeout - The core angular timeout service.
     * @param {MemoryPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     */
    function MemoryPlayerSharing($rootScope, $timeout, JPlayer, MemoryPlayerState) {
        var _this = this;
        this.$rootScope = $rootScope;
        this.$timeout = $timeout;
        this.JPlayer = JPlayer;
        this.MemoryPlayerState = MemoryPlayerState;
        /**
         * @memberof MemoryPlayerController
         * @member {string} sharelink - The link back URL to share media in memory player.
         */
        this.sharelink = window.location.protocol + "//" + window.location.hostname + window.location.pathname;
        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;
        // Initializes share link to ignore time
        this.isTimeUsed = false;
        // Sets initial start time for share link
        this.sharelinkTime = '00:00';
        // Sets initial values for share link
        if (angular.isDefined(this.MemoryPlayerState.getPlaylist())) {
            this.setShareVal('playlist', this.MemoryPlayerState.getPlaylist()._id);
        }
        if (angular.isDefined(this.MemoryPlayerState.getTrack())) {
            this.setShareVal('track', this.MemoryPlayerState.getTrack()._id);
        }
        // Watches state service for playlist change
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getPlaylist();
        }, function (newPlaylist, oldPlaylist) {
            // If playlist changes then update
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {
                // Updates current playlist
                _this.setShareVal('playlist', newPlaylist._id);
            }
        });
        // Watches state service for track change
        this.$rootScope.$watch(function () {
            return _this.MemoryPlayerState.getTrack();
        }, function (newTrack, oldTrack) {
            // If track changes then update
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {
                // Updates current track
                _this.setShareVal('track', newTrack._id);
                if (_this.isTimeUsed) {
                    _this.useTime();
                }
                /**
                 * Observes time updated.
                 */
                angular.element(_this.jPlayerId).bind($.jPlayer.event.timeupdate, function (event) {
                    _this.$rootScope.$evalAsync(function () {
                        // Updates share link time
                        _this.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                    });
                });
            }
        });
        // Brief timeout for player ready
        this.$timeout(function () {
            /**
             * Observes player loaded.
             */
            angular.element(_this.jPlayerId).bind($.jPlayer.event.loadeddata, function (event) {
                _this.$rootScope.$evalAsync(function () {
                    // Updates track length
                    _this.trackDuration = event.jPlayer.status.duration;
                });
            });
            /**
             * Observes time updated.
             */
            angular.element(_this.jPlayerId).bind($.jPlayer.event.timeupdate, function (event) {
                _this.$rootScope.$evalAsync(function () {
                    // Updates share link time
                    _this.sharelinkTime = $.jPlayer.convertTime(event.jPlayer.status.currentTime);
                });
            });
        }, 300);
    }
    /**
     * Cancels timer when user focuses start time input.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    MemoryPlayerSharing.prototype.cancelTimer = function () {
        // Cancels time update observer
        angular.element(this.jPlayerId).unbind($.jPlayer.event.timeupdate);
    };
    /**
     * Updates value specified by key.
     * @memberof MemoryPlayerSharing
     * @instance
     * @param {string} key - The key of value to be set.
     * @param {string | number} value - The value to set.
     */
    MemoryPlayerSharing.prototype.setShareVal = function (key, value) {
        // Sets default share link values
        var sharelink = [], playlist = { name: 'playlist', value: null }, track = { name: 'track', value: null }, time = { name: 'time', value: 0 }, volume = { name: 'volume', value: 0.8 }, isMuted = { name: 'isMuted', value: false }, isPaused = { name: 'isPaused', value: false };
        // Gets query string
        var settings = this.sharelink.split('?')[1] || null;
        // If share link is a string convert params to objects
        if (angular.isString(settings)) {
            // Decodes the URI
            settings = decodeURIComponent((settings).replace(/\+/g, '%20'));
            var params = settings.split(/&(?!amp;)/g);
            // Stores all editable values from prior setting
            params.map(function (param) {
                var setting = param.split('=');
                switch (setting[0]) {
                    case 'playlist':
                        playlist.value = setting[1];
                        break;
                    case 'track':
                        track.value = setting[1];
                        break;
                    case 'time':
                        time.value = setting[1];
                        break;
                }
            });
        }
        // Updates edited value
        switch (key) {
            case 'playlist':
                playlist.value = value;
                break;
            case 'track':
                track.value = value;
                break;
            case 'time':
                var parsedTime = value;
                // If time has a semicolon convert to seconds
                if (parsedTime.indexOf(':') > -1) {
                    // Converts hh:mm:ss to seconds
                    parsedTime = parsedTime.split(':')
                        .reverse()
                        .map(Number)
                        .reduce(function (total, currentValue, index) {
                        return total + currentValue * Math.pow(60, index);
                    });
                }
                // If start time is less than track length set value, else start from beginning
                time.value = (parsedTime < this.trackDuration) ? parsedTime : 0;
                break;
        }
        // Stores all values in ordered array
        sharelink.push(playlist);
        sharelink.push(track);
        sharelink.push(time);
        sharelink.push(volume);
        sharelink.push(isMuted);
        sharelink.push(isPaused);
        // Converts array to query string
        var updatedSettings = $.param(sharelink);
        // Sets share link with updated values
        this.sharelink = this.sharelink.split('?')[0] + "?" + updatedSettings;
    };
    /**
     * Copies share link to clipboard.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    MemoryPlayerSharing.prototype.share = function () {
        // Gets share link element
        var sharelink = document.getElementById('mp-share-link');
        // Selects share link text
        sharelink.select();
        // Copies text to clipboard
        document.execCommand('copy');
    };
    /**
     * Updates time in share link.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    MemoryPlayerSharing.prototype.updateTime = function () {
        // Includes time in share link
        this.isTimeUsed = true;
        // Sets time in share link
        this.setShareVal('time', this.sharelinkTime);
    };
    /**
     * Updates the share link time value when start time is used.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    MemoryPlayerSharing.prototype.useTime = function () {
        // Sets use time to latest user setting
        this.isTimeUsed = !this.isTimeUsed;
        // If time is use then set start time, else start at beginning
        if (this.isTimeUsed) {
            // Set start time
            this.setShareVal('time', this.sharelinkTime);
        }
        else {
            // Start at beginning
            this.setShareVal('time', '0');
        }
    };
    return MemoryPlayerSharing;
}());
MemoryPlayerSharing.instance = [
    '$rootScope',
    '$timeout',
    'JPlayer',
    'MemoryPlayerState',
    MemoryPlayerSharing
];
(function () {
    'use strict';
    angular.module('MemoryPlayer')
        .service('MemoryPlayerSharing', MemoryPlayerSharing.instance);
})();
