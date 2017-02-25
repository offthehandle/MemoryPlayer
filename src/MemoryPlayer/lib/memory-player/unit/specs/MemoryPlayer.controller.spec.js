/**
 * Max Volume method is not tested because it relies on internal jQuery event
 */
describe('MemoryPlayerController unit tests', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, $rootScope, $scope, MemoryPlayerFactory;
    var MemoryPlayerController;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _MemoryPlayerFactory_, $controller) {
        $httpBackend = _$httpBackend_;
        $scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;

        MemoryPlayerFactory = _MemoryPlayerFactory_;

        MemoryPlayerController = $controller('MemoryPlayerController as player', {
            $scope: $scope
        });
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

    describe('MemoryPlayerController player creation unit test', function () {
        it('should fetch the playlist json data', function () {

            $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse;

            MemoryPlayerFactory.fetchPlaylists(function () {

                playlistsResponse = MemoryPlayerFactory.getAllPlaylists();
            });

            expect(angular.isUndefined(playlistsResponse)).toBeTruthy();

            $httpBackend.flush();

            expect(playlistsResponse).toEqual(playlists);
        });

        it('should create the player', function () {

            $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse, player;

            MemoryPlayerFactory.fetchPlaylists(function () {

                playlistsResponse = MemoryPlayerFactory.getAllPlaylists();
            });

            $httpBackend.flush();

            for (var playlist in playlistsResponse) {
                break;
            }

            MemoryPlayerFactory.createPlayer(playlistsResponse[playlist]._id, null);

            player = MemoryPlayerFactory._playerInstance;

            expect(player).toBeTruthy();
        });

        it('should set the default playlist', function () {

            $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse, playlistResponse;

            MemoryPlayerFactory.fetchPlaylists(function () {

                playlistsResponse = MemoryPlayerFactory.getAllPlaylists();
            });

            $httpBackend.flush();

            for (var playlist in playlistsResponse) {
                break;
            }

            MemoryPlayerFactory.createPlayer(playlistsResponse[playlist]._id, null);

            playlistResponse = MemoryPlayerFactory.getPlaylist().playlist;

            expect(playlistResponse).toEqual(defaultPlaylist);
        });
    });

    describe('MemoryPlayerController player functionality unit test', function () {
        it('should set playlists', function () {

            $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse, playlistResponse;

            MemoryPlayerFactory.fetchPlaylists(function () {

                playlistsResponse = MemoryPlayerFactory.getAllPlaylists();
            });

            $httpBackend.flush();

            for (var playlist in playlistsResponse) {
                break;
            }

            MemoryPlayerFactory.createPlayer(playlistsResponse[playlist]._id, null);

            MemoryPlayerController.setPlaylist('Hypnotist');

            playlistResponse = MemoryPlayerFactory.getPlaylist().playlist;

            expect(playlistResponse).toEqual(hypnotistPlaylist);
        });

        it('should play', function () {

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

            MemoryPlayerController.play();

            expect(MemoryPlayerController.isPaused).toBe(true);
        });

        it('should cue tracks', function () {

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

            MemoryPlayerController.cueTrack(1);

            expect(MemoryPlayerController.selectedTrack).toEqual(trackResponse);
        });

        it('should play next track', function () {

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

            MemoryPlayerController.next();

            expect(MemoryPlayerController.selectedTrack).toEqual(trackResponse);
        });

        it('should play previous track', function () {

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

            MemoryPlayerController.cueTrack(2);

            MemoryPlayerController.previous();

            expect(MemoryPlayerController.selectedTrack).toEqual(trackResponse);
        });

        it('should mute the player', function () {

            $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse, isMuted;

            MemoryPlayerFactory.fetchPlaylists(function () {

                playlistsResponse = MemoryPlayerFactory.getAllPlaylists();
            });

            $httpBackend.flush();

            for (var playlist in playlistsResponse) {
                break;
            }

            MemoryPlayerFactory.createPlayer(playlistsResponse[playlist]._id, null);

            MemoryPlayerController.mute();

            isMuted = MemoryPlayerFactory.getIsMuted();

            expect(isMuted).toBe(true);
        });

        it('should unmute the player', function () {

            $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse, isMuted;

            MemoryPlayerFactory.fetchPlaylists(function () {

                playlistsResponse = MemoryPlayerFactory.getAllPlaylists();
            });

            $httpBackend.flush();

            for (var playlist in playlistsResponse) {
                break;
            }

            MemoryPlayerFactory.createPlayer(playlistsResponse[playlist]._id, null);

            MemoryPlayerController.mute();

            MemoryPlayerController.mute();

            isMuted = MemoryPlayerFactory.getIsMuted();

            expect(isMuted).toBe(false);
        });
    });
});