# Memory Player
Memory Player is a lonely AngularJS module written in TypeScript that is seeking to befriend musicians. Asked if Memory Player has the qualities of a good friend it replied, "No. A best friend." These qualities include continuous audio playback between pages, support for playlists, remembering the selected playlist, selected track, track time, player volume, birthdays and other significant life events. As an aid to Developers, the package installs with TS source files, interfaces, and a sample JSON file with the JSON schema to validate against. A reliable contract for communication between pages is established without any requirement for frames, tabs, accordions, popups or SPAs.

## Demo
Want to see Memory Player in action? [Check it out](http://www.thetektonics.com)

## Installation
Installation is easy. The only dependency is AngularJS, and the distribution contains a [working example](src/MemoryPlayer/index.html). Download the repo and run the solution in Visual Studio or install [http-server](https://www.npmjs.com/package/http-server) to run the example.

### Angular Requirements
* Memory Player 1.0 and higher requires Angular 1.4.1 or higher and has been tested with Angular 1.6.1.
* It is possible that Memory Player will work with older versions of Angular.  
  Since the module was developed during the lifecycle of later Angular 1.x releases, < 1.4.1 is not officially supported.

#### Install with NUGET
To install Memory Player, run the following command in the Package Manager Console:
```
PM> Install-Package MemoryPlayer
```

### Adding Dependency
```javascript
angular.module('myModule', ['MemoryPlayer']);
```

### Configuration
Memory Player exchanges information between pages on the URL using a query string. Enable HTML 5 mode and configure `$locationChangeSuccess` to configure this communication.
```javascript
angular.module('myModule', ['MemoryPlayer'])
.config(['$locationProvider', function ($locationProvider) {
  $locationProvider.html5Mode({
    enabled: true,
    requireBase: false
  });
}])
.run(['$rootScope', '$window', function ($rootScope, $window) {
  $rootScope.$on('$locationChangeSuccess', function (event, newUrl, oldUrl) {
    if (newUrl !== oldUrl) {
      $window.location.href = newUrl;
    }
  });
}]);
```
