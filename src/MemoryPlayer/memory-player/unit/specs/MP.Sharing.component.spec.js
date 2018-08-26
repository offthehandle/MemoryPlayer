
describe('MPComponent', function () {

    beforeEach(module('MemoryPlayer'));

    beforeEach(module('/memory-player/dist/html/mp-sharing.html'));

    var $compile, $rootScope;

    var element, MPSharingController;

    beforeEach(inject(function (_$compile_, _$rootScope_) {

        // Angular core DI
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        scope = _$rootScope_.$new();


        // Compiles component
        element = $compile('<mp-sharing></mp-sharing>')($rootScope);

        $rootScope.$digest();

        MPSharingController = element.controller('mpSharing');
    }));

    describe('MPComponent initializes', function () {
        it('should compile', function () {

            // Tests result
            expect(element.length).toBe(1);
        });

        it('should initialize is time used', function () {

            // Tests result
            expect(MPSharingController.isTimeUsed).toBe(false);
        });

        it('should initialize share link', function () {

            // Tests result
            expect(MPSharingController.sharelink).toBe(null);
        });

        it('should initialize share link time', function () {

            // Tests result
            expect(MPSharingController.sharelinkTime).toBe('00:00');
        });
    });
});
