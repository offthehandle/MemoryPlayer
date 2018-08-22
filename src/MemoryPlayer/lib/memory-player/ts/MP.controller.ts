
class MemoryPlayerController implements angular.IController {

    public static instance: any[] = [
        '$scope',
        'MemoryPlayerState',
        'MemoryPlayerControls',
        'MemoryPlayerSharing',
        MemoryPlayerController
    ];



    /**
     * Implements IController
     * @constructs MemoryPlayerController
     * @param {IScope} $scope - The core angular scope service.
     * @param {IMemoryPlayerState} MemoryPlayerState - The service that manages memory player state.
     * @param {IMemoryPlayerControls} MemoryPlayerControls - The service that manages memory player controls.
     * @param {IMemoryPlayerSharing} MemoryPlayerSharing - The service that manages memory player link sharing.
     */
    constructor(
        private $scope: angular.IScope,
        private MemoryPlayerState: IMemoryPlayerState,
        private MemoryPlayerControls: IMemoryPlayerControls,
        private MemoryPlayerSharing: IMemoryPlayerSharing
    ) {

        // Turns on sharing
        this.isShareable = true;

        // Sets initial state of player
        this.playlists = this.MemoryPlayerState.getPlaylists();
        this.currentPlaylist = this.MemoryPlayerState.getPlaylist();
        this.currentTrack = this.MemoryPlayerState.getTrack();
        this.isPaused = this.MemoryPlayerState.getIsPaused();


        // Watches state service for playlists change
        this.$scope.$watch((): IPlaylists => {

            return this.MemoryPlayerState.getPlaylists();

        }, (newPlaylists, oldPlaylists): void => {

            // If playlists change then update
            if (angular.isDefined(newPlaylists) && newPlaylists !== oldPlaylists) {

                // Updates playlists
                this.playlists = newPlaylists;
            }
        });


        // Watches state service for playlist change
        this.$scope.$watch((): IPlaylist => {

            return this.MemoryPlayerState.getPlaylist();

        }, (newPlaylist, oldPlaylist): void => {

            // If playlist changes then update
            if (angular.isDefined(newPlaylist) && newPlaylist !== oldPlaylist) {

                // Updates current playlist
                this.currentPlaylist = newPlaylist;
            }
        });


        // Watches state service for track change
        this.$scope.$watch((): ITrack => {

            return this.MemoryPlayerState.getTrack();

        }, (newTrack, oldTrack): void => {

            // If track changes then update
            if (angular.isDefined(newTrack) && newTrack !== oldTrack) {

                // Updates current track
                this.currentTrack = newTrack;
            }
        });


        // Watches state service for play state change
        this.$scope.$watch((): boolean => {

            return this.MemoryPlayerState.getIsPaused();

        }, (newState, oldState): void => {

            // If play state changes then update
            if (angular.isDefined(newState) && newState !== oldState) {

                // Updates play state
                this.isPaused = newState;
            }
        });
    }



    /**
     * @memberof MemoryPlayerController
     * @member {IPlaylist} currentPlaylist - Current playlist.
     */
    public currentPlaylist: IPlaylist;


    /**
     * @memberof MemoryPlayerController
     * @member {ITrack} currentTrack - Current track.
     */
    public currentTrack: ITrack;


    /**
     * @memberof MemoryPlayerController
     * @member {boolean} isPaused - Current play state.
     * @default true
     */
    public isPaused: boolean;


    /**
     * @memberof MemoryPlayerController
     * @member {boolean} isShareable - Share link is enabled or not.
     * @default true
     */
    public isShareable: boolean;


    /**
     * @memberof MemoryPlayerController
     * @member {IPlaylists} playlists - Currently available playlists.
     */
    public playlists: IPlaylists;



    /**
     * Implements toggle use time method of {@link MemoryPlayerSharing}
     * @memberof MemoryPlayerController
     * @instance
     */
    public cancelTimer(): void {

        this.MemoryPlayerSharing.cancelTimer();
    }


    /**
     * Implements max volume method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    public maxVolume(): void {

        this.MemoryPlayerControls.maxVolume();
    }


    /**
     * Implements toggle mute and unmute method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    public mute(): void {

        this.MemoryPlayerControls.mute();
    }


    /**
     * Implements play next track method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    public next(): void {

        this.MemoryPlayerControls.next();
    }


    /**
     * Implements toggle play and pause method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    public play(): void {

        this.MemoryPlayerControls.play();
    }


    /**
     * Implements play previous track method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     */
    public previous(): void {

        this.MemoryPlayerControls.previous();
    }


    /**
     * Implements play selected playlist method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     * @param {string} playlistName - The name of selected playlist.
     */
    public selectPlaylist(playlistName: string): void {

        this.MemoryPlayerControls.selectPlaylist(playlistName);
    }


    /**
     * Implements play selected track method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     * @param {number} trackIndex - The index of selected track in playlist.
     */
    public selectTrack(trackIndex: number): void {

        this.MemoryPlayerControls.selectTrack(trackIndex);
    }


    /**
     * Implements toggle use time method of {@link MemoryPlayerSharing}
     * @memberof MemoryPlayerController
     * @instance
     */
    public share(): void {

        this.MemoryPlayerSharing.share();
    }


    /**
     * Implements toggle playlist dropdown method of {@link MemoryPlayerControls}
     * @memberof MemoryPlayerController
     * @instance
     * @param {JQueryEventObject} $event - The event from trigger element.
     */
    public toggleDropdown($event: JQueryEventObject): void {

        this.MemoryPlayerControls.toggleDropdown($event);
    }


    /**
     * Implements toggle use time method of {@link MemoryPlayerSharing}
     * @memberof MemoryPlayerController
     * @instance
     */
    public updateTime(): void {

        this.MemoryPlayerSharing.updateTime();
    }


    /**
     * Implements toggle use time method of {@link MemoryPlayerSharing}
     * @memberof MemoryPlayerController
     * @instance
     */
    public useTime(): void {

        this.MemoryPlayerSharing.useTime();
    }
}

(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
