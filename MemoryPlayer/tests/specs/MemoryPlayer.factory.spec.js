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

    describe('MemoryPlayerFactory. unit tests', function () {
        it("should pingKeyCloak for 200", function () {

            // The API URL to determine whether KeyCloak is available to handle registration
            $httpBackend.expectGET('/User/Ping/').respond(200, IsKeyCloakAlive200);

            var responseStatus;

            var successCB = function (response) {

                responseStatus = response.data.HttpCode;
            };

            var errorCB = function (error) {

                responseStatus = error.data.HttpCode;
            };

            // Ping KeyCloak
            registrationFactory.isKeyCloakAlive(successCB, errorCB);

            expect(angular.isUndefined(responseStatus)).toBeTruthy();

            // Flush pending requests to allow synchronous test execution while preserving behavior of code under test
            $httpBackend.flush();
            expect(responseStatus).toBe(200);
        });
    });
});