
class MemoryPlayerSharing implements IMemoryPlayerSharing {

    public static instance: any[] = [
        '$rootScope',
        'JPlayer',
        'MemoryPlayerState',
        MemoryPlayerSharing
    ];



    /**
     * Implements IMemoryPlayerSharing
     * @constructs MemoryPlayerSharing
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {IJPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private JPlayer: IJPlayerProvider,
        private MemoryPlayerState: IMemoryPlayerState
    ) {

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
        this.$rootScope.$watch((): IPlaylist => {

            return this.MemoryPlayerState.getPlaylist();

        }, (newPlaylist, oldPlaylist): void => {

            // If playlist changes then update
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {

                // Updates current playlist
                this.setShareVal('playlist', newPlaylist._id);
            }
        });


        // Watches state service for track change
        this.$rootScope.$watch((): ITrack => {

            return this.MemoryPlayerState.getTrack();

        }, (newTrack, oldTrack): void => {

            // If track changes then update
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {

                // Updates current track
                this.setShareVal('track', newTrack._id);


                // Resets is time used
                if (this.isTimeUsed) {

                    this.useTime();
                }
            }
        });


        // Observes player ready
        this.$rootScope.$on('MP:Ready', ($event: angular.IAngularEvent): void => {

            /**
             * Observes player loaded.
             */
            angular.element(this.jPlayerId).bind($.jPlayer.event.loadeddata, (event: IjPlayerEvent): void => {

                this.$rootScope.$evalAsync((): void => {

                    // Updates track length
                    this.trackDuration = event.jPlayer.status.duration;
                });
            });
        });
    }



    /**
     * @memberof MemoryPlayerSharing
     * @member {boolean} isTimeUsed - True if time is used, else false.
     * @default false
     */
    public isTimeUsed: boolean;


    /**
     * @memberof MemoryPlayerSharing
     * @member {string} jPlayerId - The player id from {@link MemoryPlayerProvider}.
     * @private
     */
    private jPlayerId: string;


    /**
     * @memberof MemoryPlayerSharing
     * @member {string} sharelink - The backlink URL to share media in memory player.
     */
    public sharelink: string = `${window.location.protocol}//${window.location.hostname}${window.location.pathname}`;


    /**
     * @memberof MemoryPlayerSharing
     * @member {number} sharelinkTime - The optional start at time for share link.
     * @default 00:00
     */
    public sharelinkTime: string;


    /**
     * @memberof MemoryPlayerSharing
     * @member {number} trackDuration - The current track duration.
     * @private
     */
    private trackDuration: number;



    /**
     * Cancels timer when user focuses start time input.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    public cancelTimer(): void {

        // Cancels time update observer
        angular.element(this.jPlayerId).unbind($.jPlayer.event.timeupdate);
    }


    /**
     * Updates value specified by key.
     * @memberof MemoryPlayerSharing
     * @instance
     * @param {string} key - The key of value to be set.
     * @param {string | number} value - The value to set.
     */
    public setShareVal(key: string, value: any): void {

        // Sets default share link values
        let sharelink: Array<IShare> = [],
            playlist: IShare = { name: 'playlist', value: null },
            track: IShare = { name: 'track', value: null },
            time: IShare = { name: 'time', value: 0 },
            volume: IShare = { name: 'volume', value: 0.8 },
            isMuted: IShare = { name: 'isMuted', value: false },
            isPaused: IShare = { name: 'isPaused', value: false };


        // Gets query string
        let settings: string = this.sharelink.split('?')[1] || null;

        // If share link is a string convert params to objects
        if (angular.isString(settings)) {

            // Decodes the URI
            settings = decodeURIComponent((settings).replace(/\+/g, '%20'));

            let params: Array<string> = settings.split(/&(?!amp;)/g);

            // Stores all editable values from prior setting
            params.map(param => {

                let setting: Array<string> = param.split('=');

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

                let parsedTime: any = value;

                // If time has a semicolon convert to seconds
                if (parsedTime.indexOf(':') > -1) {

                    // Converts hh:mm:ss to seconds
                    parsedTime = parsedTime.split(':')
                        .reverse()
                        .map(Number)
                        .reduce(function (total: number, currentValue: number, index: number) {
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
        let updatedSettings: string = $.param(sharelink);

        // Sets share link with updated values
        this.sharelink = `${this.sharelink.split('?')[0]}?${updatedSettings}`;
    }


    /**
     * Copies share link to clipboard.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    public share(): void {

        // Gets share link element
        let sharelink = document.getElementById('mp-share-link') as HTMLInputElement;

        // Selects share link text
        sharelink.select();

        // Copies text to clipboard
        document.execCommand('copy');
    }


    /**
     * Updates time in share link.
     * @memberof MemoryPlayerSharing
     * @instance
     * @param {string} updatedTime - The updated sharelink time.
     */
    public updateTime(updatedTime: string): void {

        // Includes time in share link
        this.isTimeUsed = true;

        // Sets time in share link
        this.setShareVal('time', updatedTime);
    }


    /**
     * Updates the share link time value when start time is used.
     * @memberof MemoryPlayerSharing
     * @instance
     */
    public useTime(): void {

        // Sets use time to latest user setting
        this.isTimeUsed = !this.isTimeUsed;
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .service('MemoryPlayerSharing', MemoryPlayerSharing.instance);
})();
