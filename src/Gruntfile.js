module.exports = function (grunt) {
    var path = {
        jsSrc: 'MemoryPlayer/lib/memory-player/ts',
        jsonSrc: 'MemoryPlayer/lib/memory-player/json',
        htmlSrc: 'MemoryPlayer/lib/memory-player/html',
        scssSrc: 'MemoryPlayer/lib/memory-player/scss',
        lessSrc: 'MemoryPlayer/lib/memory-player/less',
        jsDist: 'MemoryPlayer/lib/memory-player/dist/js',
        jsonDist: 'MemoryPlayer/lib/memory-player/dist/json',
        htmlDist: 'MemoryPlayer/lib/memory-player/dist/html',
        cssDist: 'MemoryPlayer/lib/memory-player/dist/css'
    }

    // Project configuration.
    grunt.initConfig({
        path: path,
        clean: {
            dist: [
                '<%= path.jsDist %>/',
                '<%= path.jsonDist %>/playlists.json',
                '<%= path.htmlDist %>/memory-player.html',
                '<%= path.htmlDist %>/sharing.html',
                '<%= path.cssDist %>/*.css'
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
                        '<%= path.jsSrc %>/MP.module.js',
                        '<%= path.jsSrc %>/providers/MP.JPlayer.provider.js',
                        '<%= path.jsSrc %>/MP.config.js',
                        '<%= path.jsSrc %>/services/MP.API.service.js',
                        '<%= path.jsSrc %>/services/MP.Controls.service.js',
                        '<%= path.jsSrc %>/services/MP.State.service.js',
                        '<%= path.jsSrc %>/services/MP.Sharing.service.js',
                        '<%= path.jsSrc %>/MP.controller.js',
                        '<%= path.jsSrc %>/MP.directive.js',
                        '<%= path.jsSrc %>/MP.Sharing.directive.js'
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
                    '<%= path.htmlDist %>/sharing.html': ['<%= path.htmlSrc %>/sharing.html'],
                    '<%= path.jsonDist %>/playlists.json': ['<%= path.jsonSrc %>/playlists.json.sample'],
                    '<%= path.jsDist %>/DEMO.js': ['<%= path.jsSrc %>/DEMO.js']
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
    grunt.registerTask('styles', ['concat', 'sass', 'cssmin']);
    grunt.registerTask('default', ['clean:dist', 'copy', 'comments', 'concat', 'uglify', 'sass', 'cssmin', 'clean:complete']);
};
