/* jshint node:true */
module.exports = function(grunt) { 'use strict';

    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({

        bower: {
            install: { }//just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
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
                inlineText : true,
                optimize : "uglify2",
                optimizeCss : "standard"
            }
          }
        }
    });

    grunt.registerTask('default', ['bower', 'requirejs']);
};
