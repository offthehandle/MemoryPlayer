
describe('MPController', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, $scope, MemoryPlayerState, MemoryPlayerControls, MemoryPlayerSharing, MemoryPlayerAPI;
    var MPController;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _MemoryPlayerState_, _MemoryPlayerControls_, _MemoryPlayerSharing_, _MemoryPlayerAPI_, $controller) {

        // Angular core DI
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();

        // Memory Player DI
        MemoryPlayerState = _MemoryPlayerState_;
        MemoryPlayerControls = _MemoryPlayerControls_;
        MemoryPlayerSharing = _MemoryPlayerSharing_;

        MemoryPlayerAPI = _MemoryPlayerAPI_;

        // Assigns controller
        MPController = $controller('MemoryPlayerController as player', {
            $scope: $scope
        });

        // Populates playlist data
        $httpBackend.expectGET('/memory-player/dist/json/playlists.json').respond(200, playlists);

        var playlistsResponse;

        MemoryPlayerAPI.getPlaylists().then(function (response) {

            playlistsResponse = response;
        });

        $httpBackend.flush();


        // Starts player
        var playlist = Object.keys(playlistsResponse)[0];

        MemoryPlayerState.setPlaylists(playlistsResponse);
        MemoryPlayerControls.showtime(playlistsResponse[playlist]._id);
    }));


    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    describe('MPController initializes', function () {
        it('should exist', function () {

            expect(!!MPController).toBeTruthy();
        });
    });

    describe('MPController executes programmed behaviors', function () {
        it('should select playlist', function () {

            // Selects playlist
            MPController.selectPlaylist('Hypnotist');

            // Triggers watch
            $scope.$apply();

            // Tests result
            expect(MPController.currentPlaylist.playlist).toEqual(hypnotistPlaylist);
        });

        it('should play', function () {

            // Plays track
            MPController.play();

            // Triggers watch
            $scope.$apply();

            // Tests result
            expect(MPController.isPaused).toBe(false);
        });

        it('should select track', function () {

            // Selects track
            MPController.selectTrack(1);

            // Triggers watch
            $scope.$apply();

            // Tests result
            expect(MPController.currentTrack).toEqual(trackResponse);
        });

        it('should play next track', function () {

            // Plays next track
            MPController.next();

            // Triggers watch
            $scope.$apply();

            // Tests result
            expect(MPController.currentTrack).toEqual(trackResponse);
        });

        it('should not advance past end of playlist', function () {

            // Selects last track
            MPController.selectTrack(2);

            // Tries play next
            MPController.next();

            // Triggers watch
            $scope.$apply();

            // Tests result
            expect(MPController.currentTrack._id).toEqual(2);
        });

        it('should play previous track', function () {

            // Sets 1 track ahead of expected result
            MPController.selectTrack(2);

            // Plays previous track
            MPController.previous();

            // Triggers watch
            $scope.$apply();

            // Tests result
            expect(MPController.currentTrack).toEqual(trackResponse);
        });

        it('should not advance past beginning of playlist', function () {

            // Tries play previous
            MPController.previous();

            // Triggers watch
            $scope.$apply();

            // Tests result
            expect(MPController.currentTrack._id).toEqual(0);
        });

        it('should mute the player', function () {

            // Mutes player
            MPController.mute();

            // Tests result
            expect(MemoryPlayerState.getIsMuted()).toBe(true);
        });

        it('should unmute the player', function () {

            // Mutes player
            MPController.mute();

            // Unmutes player
            MPController.mute();

            // Tests result
            expect(MemoryPlayerState.getIsMuted()).toBe(false);
        });

        it('should unmute the player on max volume', function () {

            // Mutes player
            MPController.mute();

            // Sets max volume
            MPController.maxVolume();

            // Tests result
            expect(MemoryPlayerState.getIsMuted()).toBe(false);
        });

        it('should use time on selection', function () {

            // Uses time
            MPController.useTime();

            // Tests result
            expect(MemoryPlayerSharing.isTimeUsed).toBe(true);
        });

        it('should use time on update time', function () {

            // Updates time
            MPController.updateTime('30');

            // Tests result
            expect(MemoryPlayerSharing.isTimeUsed).toBe(true);
        });

        it('should not use time on selection', function () {

            // Uses time
            MPController.useTime();

            // Toggles uses time off
            MPController.useTime();

            // Tests result
            expect(MemoryPlayerSharing.isTimeUsed).toBe(false);
        });
    });
});
