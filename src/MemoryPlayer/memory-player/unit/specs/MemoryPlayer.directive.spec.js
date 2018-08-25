describe('MemoryPlayer.directive unit test', function () {
    var scope;

    var $compile, $rootScope;

    beforeEach(module('MemoryPlayer'));

    beforeEach(module('/lib/memory-player/dist/html/memory-player.html'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        scope = _$rootScope_.$new();
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    describe('MemoryPlayerDirective initialization unit test', function () {
        it('Loads the directive with the appropriate content', function () {

            var element = $compile('<section data-memory-player=""></section>')($rootScope);

            $rootScope.$digest();

            expect(element.length).toBe(1);
        });
    });
});