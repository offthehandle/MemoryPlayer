### Quick links
- [Memory Player](#memory-player)
- [Demo](#demo)
- [Installation](#installation)
    - [Angular Requirements](#angular-requirements)
    - [Install with NuGet](#install-with-nuget)
    - [Adding Dependency](#adding-dependency)
    - [Configuration](#configuration)
- [Support](#support)
- [Supported Browsers](#supported-browsers)
    - [Works on browsers](#works-on-browsers)
    - [Works on operating systems](#works-on-operating-systems)
- [Notes for NuGet Users](#notes-for-nuget-users)

# Memory Player
Memory Player is a lonely AngularJS module written in TypeScript that is seeking to befriend musicians. Asked if Memory Player has the qualities of a good friend it replied, "No. A best friend." These qualities include continuous audio playback between pages, support for playlists, remembering the selected playlist, selected track, track time, player volume, birthdays and other significant life events. As an aid to Developers, the package installs with TS source files, interfaces, and a sample JSON file with the JSON schema to validate against. A reliable contract for communication between pages is established without any requirement for frames, tabs, accordions, popups or SPAs.

## Demo
Want to see Memory Player in action? [Check it out](http://www.thetektonics.com).

## Installation
Installation is easy. The only dependencies are AngularJS and [jPlayer](http://jplayer.org), and the distribution contains a [working example](src/MemoryPlayer/index.html). Download the repo and run the solution in Visual Studio or install [http-server](https://www.npmjs.com/package/http-server) to run the example.

### Angular Requirements
* Memory Player 1.0 and higher requires Angular 1.4.1 or higher and has been tested with Angular 1.6.1.
* It is possible that Memory Player will work with older versions of Angular. Since the module was developed during the lifecycle of later Angular 1.x releases, < 1.4.1 is not officially supported.

##### Install with NuGet
To install Memory Player, run the following command in the Package Manager Console:
```
PM> Install-Package MemoryPlayer
```

### Adding Dependency
```javascript
angular.module('myModule', ['MemoryPlayer']);
```

### Configuration
Memory Player exchanges information between pages on the URL using a query string. Enable HTML 5 mode and configure `$locationChangeSuccess` to setup this communication.
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

## Support
Memory Player is fully documented with JS Doc. [Http-server](https://www.npmjs.com/package/http-server) is recommended to run the [documentation site](documentation/).

## Supported Browsers
Memory Player is a fully responsive solution that is developed and tested on multiple mobile devices and desktop browsers. The gesture required on smartphones to restart playback is handled by the player to prevent any error. Styling covers all screen sizes and exposes the right controls for the best experience on any device.

#### Works on browsers
* Chrome
* Firefox
* IE 9+
* Safari
* Edge

#### Works on operating systems
* Windows
* macOS
* OSX
* iOS

## Notes for NuGet Users
The Memory Player NuGet package installs without the referenced json file and media. I invite those interested in donating sample audio and album art to reach out to me. The NuGet package does install with a json schema and json.sample file. The schema can be used to validate your own json file. You can also remove the .sample extension from the json.sample file and modify it as needed. Just plug your own audio and artwork in to get started. Expect 404s in the console and the programmed Memory Player error handling, which removes a broken player from the DOM rather than display that to users, before the setup of assets for your playlist is complete.
