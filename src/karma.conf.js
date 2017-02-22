// Karma configuration
// Generated on Sun Feb 19 2017 18:00:50 GMT-0500 (Eastern Standard Time)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
		'MemoryPlayer/dist/js/jquery-3.1.1.js',
		'MemoryPlayer/dist/js/jquery.jplayer.js',
		'MemoryPlayer/dist/js/jplayer.playlist.js',
		'MemoryPlayer/dist/js/angular.js',
		'MemoryPlayer/tests/angular-mocks.js',
		'MemoryPlayer/dist/js/MemoryPlayer/memory-player.js',
		'MemoryPlayer/tests/MockResponse.js',
		'MemoryPlayer/tests/specs/**/*spec.js',
		'MemoryPlayer/dist/html/memory-player.html'
    ],


    ngHtml2JsPreprocessor: {
      // strip this from the file path
      stripPrefix: 'MemoryPlayer',
      },


	// list of files to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
		'MemoryPlayer/dist/html/memory-player.html': ['ng-html2js']
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['PhantomJS'], // 'Chrome', 'Firefox', 'IE', 'Safari', 'Opera', 'ChromeCanary'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  })
}
