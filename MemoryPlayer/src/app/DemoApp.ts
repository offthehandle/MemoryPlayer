
'use strict';
var MemoryPlayerDemo = angular.module('DemoApp', [
    'MemoryPlayer'
]);

MemoryPlayerDemo.config(['$locationProvider', ($locationProvider: angular.ILocationProvider) => {

    $locationProvider.html5Mode({
        enabled: true,
        requireBase: false
    });

}]);

MemoryPlayerDemo.run(['$rootScope', '$window', ($rootScope: angular.IRootScopeService, $window: angular.IWindowService) => {

    $rootScope.$on('$locationChangeSuccess', function (event: angular.IAngularEvent, newUrl: string, oldUrl: string) {

        if (newUrl !== oldUrl) {

            $window.location.href = newUrl;
        }

    });

}]);
