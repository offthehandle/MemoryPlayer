
class MemoryPlayerControls implements IMemoryPlayerControls {

    public static instance: any[] = [
        '$rootScope',
        'JPlayer',
        'MemoryPlayerState',
        MemoryPlayerControls
    ];



    /**
     * Implements IMemoryPlayerControls
     * @constructs MemoryPlayerControls
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


        // Observes player ready
        this.$rootScope.$on('MP:Ready', ($event: angular.IAngularEvent): void => {

            /**
             * Observes player volume change.
             */
            angular.element(this.jPlayerId).bind($.jPlayer.event.volumechange, (event: IjPlayerEvent): void => {

                // Updates volume
                this.MemoryPlayerState.setVolume(event.jPlayer.options.volume);

                // Updates is muted
                this.MemoryPlayerState.setIsMuted(event.jPlayer.options.muted);
            });

            /**
             * Observes current track ended.
             */
            angular.element(this.jPlayerId).bind($.jPlayer.event.ended, (): void => {

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
        });


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


            let $dropdown: JQuery = angular.element('.mp-dropdown');

            // Closes dropdown
            $dropdown.removeClass('open');

            // Updates aria for accessibility
            $dropdown.find('a').attr('aria-expanded', 'false');
        });

        /**
         * Observes custom event that YouTube video has played and prevents simultaneous playback.
         */
        angular.element(document).on('YT.VideoPlayed', (): void => {

            // If player is playing then toggle playback to pause
            if (!this.MemoryPlayerState.getIsPaused()) {

                this.$rootScope.$evalAsync((): void => {

                    // Pauses player
                    this.play();
                });
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
     * @returns {boolean} - True if current track is last, else false.
     * @private
     */
    private isEnd(): boolean {

        // Compares track index to track count
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

            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);
        }
    }


    /**
     * Toggles play and pause.
     * @memberof MemoryPlayerControls
     * @instance
     */
    public play(): void {

        // Gets play state
        let isPaused: boolean = this.MemoryPlayerState.getIsPaused();

        // Toggles play
        (isPaused) ? this.JPlayer.instance().play() : this.JPlayer.instance().pause();

        // Updates play state
        this.MemoryPlayerState.setIsPaused(!isPaused);


        // If playing then notify other media
        if (isPaused) {

            angular.element(this.jPlayerId).trigger('MP.TrackPlayed');
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

            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);
        }
    }


    /**
     * Restarts player with previous settings.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {IRestartSettings} settings - Settings required to restart player.
     * @private
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

        // If playing then update
        if (settings.isPaused !== true) {

            playState = 'play';

            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);
        }

        // Sets player to current time and playback state
        angular.element(this.jPlayerId).jPlayer(playState, settings.time);
    }


    /**
     * Plays selected playlist.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    public selectPlaylist(playlistName: string): void {

        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlistName);

        // Gets current playlist
        let tracks: Array<ITrack> = this.MemoryPlayerState.getPlaylist().tracks;

        // Sets current playlist in player
        this.JPlayer.instance().setPlaylist(tracks);

        // Plays first track
        this.JPlayer.instance().play();

        // Updates play state
        this.MemoryPlayerState.setIsPaused(false);
    }


    /**
     * Plays selected track.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {number} trackIndex - The index of selected track in playlist.
     */
    public selectTrack(trackIndex: number): void {

        // If selected track is different from current then set track and play, else toggle play
        if (trackIndex !== this.MemoryPlayerState.getTrackId()) {

            // Updates current track
            this.MemoryPlayerState.setTrack(trackIndex);

            // Plays selected track
            this.JPlayer.instance().play(trackIndex);

            // Updates play state
            this.MemoryPlayerState.setIsPaused(false);

        } else {

            // Toggles play
            this.play();
        }
    }


    /**
     * Creates player and executes restart with previous settings if available.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {string} playlist - The name of current playlist.
     * @param {IRestartSettings} settings - Settings required to restart player.
     */
    public showtime(playlist: string, settings?: IRestartSettings): void {

        // Updates current playlist
        this.MemoryPlayerState.setPlaylist(playlist);

        // Creates jplayer instance with current playlist
        this.JPlayer.create(this.MemoryPlayerState.getPlaylist().tracks);


        // Observes player ready
        angular.element(this.jPlayerId).bind($.jPlayer.event.ready, (): void => {

            // If settings exist then restart
            if (angular.isDefined(settings)) {

                // Restarts player
                this.restart(settings);
            }

            // Removes loading class
            angular.element('#memory-player').removeClass('mp-loading');

            // Notifies that player setup is complete
            this.$rootScope.$broadcast('MP:Ready');
        });
    }


    /**
     * Toggles playlist dropdown.
     * @memberof MemoryPlayerControls
     * @instance
     * @param {JQueryEventObject} $event - The event from trigger element.
     */
    public toggleDropdown($event: JQueryEventObject): void {

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
