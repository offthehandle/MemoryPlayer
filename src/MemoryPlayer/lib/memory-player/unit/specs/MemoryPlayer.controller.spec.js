/**
 * Max Volume method is not tested because it relies on internal jQuery event
 */
describe('MemoryPlayerController unit tests', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, $scope, $rootScope, MemoryPlayerFactory;
    var MemoryPlayerController;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _MemoryPlayerFactory_, $controller) {
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;

        MemoryPlayerFactory = _MemoryPlayerFactory_;

        MemoryPlayerController = $controller('MemoryPlayerController as player', {
            $scope: $scope
        });

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

    describe('MemoryPlayerController initialization unit test', function () {
        it('should exist', function () {
            expect(!!MemoryPlayerController).toBeTruthy();
        });
    });

    describe('MemoryPlayerController player functionality unit test', function () {
        it('should set playlists', function () {
            MemoryPlayerController.setPlaylist('Hypnotist');
            expect(MemoryPlayerController.selectedPlaylist.playlist).toEqual(hypnotistPlaylist);
        });

        it('should play', function () {
            MemoryPlayerController.play();
            // Checks factory method since controller isPaused is updated on event using $scope.$apply
            expect(MemoryPlayerFactory.isPaused).toBe(false);
        });

        it('should cue tracks', function () {
            MemoryPlayerController.cueTrack(1);
            expect(MemoryPlayerController.selectedTrack).toEqual(trackResponse);
        });

        it('should play next track', function () {
            MemoryPlayerController.next();
            expect(MemoryPlayerController.selectedTrack).toEqual(trackResponse);
        });

        it('should play previous track', function () {
            MemoryPlayerController.cueTrack(2);
            MemoryPlayerController.previous();
            expect(MemoryPlayerController.selectedTrack).toEqual(trackResponse);
        });

        it('should mute the player', function () {
            MemoryPlayerController.mute();
            expect(MemoryPlayerFactory.getIsMuted()).toBe(true);
        });

        it('should unmute the player', function () {
            MemoryPlayerController.mute();
            MemoryPlayerController.mute();
            expect(MemoryPlayerFactory.getIsMuted()).toBe(false);
        });
    });
});