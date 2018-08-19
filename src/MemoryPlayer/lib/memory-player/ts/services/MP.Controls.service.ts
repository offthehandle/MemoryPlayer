
class MemoryPlayerControls implements IMemoryPlayerControls {

    public static instance: any[] = [
        '$rootScope',
        '$timeout',
        'JPlayer',
        'MemoryPlayerState',
        MemoryPlayerControls
    ];



    /**
     * Implements IMemoryPlayerControls
     * @constructs MemoryPlayerControls
     * @param {IRootScopeService} $rootScope - The core angular root scope service.
     * @param {ITimeoutService} $timeout - The core angular timeout service.
     * @param {MemoryPlayerProvider} JPlayer - The provider service that manages jplayer.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     */
    constructor(
        private $rootScope: angular.IRootScopeService,
        private $timeout: angular.ITimeoutService,
        private JPlayer: IJPlayerProvider,
        private MemoryPlayerState: IMemoryPlayerState
    ) {

        // Stores player id for optimization
        this.jPlayerId = this.JPlayer.ids.jPlayer;


        /**
         * Observes open playlist dropdown click inside to prevent close.
         */
        angular.element('#memory-player').on('click.mp.dropdown', '.mp-dropdown-menu', (event: JQueryEventObject): void => {

            event.stopPropagation();
        });


        /**
         * Observes click to close open playlist dropdown.
         */
        angular.element(document).on('click.mp.dropdown', (event: JQueryEventObject): void => {

            let $dropdown: JQuery = angular.element('.mp-dropdown');

            // If dropdown is open then close it
            if (!angular.element(event.target).closest('.mp-dropdown-toggle').length && $dropdown.hasClass('open')) {

                // Closes dropdown
                $dropdown.removeClass('open');

                // Updates aria for accessibility
                $dropdown.find('a').attr('aria-expanded', 'false');
            }
        });


        /**
         * Observes click to close open playlist dropdown on mobile devices.
         */
        angular.element(document).on('click.mp.dropdown', '.mp-dropdown-backdrop', (event: JQueryEventObject): void => {

            // Removes dropdown backdrop
            angular.element(event.target).remove();


            let $dropdown = angular.element('.mp-dropdown');

            // Closes dropdown
            $dropdown.removeClass('open');

            // Updates aria for accessibility
            $dropdown.find('a').attr('aria-expanded', 'false');
        });


        /**
         * Observe that YouTube video has played and prevents simultaneous playback.
         */
        angular.element(document).on('youtube.onVideoPlayed', (): void => {

            // If player is playing then toggle play
            if (!this.MemoryPlayerState.getIsPaused()) {

                // Stops player
                this.play();
            }
        });
    }



    /**
     * @memberof MemoryPlayerControls
     * @member {string} jPlayerId - The player id from {@link MemoryPlayerProvider}.
     * @private
     */
    private jPlayerId: string;



    /**
     * Checks if current track is last in playlist.
     * @memberof MemoryPlayerControls
     * @instance
     * @returns {boolean} - True if track is last else false.
     */
    private isEnd(): boolean {

        // Compares track index to playlist length
        let trackId: number = (this.MemoryPlayerState.getTrackId() + 1),
            currentPlaylist: IPlaylist = this.MemoryPlayerState.getPlaylist();

        return !(trackId < currentPlaylist.trackCount);
    }


    /**
     * Sets player to max volume.
     * @memberof MemoryPlayerControls
     * @instance
     */
    public maxVolume(): void {

        // If muted then unmute
        if (this.MemoryPlayerState.getIsMuted()) {

            // Unmutes player
            angular.element(this.jPlayerId).jPlayer('unmute');

            // Updates is muted
            this.MemoryPlayerState.setIsMuted(false);
        }

        // Sets max volume
        angular.element(this.jPlayerId).jPlayer('volume', 1)
    }


    /**
     * Toggles mute and unmute.
     * @memberof MemoryPlayerControls
     * @instance
     */
    public mute(): void {

        // Gets is muted
        let isMuted: boolean = this.MemoryPlayerState.getIsMuted();

        // Toggles mute
        (isMuted) ? angular.element(this.jPlayerId).jPlayer('unmute') : angular.element(this.jPlayerId).jPlayer('mute');

        // Updates is muted
        this.MemoryPlayerState.setIsMuted(!isMuted);
    }


    /**
     * Plays next track.
     * @memberof MemoryPlayerControls
     * @instance
     */
    public next(): void {

        // If current track is not last in playlist then play next
        if (!this.isEnd()) {

            // Gets next track id
            let trackId: number = (this.MemoryPlayerState.getTrackId() + 1);

            // Updates current track
            this.MemoryPlayerState.setTrack(trackId);

            // Plays next track
            this.JPlayer.instance().next();

            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
    }


    /**
     * Toggles play and pause.
     * @memberof MemoryPlayerControls
     * @instance
     *
     * @fires MemoryPlayerState#MemoryPlayer:Pause
     */
    public play(): void {

        // Gets is paused
        let isPaused: boolean = this.MemoryPlayerState.getIsPaused();

        // Toggles play
        (isPaused) ? this.JPlayer.instance().play() : this.JPlayer.instance().pause();

        // Updates is paused
        this.MemoryPlayerState.setIsPaused(!isPaused);


        // If playing then notify other media
        if (!isPaused) {

            angular.element(this.jPlayerId).trigger('MemoryPlayer.TrackPlayed');
        }
    }


    /**
     * Plays previous track.
     * @memberof MemoryPlayerControls
     * @instance
     */
    public previous(): void {

        // Gets previous track id
        let trackId: number = (this.MemoryPlayerState.getTrackId() - 1);

        // If current track is not first in playlist then play previous
        if (trackId >= 0) {

            // Updates current track
            this.MemoryPlayerState.setTrack(trackId);

            // Plays previous track
            this.JPlayer.instance().previous();

            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
    }


    /**
     * Restarts player with previous settings.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {IRestartSettings} settings - Settings required to restart player.
     */
    private restart(settings: IRestartSettings): void {

        // Updates current track
        this.MemoryPlayerState.setTrack(settings.track);

        // Sets player to current track
        this.JPlayer.instance().select(settings.track);

        // Sets player to current volume
        angular.element(this.jPlayerId).jPlayer('volume', settings.volume);


        // If is muted then set player and update state
        if (settings.isMuted === true) {

            // Mutes player
            angular.element(this.jPlayerId).jPlayer('mute');

            // Updates is muted
            this.MemoryPlayerState.setIsMuted(true);
        }


        // Assigns variable to set playback state
        let playState: string = 'pause';

        // If not is paused then update
        if (settings.isPaused !== true) {

            playState = 'play';

            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }

        // Sets player to current time and playback state
        angular.element(this.jPlayerId).jPlayer(playState, settings.time);
    }


    /**
     * Plays selected track.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    public selectPlaylist(playlistName: string): void {

        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlistName);


        // If player is defined set playlist and play
        if (angular.isDefined(this.JPlayer.instance)) {

            // Gets current playlist
            let playlist: Array<ITrack> = this.MemoryPlayerState.getPlaylist().playlist;

            // Sets current playlist in player
            this.JPlayer.instance().setPlaylist(playlist);

            // Plays first track
            this.JPlayer.instance().option('autoPlay', true);

            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);
        }
    }


    /**
     * Plays selected track.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {number} trackIndex - The index of selected track in playlist.
     */
    public selectTrack(trackIndex: number): void {

        // If selected track is different from current then set track and play, else resume
        if (trackIndex !== this.MemoryPlayerState.getTrackId()) {

            // Updates current track
            this.MemoryPlayerState.setTrack(trackIndex);

            // Plays selected track
            this.JPlayer.instance().play(trackIndex);

            // Updates is paused
            this.MemoryPlayerState.setIsPaused(false);

        } else {

            // Resumes track
            this.play();
        }
    }


    /**
     * Creates player and restarts with previous settings if available.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlist - The name of current playlist.
     * @param {IRestartSettings} settings - Settings required to restart player.
     */
    public showtime(playlist: string, settings?: IRestartSettings): void {

        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlist);

        // Instantiates jPlayer
        this.JPlayer.create(this.MemoryPlayerState.getPlaylist().playlist);


        /**
         * Observes player ready.
         */
        angular.element(this.jPlayerId).on($.jPlayer.event.ready, (): void => {

            // Small timeout before configuration
            this.$timeout((): void => {

                /**
                 * Observes player loaded.
                 */
                angular.element(this.jPlayerId).on($.jPlayer.event.loadeddata, function (event: IjPlayerEvent): void {

                    console.log(Math.floor(event.jPlayer.status.duration));
                });

                /**
                 * Observes player volume change.
                 */
                angular.element(this.jPlayerId).on($.jPlayer.event.volumechange, (event: IjPlayerEvent): void => {

                    // Updates volume
                    this.MemoryPlayerState.setVolume(event.jPlayer.options.volume);

                    // Updates is muted
                    this.MemoryPlayerState.setIsMuted(event.jPlayer.options.muted);
                });

                /**
                 * Observes current track ended.
                 */
                angular.element(this.jPlayerId).on($.jPlayer.event.ended, (): void => {

                    // If playlist is not over then update state, else start from beginning
                    if (!this.isEnd()) {

                        // Gets next track id
                        let trackId: number = (this.MemoryPlayerState.getTrackId() + 1);

                        this.$rootScope.$evalAsync((): void => {

                            // Updates current track
                            this.MemoryPlayerState.setTrack(trackId);
                        });

                    } else {

                        this.$rootScope.$evalAsync((): void => {

                            // Starts playlist from beginning
                            this.selectTrack(0);
                        });
                    }
                });


                // If settings exist then restart
                if (angular.isDefined(settings)) {

                    this.restart(settings);
                }

                // Removes loading class
                angular.element('#memory-player').removeClass('mp-loading');

            }, 400);

        });
    }


    /**
     * Toggles playlist dropdown.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {JQueryEventObject} event - The event from trigger element.
     */
    public toggleDropdown(event: JQueryEventObject): void {

        // Sets values to update dropdown state
        let $trigger = angular.element(event.target),
            $parent = $trigger.closest('.mp-dropdown'),
            isActive = $parent.hasClass('open'),
            $backdrop = angular.element(document.createElement('div')).addClass('mp-dropdown-backdrop');

        // Removes dropdown backdrop
        angular.element('.mp-dropdown-backdrop').remove();


        // Resets each dropdown
        angular.element('.mp-dropdown-toggle').each(function () {

            // Ignores closed dropdowns
            if (!angular.element(this).closest('.mp-dropdown').hasClass('open')) return;

            // Closes open dropdowns
            angular.element(this).closest('.mp-dropdown').removeClass('open');

            // Updates aria for accessibility
            angular.element(this).attr('aria-expanded', 'false');
        });


        // If dropdown was closed then open it
        if (!isActive) {

            // If user is on mobile device append backdrop
            if ('ontouchstart' in document.documentElement) {

                $backdrop.appendTo('body');
            }

            // Opens dropdown
            $parent.addClass('open');

            // Updates aria for accessibility
            $trigger.closest('.mp-dropdown-toggle').attr('aria-expanded', 'true');
        }
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .service('MemoryPlayerControls', MemoryPlayerControls.instance);
})();
