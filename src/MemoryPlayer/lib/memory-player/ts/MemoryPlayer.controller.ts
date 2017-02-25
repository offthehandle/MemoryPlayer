
class MemoryPlayerController implements angular.IController {

    public static instance: any[] = [
        '$rootScope',
        '$scope',
        '$location',
        'MemoryPlayerFactory',
        MemoryPlayerController
    ];



    /**
     * Implements IController
     * @constructs MemoryPlayerController
     * @param {IRootScopeService} $rootScope - The core angular rootScope service.
     * @param {IScope} $scope - The core angular scope service.
     * @param {ILocationService} $location - The core angular location service.
     * @param {IMemoryPlayerFactory} MemoryPlayerFactory - The Memory Player factory.
     */
    constructor(private $rootScope: angular.IRootScopeService, private $scope: angular.IScope, private $location: angular.ILocationService, private MemoryPlayerFactory: IMemoryPlayerFactory) {
        /**
         * Core Angular event used to append query string for continuous playback.
         *
         * ?playlist=playlistId&track=trackId&time=time&isPaused=isPaused
         *
         * playlistId = id of the selected playlist
         * trackId = id of the selected track
         * time = track time returned by internal jPlayer event
         * isPaused = the player is paused (true) or not (false)
         *
         * @listens event:$locationChangeStart
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


        this.$scope.$on('MemoryPlayer:directiveReady', (event: angular.IAngularEvent, remembered: IMemoryInit) => {

            this.MemoryPlayerFactory.fetchPlaylists(() => {

                this.playlists = this.MemoryPlayerFactory.getAllPlaylists();

                if (remembered === null) {

                    for (var playlist in this.playlists) {
                        break;
                    }

                    this.MemoryPlayerFactory.createPlayer(this.playlists[playlist]._id, null);

                } else {

                    this.MemoryPlayerFactory.createPlayer(remembered.playlist, remembered.info);
                }
            });

        });


        /**
         * Event reporting that the playlist has changed.
         *
         * @listens event:MemoryPlayer:playlistChanged
         */
        this.$rootScope.$on('MemoryPlayer:playlistChanged', (event: angular.IAngularEvent, playlist: IMemoryPlaylist) => {
            this.selectedPlaylist = playlist;
        });


        /**
         * Event reporting that the track has changed.
         *
         * @listens event:MemoryPlayer:trackChanged
         */
        this.$rootScope.$on('MemoryPlayer:trackChanged', (event: angular.IAngularEvent, track: IMemoryTrack) => {
            this.selectedTrack = track;
        });


        /**
         * Event reporting that the player has been paused.
         *
         * @listens event:MemoryPlayer:isPaused
         */
        this.$rootScope.$on('MemoryPlayer:isPaused', (event: angular.IAngularEvent, isPaused: boolean) => {
            this.isPaused = isPaused;
        });


        /**
         * Event reporting that the selected track is being played.
         *
         * @listens event:MemoryPlayer:trackPlayed
         */
        this.$rootScope.$on('MemoryPlayer:trackPlayed', () => {
            this.MemoryPlayerFactory.trackPlayedEvent((playerInfo: IMemoryPlayerResponse) => {

                this.isPaused = playerInfo.isPaused;

                this.$scope.$apply();
            });
        });


        /**
         * Event reporting that the selected track has ended.
         *
         * @listens event:MemoryPlayer:trackEnded
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
         *
         * @listens event:youtube.onVideoPlayed
         */
        angular.element(document).on('youtube.onVideoPlayed', (e: Event) => {

            if (!this.isPaused) {

                this.play();

                this.$scope.$apply();
            }
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
     * @member {boolean} isPaused - True if the player is paused and false if it is not.
     * @default true
     */
    public isPaused: boolean = true;



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
}


(function () {
    'use strict';

    angular.module('MemoryPlayer')
        .controller('MemoryPlayerController', MemoryPlayerController.instance);
})();
