module.exports = function (grunt) {
    var path = {
        htmlSrc: 'MemoryPlayer/src/MemoryPlayer/html',
        jsSrc: 'MemoryPlayer/src/MemoryPlayer/ts',
        jsonSrc: 'MemoryPlayer/src/MemoryPlayer/json',
        scssSrc: 'MemoryPlayer/src/MemoryPlayer/sass',
        lessSrc: 'MemoryPlayer/src/MemoryPlayer/less',
        appSrc: 'MemoryPlayer/src/app',
        htmlDist: 'MemoryPlayer/dist/html',
        jsDist: 'MemoryPlayer/dist/js/MemoryPlayer',
        jsonDist: 'MemoryPlayer/dist/json',
        cssDist: 'MemoryPlayer/dist/css'
    }

    // Project configuration.
    grunt.initConfig({
        path: path,
        clean: {
            dist: [
                '<%= path.jsDist %>/',
                '<%= path.jsonDist %>/playlists.json',
                '<%= path.htmlDist %>/memory-player.html',
                '<%= path.cssDist %>/memory-player.css',
                '<%= path.cssDist %>/memory-player.min.css'
            ],

            complete: [
                '<%= path.scssSrc %>/memory-player.scss'
            ]
        },
        sass: {
            dist: {
                files: {
                    '<%= path.cssDist %>/memory-player.css': ['<%= path.scssSrc %>/memory-player.scss']
                }
            }
        },
        less: {
            dist: {
                files: {
                    '<%= path.cssDist %>/memory-player.css': [
                        '<%= path.lessSrc %>/module-jplayer.less',
                        '<%= path.lessSrc %>/sprite-memory-player.less',
                        '<%= path.lessSrc %>/module-memory-player.less'
                    ]
                }
            }
        },
        cssmin: {
            dist: {
                files: {
                    '<%= path.cssDist %>/memory-player.min.css': ['<%= path.cssDist %>/memory-player.css']
                }
            }
        },
        concat: {
            dist: {
                options: {
                    banner: '/*! Memory Player module. Copyright 2015-<%= grunt.template.today("yyyy") %> Adam De Lucia. */',
                },
                files: {
                    '<%= path.jsDist %>/memory-player.js': [
                        '<%= path.jsSrc %>/MemoryPlayer.module.js',
                        '<%= path.jsSrc %>/MemoryPlayerAPI.service.js',
                        '<%= path.jsSrc %>/MemoryPlayer.factory.js',
                        '<%= path.jsSrc %>/MemoryPlayer.controller.js',
                        '<%= path.jsSrc %>/MemoryPlayer.directive.js',
                        '<%= path.appSrc %>/DemoApp.js'
                    ],

                    '<%= path.scssSrc %>/memory-player.scss': [
                        '<%= path.scssSrc %>/module-jplayer.scss',
                        '<%= path.scssSrc %>/sprite-memory-player.scss',
                        '<%= path.scssSrc %>/module-memory-player.scss'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                options: {
                    preserveComments: 'all'
                },
                files: {
                    '<%= path.jsDist %>/memory-player.min.js': ['<%= path.jsDist %>/memory-player.js'],
                }
            }
        },
        copy: {
            dist: {
                files: {
                    '<%= path.htmlDist %>/memory-player.html': ['<%= path.htmlSrc %>/memory-player.html'],
                    '<%= path.jsonDist %>/playlists.json': ['<%= path.jsonSrc %>/playlists.json.sample']
                }
            }
        },
        comments: {
            dist: {
                options: {
                    singleline: true,
                    multiline: true
                },
                src: ['<%= path.jsSrc %>/*.js']
            },
        }
    });

    // Load Tasks
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-stripcomments');

    // Register Tasks
    grunt.registerTask('default', ['clean:dist', 'copy', 'comments', 'concat', 'uglify', 'sass', 'cssmin', 'clean:complete']);
};
