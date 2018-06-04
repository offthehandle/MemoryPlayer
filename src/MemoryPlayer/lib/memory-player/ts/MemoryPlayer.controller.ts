
class MemoryPlayerController implements angular.IController {

    public static instance: any[] = [
        '$rootScope',
        '$scope',
        '$location',
        '$interval',
        'MemoryPlayerFactory',
        MemoryPlayerController
    ];



    /**
     * Implements IController
     * @constructs MemoryPlayerController
     * @param {IRootScopeService} $rootScope - The core angular rootScope service.
     * @param {IScope} $scope - The core angular scope service.
     * @param {ILocationService} $location - The core angular location service.
     * @param {IIntervalService} $interval - The core angular interval service.
     * @param {IMemoryPlayerFactory} MemoryPlayerFactory - The Memory Player factory.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private $scope: angular.IScope,
        private $location: angular.ILocationService,
        private $interval: angular.IIntervalService,
        private MemoryPlayerFactory: IMemoryPlayerFactory
    ) {
        /**
         * Core Angular event used to append query string for continuous playback.
         *
         * ?playlist=playlist&track=track&time=time&volume=volume&isMuted=isMuted&isPaused=isPaused
         *
         * playlist = id of the selected playlist
         * track = id of the selected track
         * time = track time returned by internal jPlayer event
         * volume = the player volume
         * isMuted = the player is muted (true) or not (false)
         * isPaused = the player is paused (true) or not (false)
         *
         * @listens MemoryPlayerFactory#event:$locationChangeStart
         */
        this.$scope.$on('$locationChangeStart', (event: angular.IAngularEvent, newUrl: string, oldUrl: string) => {

            if (newUrl !== oldUrl) {

                var newUrlPath = this.$location.url();

                this.$location.path(newUrlPath.split('?')[0]).search({
                    playlist: this.MemoryPlayerFactory.getPlaylistById(),
                    track: this.MemoryPlayerFactory.getTrackById(),
                    time: this.MemoryPlayerFactory.getTime(),
                    volume: this.MemoryPlayerFactory.getVolume(),
                    isMuted: this.MemoryPlayerFactory.getIsMuted(),
                    isPaused: this.MemoryPlayerFactory.isPaused
                });
            }
        });


        /**
         * Event reporting that the directive is ready before initializing the player.
         *
         * @listens MemoryPlayerFactory#event:MemoryPlayer:directiveReady
         */
        this.$scope.$on('MemoryPlayer:directiveReady', (event: angular.IAngularEvent, remembered: IMemoryInit) => {

            this.MemoryPlayerFactory.fetchPlaylists(() => {

                this.playlists = this.MemoryPlayerFactory.getAllPlaylists();

                if (remembered === null) {

                    for (var playlist in this.playlists) {
                        break;
                    }

                    this.MemoryPlayerFactory.createPlayer(this.playlists[playlist]._id);

                } else {

                    this.MemoryPlayerFactory.createPlayer(remembered.playlist, remembered.info);
                }
            });
        });


        /**
         * Event reporting that the playlist has changed.
         *
         * @listens MemoryPlayerFactory#event:MemoryPlayer:playlistChanged
         */
        this.$rootScope.$on('MemoryPlayer:playlistChanged', (event: angular.IAngularEvent, playlist: IMemoryPlaylist) => {
            this.selectedPlaylist = playlist;

            if (this.isShareable) {

                this.setShareLink('playlist', playlist._id);
            }
        });


        /**
         * Event reporting that the track has changed.
         *
         * @listens MemoryPlayerFactory#event:MemoryPlayer:trackChanged
         */
        this.$rootScope.$on('MemoryPlayer:trackChanged', (event: angular.IAngularEvent, track: IMemoryTrack) => {
            this.selectedTrack = track;

            if (this.isShareable) {

                this.setShareLink('track', track._id);

                if (this.isTimeUsed) {

                    this.useTime();
                }
            }
        });


        /**
         * Event reporting that the selected track is loaded.
         *
         * @listens MemoryPlayerFactory#event:MemoryPlayer:trackLoaded
         */
        this.$rootScope.$on('MemoryPlayer:trackLoaded', (event: angular.IAngularEvent, duration: number) => {
            this.trackDuration = duration;
        });


        /**
         * Event reporting that the player has been paused.
         *
         * @listens MemoryPlayerFactory#event:MemoryPlayer:isPaused
         */
        this.$rootScope.$on('MemoryPlayer:isPaused', (event: angular.IAngularEvent, isPaused: boolean) => {

            if (this.isShareable && this.shareLinkTimer !== null) {

                this.$interval.cancel(this.shareLinkTimer);
            }

            this.isPaused = isPaused;
        });


        /**
         * Event reporting that the selected track is being played.
         *
         * @listens MemoryPlayerFactory#event:MemoryPlayer:trackPlayed
         */
        this.$rootScope.$on('MemoryPlayer:trackPlayed', () => {

            if (this.isShareable) {

                if (this.shareLinkTimer !== null) {

                    this.$interval.cancel(this.shareLinkTimer);
                }

                this.shareLinkTimer = this.$interval(() => {

                    this.shareLinkTime = $.jPlayer.convertTime(this.MemoryPlayerFactory.getTime());

                }, 1000);
            }

            this.MemoryPlayerFactory.trackPlayedEvent((playerInfo: IMemoryPlayerResponse) => {

                this.isPaused = playerInfo.isPaused;

                this.$scope.$apply();
            });
        });


        /**
         * Event reporting that the selected track has ended.
         *
         * @listens MemoryPlayerFactory#event:MemoryPlayer:trackEnded
         */
        this.$rootScope.$on('MemoryPlayer:trackEnded', () => {

            this.MemoryPlayerFactory.trackEndedEvent((playerInfo: IMemoryPlayerResponse) => {

                this.selectedTrack = playerInfo.track;

                this.isPaused = playerInfo.isPaused;

                this.$scope.$apply();
            });
        });


        /**
         * Event reporting that a YouTube video is playing to prevent simultaneous playback.
         */
        angular.element(document).on('youtube.onVideoPlayed', () => {

            if (!this.isPaused) {

                this.play();

                this.$scope.$apply();
            }
        });


        /**
         * Click event to close an open dropdown.
         */
        angular.element(document).on('click.mp.dropdown', (event: JQueryEventObject) => {

            let $dropdown = angular.element('.mp-dropdown');

            if (!angular.element(event.target).closest('.mp-dropdown-toggle').length && $dropdown.hasClass('open')) {

                $dropdown.removeClass('open');
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });


        /**
         * Click event to close an open dropdown on mobile devices.
         */
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', (event: JQueryEventObject) => {

            let $dropdown = angular.element('.mp-dropdown');

            angular.element(event.target).remove();

            $dropdown.removeClass('open');
            $dropdown.find('a').attr('aria-expanded', 'false');
        });


        /**
         * Click event to prevent an open dropdown menu from closing on a click inside.
         */
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', (event: JQueryEventObject) => {
            event.stopPropagation();
        });
    }



    /**
     * @memberof MemoryPlayerController
     * @member {IMemoryPlaylists} playlists - The playlists object.
     * @default null
     */
    public playlists: IMemoryPlaylists = null;


    /**
     * @memberof MemoryPlayerController
     * @member {IMemoryPlaylist} selectedPlaylist - The selected playlist object.
     * @default null
     */
    public selectedPlaylist: IMemoryPlaylist = null;


    /**
     * @memberof MemoryPlayerController
     * @member {IMemoryTrack} selectedTrack - The selected track object.
     * @default null
     */
    public selectedTrack: IMemoryTrack = null;


    /**
     * @memberof MemoryPlayerController
     * @member {number} trackDuration - The duration of the current track.
     * @default 0
     */
    public trackDuration: number = 0;


    /**
     * @memberof MemoryPlayerController
     * @member {boolean} isPaused - True if the player is paused and false if it is not.
     * @default true
     */
    public isPaused: boolean = true;


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
     * Implements the setPlaylist factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} album - The id of the playlist to be set.
     */
    public setPlaylist(album: string): void {
        this.MemoryPlayerFactory.setPlaylist(album);
    };


    /**
     * Implements the play factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    public play(): void {
        this.MemoryPlayerFactory.play();
    };


    /**
     * Implements the cueTrack factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     * @param {number} track - The id of the track to be set.
     */
    public cueTrack(track: number): void {
        this.MemoryPlayerFactory.cueTrack(track);
    };


    /**
     * Implements the next track factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    public next(): void {
        this.MemoryPlayerFactory.next();
    };


    /**
     * Implements the previous track factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    public previous(): void {
        this.MemoryPlayerFactory.previous();
    };


    /**
     * Implements the maxVolume factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    public maxVolume(): void {
        this.MemoryPlayerFactory.maxVolume();
    };


    /**
     * Implements the toggle mute factory method. {@link MemoryPlayerFactory}
     * @memberof MemoryPlayerController
     * @instance
     */
    public mute(): void {
        this.MemoryPlayerFactory.mute();
    };


    /**
     * Updates the share link value specified by the key.
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} key - The key of the share option to be set.
     * @param {string | number} value - The value of the share option to be set.
     */
    public setShareLink(key: string, value: string | number | any): void {

        let shareLink: Array<IMemoryShare> = [],
            playlist: IMemoryShare = { name: 'playlist', value: null },
            track: IMemoryShare = { name: 'track', value: null },
            time: IMemoryShare = { name: 'time', value: 0 },
            volume: IMemoryShare = { name: 'volume', value: 0.8 },
            isMuted: IMemoryShare = { name: 'isMuted', value: false },
            isPaused: IMemoryShare = { name: 'isPaused', value: true };

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


    /**
     * Toggles the playlists dropdown open and closed.
     * @memberof MemoryPlayerController
     * @instance
     * @param {JQueryEventObject} event - The jQuery event object from the element that triggered the event.
     */
    public toggleDropdown(event?: JQueryEventObject): void {

        let $trigger = angular.element(event.target),
            $parent = $trigger.closest('.mp-dropdown'),
            isActive = $parent.hasClass('open'),
            $backdrop = angular.element(document.createElement('div')).addClass('mp-dropdown-backdrop');

        // Resets dropdowns
        angular.element('.mp-dropdown-backdrop').remove();

        angular.element('.mp-dropdown-toggle').each(function () {

            if (!angular.element(this).closest('.mp-dropdown').hasClass('open')) return;

            angular.element(this).attr('aria-expanded', 'false');
            angular.element(this).closest('.mp-dropdown').removeClass('open');
        });

        // Opens the clicked dropdown if it was closed when triggered
        if (!isActive) {

            if ('ontouchstart' in document.documentElement) {
                $backdrop.appendTo('body');
            }

            $parent.addClass('open');
            $trigger.closest('.mp-dropdown-toggle').attr('aria-expanded', 'true');
        }
    }
}


(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
