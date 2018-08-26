
describe('MPComponent', function () {

    beforeEach(module('MemoryPlayer'));

    beforeEach(module('/memory-player/dist/html/memory-player.html'));

    var $compile, $httpBackend, $rootScope, MemoryPlayerAPI;

    var element, MPPlayerController;

    beforeEach(inject(function (_$compile_, _$httpBackend_, _$rootScope_, _MemoryPlayerAPI_) {

        // Angular core DI
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;

        // Memory Player DI
        MemoryPlayerAPI = _MemoryPlayerAPI_;


        // Compiles component
        element = $compile('<memory-player></memory-player>')($rootScope);

        // Populates playlist data
        $httpBackend.expectGET('/memory-player/dist/json/playlists.json').respond(200, playlists);

        $httpBackend.flush();

        $rootScope.$digest();

        MPPlayerController = element.controller('memoryPlayer');
    }));

    describe('MPComponent initializes', function () {
        it('should compile', function () {

            // Tests result
            expect(element.length).toBe(1);
        });
    });

    describe('MPController executes programmed behaviors', function () {
        it('should test restartability for success', function () {

            var state = {
                isMuted: '',
                isPaused: '',
                playlist: '',
                time: '',
                track: '',
                volume: ''
            };

            // Selects playlist
            var isRestartable = MPPlayerController.isRestartable(state);

            // Tests result
            expect(isRestartable).toEqual(true);
        });

        it('should test restartability for failure', function () {

            var state = {
            };

            // Selects playlist
            var isRestartable = MPPlayerController.isRestartable(state);

            // Tests result
            expect(isRestartable).toEqual(false);
        });
    });
});
