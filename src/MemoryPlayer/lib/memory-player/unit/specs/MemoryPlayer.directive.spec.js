describe('MemoryPlayer.directive unit tests', function () {
    var scope;

    var $compile, $rootScope;

    beforeEach(module('MemoryPlayer'));

    beforeEach(module('/lib/memory-player/dist/html/memory-player.html'));

    beforeEach(inject(function (_$compile_, _$rootScope_) {
        scope = _$rootScope_.$new();
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('Replaces the element with the appropriate content', function () {

        var element = $compile("<section memory-player></section>")($rootScope);

        $rootScope.$digest();

        expect(element.length).toBe(1);
    });
});