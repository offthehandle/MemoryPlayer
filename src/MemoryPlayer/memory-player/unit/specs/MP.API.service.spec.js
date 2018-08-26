
describe('MPAPI', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend;
    var MPAPI;

    beforeEach(inject(function (_$httpBackend_, _MemoryPlayerAPI_) {

        // Angular core DI
        $httpBackend = _$httpBackend_;

        // Memory Player DI
        MPAPI = _MemoryPlayerAPI_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('MPAPI gets playlists', function () {
        it('should get playlists json', function () {

            $httpBackend.expectGET('/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse;

            MPAPI.getPlaylists().then(function (response) {

                playlistsResponse = response;
            });

            $httpBackend.flush();

            expect(playlistsResponse).toEqual(playlists);
        });
    });
});