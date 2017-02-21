describe('MemoryPlayerController unit tests', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, $rootScope, $scope, MemoryPlayerFactory;
    var MemoryPlayerController;

    beforeEach(inject(function (_$httpBackend_, _$rootScope_, _MemoryPlayerFactory_, $controller) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        $scope = _$rootScope_.$new();
        MemoryPlayerFactory = _MemoryPlayerFactory_;
        MemoryPlayerController = $controller('MemoryPlayerController as player', {
            $scope: $scope
        });
    }));

    it('MemoryPlayerController should exist', function () {
        expect(!!MemoryPlayerController).toBeTruthy();
    });
});