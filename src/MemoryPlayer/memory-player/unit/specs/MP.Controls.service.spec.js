
describe('MPControls', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, $scope, JPlayer, MemoryPlayerState, MemoryPlayerControls, MemoryPlayerAPI;
    var MPController;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _JPlayer_, _MemoryPlayerState_, _MemoryPlayerControls_, _MemoryPlayerAPI_) {

        // Angular core DI
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();

        // Memory Player DI
        JPlayer = _JPlayer_;
        MemoryPlayerState = _MemoryPlayerState_;
        MemoryPlayerAPI = _MemoryPlayerAPI_;

        MemoryPlayerControls = _MemoryPlayerControls_;

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


    describe('MPControls initialization', function () {
        it('should create the player', function () {
            expect(JPlayer.instance()).toBeTruthy();
        });
    });

    describe('MPControls executes programmed behaviors', function () {
        it('should select playlist', function () {

            // Selects playlist
            MemoryPlayerControls.selectPlaylist('Hypnotist');

            // Tests result
            expect(MemoryPlayerState.getPlaylist().playlist).toEqual(hypnotistPlaylist);
        });

        it('should play', function () {

            // Plays track
            MemoryPlayerControls.play();

            // Tests result
            expect(MemoryPlayerState.getIsPaused()).toBe(false);
        });

        it('should select track', function () {

            // Selects track
            MemoryPlayerControls.selectTrack(1);

            // Tests result
            expect(MemoryPlayerState.getTrack()).toEqual(trackResponse);
        });

        it('should play next track', function () {

            // Plays next track
            MemoryPlayerControls.next();

            // Tests result
            expect(MemoryPlayerState.getTrack()).toEqual(trackResponse);
        });

        it('should not advance past end of playlist', function () {

            // Selects last track
            MemoryPlayerControls.selectTrack(2);

            // Tries play next
            MemoryPlayerControls.next();

            // Tests result
            expect(MemoryPlayerState.getTrackId()).toEqual(2);
        });

        it('should play previous track', function () {

            // Sets 1 track ahead of expected result
            MemoryPlayerControls.selectTrack(2);

            // Plays previous track
            MemoryPlayerControls.previous();

            // Tests result
            expect(MemoryPlayerState.getTrack()).toEqual(trackResponse);
        });

        it('should not advance past beginning of playlist', function () {

            // Tries play previous
            MemoryPlayerControls.previous();

            // Tests result
            expect(MemoryPlayerState.getTrackId()).toEqual(0);
        });

        it('should mute the player', function () {

            // Mutes player
            MemoryPlayerControls.mute();

            // Tests result
            expect(MemoryPlayerState.getIsMuted()).toBe(true);
        });

        it('should unmute the player', function () {

            // Mutes player
            MemoryPlayerControls.mute();

            // Unmutes player
            MemoryPlayerControls.mute();

            // Tests result
            expect(MemoryPlayerState.getIsMuted()).toBe(false);
        });

        it('should unmute the player on max volume', function () {

            // Mutes player
            MemoryPlayerControls.mute();

            // Sets max volume
            MemoryPlayerControls.maxVolume();

            // Tests result
            expect(MemoryPlayerState.getIsMuted()).toBe(false);
        });
    });
});
