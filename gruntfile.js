/* jshint node:true */
module.exports = function(grunt) { 'use strict';

    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({

        bower: {
            install: {
                options : {
                    targetDir : "./app/libs",
                    cleanTargetDir : true,
                    install : true,
                    copy : true,
                    bowerOptions : {
                        production : true
                    }
                }
             }
        },

        copy : {
            dist : {
                files : [{ //for font-awesome
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/font-awesome/fonts/',
                    src: ['*.*'],
                    dest: 'app/libs/fonts'
                },
                { //for font-awesome
                    expand: true,
                    dot: true,
                    cwd: 'bower_components/ionsound/sounds/',
                    src: ['*.*'],
                    dest: 'app/libs/ionsound/sounds'
                }]
            }
        },

        requirejs: {
          compile: {
            options: {
                appDir: "./app",
                baseUrl: ".",
                dir: "app_build",
                mainConfigFile: "app/boot.js",
                modules: [ {
                    name : "boot",
                    include: [
                        'services/editFormUtility',
                        'directives/forms/form-controls',
                        'directives/formats/views/form-loader',
                        'utilities/km-utilities',
                        'utilities/km-workflows',
                        'utilities/km-storage',
                        'views/index',
                        'views/database/index',
                    ]
                }] ,
                fileExclusionRegExp : /^intro/,
                inlineText : true,
                optimize : "uglify2",
                optimizeCss : "standard"
            }
          }
        }
    });

    grunt.registerTask('default',    ['bower', 'copy']);
};
