
describe('MPControls', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, MemoryPlayerState, MemoryPlayerAPI;
    var MPController;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _MemoryPlayerState_, _MemoryPlayerAPI_) {

        // Angular core DI
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();

        // Memory Player DI
        MemoryPlayerAPI = _MemoryPlayerAPI_;

        MemoryPlayerState = _MemoryPlayerState_;

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
    }));


    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    describe('MPState executes programmed behaviors', function () {
        it('should get playlists', function () {

            // Tests result
            expect(MemoryPlayerState.getPlaylists()).toEqual(playlists);
        });

        it('should set and get a playlist', function () {

            // Sets playlist
            MemoryPlayerState.setPlaylist('Hypnotist');

            // Tests result
            expect(MemoryPlayerState.getPlaylist().playlist).toEqual(hypnotistPlaylist);
        });

        it('should set first track with playlist', function () {

            // Sets playlist
            MemoryPlayerState.setPlaylist('Hypnotist');

            // Tests result
            expect(MemoryPlayerState.getTrack()).toEqual(defaultResponse);
        });

        it('should get playlist by id', function () {

            // Sets playlist
            MemoryPlayerState.setPlaylist('Hypnotist');

            // Tests result
            expect(MemoryPlayerState.getPlaylistId()).toEqual('Hypnotist');
        });

        it('should set and get is paused', function () {

            // Sets is paused
            MemoryPlayerState.setIsPaused(false);

            // Tests result
            expect(MemoryPlayerState.getIsPaused()).toEqual(false);
        });

        it('should set and get is paused', function () {

            // Sets is muted
            MemoryPlayerState.setIsMuted(true);

            // Tests result
            expect(MemoryPlayerState.getIsMuted()).toEqual(true);
        });

        it('should set and get track', function () {

            // Sets playlist
            MemoryPlayerState.setPlaylist('PerpetualMotion');

            // Sets is track
            MemoryPlayerState.setTrack(1);

            // Tests result
            expect(MemoryPlayerState.getTrack()).toEqual(trackResponse);
        });

        it('should get track by id', function () {

            // Sets playlist
            MemoryPlayerState.setPlaylist('PerpetualMotion');

            // Sets is track
            MemoryPlayerState.setTrack(1);

            // Tests result
            expect(MemoryPlayerState.getTrackId()).toEqual(1);
        });

        it('should set and get volume', function () {

            // Sets volume
            MemoryPlayerState.setVolume(0.65);

            // Tests result
            expect(MemoryPlayerState.getVolume()).toEqual('0.65');
        });

        it('should limit volume to 2 decimals', function () {

            // Sets volume
            MemoryPlayerState.setVolume(0.6875);

            // Tests result
            expect(MemoryPlayerState.getVolume()).toEqual('0.69');
        });
    });
});
