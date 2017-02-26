/**
 * Max Volume method is not tested because it relies on internal jQuery event
 */
describe('MemoryPlayerAPI unit tests', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend;
    var MemoryPlayerAPI;

    beforeEach(inject(function (_$httpBackend_, _MemoryPlayerAPI_) {
        $httpBackend = _$httpBackend_;

        MemoryPlayerAPI = _MemoryPlayerAPI_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('MemoryPlayerAPI unit test', function () {
        it('should fetch the playlists json data', function () {

            $httpBackend.expectGET('/lib/memory-player/dist/json/playlists.json').respond(200, playlists);

            var playlistsResponse;

            MemoryPlayerAPI.getPlaylists().then(function (response) {
                playlistsResponse = response;
            });

            $httpBackend.flush();

            expect(playlistsResponse).toEqual(playlists);
        });
    });
});