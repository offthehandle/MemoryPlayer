describe('MemoryPlayerController', function () {

    beforeEach(module('MemoryPlayer'));

    var $httpBackend, $rootScope, $scope, $location, MemoryPlayerFactory;
    var MemoryPlayerController;

    beforeEach(inject(function (_$httpBackend_, $injector, $controller) {
        $httpBackend = _$httpBackend_;
        $rootScope = $injector.get('$rootScope');
        $scope = $injector.get('$scope');
        $location = $injector.get('$location');
        MemoryPlayerFactory = $injector.get('MemoryPlayerFactory');
        MemoryPlayerController = $controller('MemoryPlayerController as player', {
            $scope: {}
        });
    }));

    it('MemoryPlayerController should exist', function () {
        expect(!!MemoryPlayerController).toBeTruthy();
    });

    //it('MemoryPlayerController should initialize correctly', function () {
    //});
});