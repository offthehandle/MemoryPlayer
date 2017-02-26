/**
 * Max Volume method is not tested because it relies on internal jQuery event
 */
describe('MemoryPlayerFactory unit tests', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, $rootScope, $scope;
    var MemoryPlayerFactory;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _MemoryPlayerFactory_, $controller) {
        $httpBackend = _$httpBackend_;

        MemoryPlayerFactory = _MemoryPlayerFactory_;

        $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

        var playlistsResponse;

        MemoryPlayerFactory.fetchPlaylists(function () {

            playlistsResponse = MemoryPlayerFactory.getAllPlaylists();
        });

        $httpBackend.flush();

        for (var playlist in playlistsResponse) {
            break;
        }

        MemoryPlayerFactory.createPlayer(playlistsResponse[playlist]._id, null);
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('MemoryPlayerFactory player creation unit test', function () {
        it('should create the player', function () {
            expect(MemoryPlayerFactory._playerInstance).toBeTruthy();
        });

        it('should set the default playlist', function () {
            expect(MemoryPlayerFactory.getPlaylist().playlist).toEqual(defaultPlaylist);
        });
    });

    describe('MemoryPlayerFactory player functionality unit test', function () {
        it('should set playlists', function () {
            MemoryPlayerFactory.setPlaylist('Hypnotist');
            expect(MemoryPlayerFactory.getPlaylist().playlist).toEqual(hypnotistPlaylist);
        });

        it('should play', function () {
            MemoryPlayerFactory.play();
            expect(MemoryPlayerFactory.isPaused).toBe(false);
        });

        it('should cue tracks', function () {
            MemoryPlayerFactory.cueTrack(1);
            expect(MemoryPlayerFactory.getTrack()).toEqual(trackResponse);
        });

        it('should play next track', function () {
            MemoryPlayerFactory.next();
            expect(MemoryPlayerFactory.getTrack()).toEqual(trackResponse);
        });

        it('should play previous track', function () {
            MemoryPlayerFactory.cueTrack(2);
            MemoryPlayerFactory.previous();
            expect(MemoryPlayerFactory.getTrack()).toEqual(trackResponse);
        });

        it('should mute the player', function () {
            MemoryPlayerFactory.mute();
            expect(MemoryPlayerFactory.getIsMuted()).toBe(true);
        });

        it('should unmute the player', function () {
            MemoryPlayerFactory.mute();
            MemoryPlayerFactory.mute();
            expect(MemoryPlayerFactory.getIsMuted()).toBe(false);
        });
    });
});