describe('MemoryPlayer.factory unit tests', function () {

    var $httpBackend, $rootScope, $timeout, MemoryPlayerFactory;
    var httpStatus, httpResponse, httpShortMessage;

    beforeEach(module('MemoryPlayer'));

    beforeEach(inject(function (_$httpBackend_, $injector, $controller) {
        $httpBackend = _$httpBackend_;
        $rootScope = $injector.get('$rootScope');
        $timeout = $injector.get('$timeout');
        MemoryPlayerFactory = $injector.get('MemoryPlayerFactory');
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    //describe('MemoryPlayerFactory. unit tests', function () {
    //    it("should ...", function () {

    //});
});