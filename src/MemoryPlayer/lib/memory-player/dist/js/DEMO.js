'use strict';
var MemoryPlayerDemo = angular.module('DemoApp', [
    'MemoryPlayer'
]);
MemoryPlayerDemo.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.html5Mode({
            enabled: true,
            requireBase: false
        });
    }]);
MemoryPlayerDemo.run(['$rootScope', '$window', function ($rootScope, $window) {
        $rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {
            if (newUrl !== oldUrl) {
                $window.location.href = newUrl;
            }
        });
    }]);
