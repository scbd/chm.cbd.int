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
                mainConfigFile: "app/chm/boot.js",
                modules: [ {
                    name : "chm/boot",
                    include: [
                        'chm/services/editFormUtility',
                        'directives/forms/form-controls',
                        'utilities/km-utilities',
                        'utilities/km-workflows',
                        'utilities/km-storage',
                        'views/index',
                        'views/database/index',
                    ]
                }] ,
                inlineText : true,
                optimize : "none"
            }
          }
        }
    });

    grunt.registerTask('default', ['bower', 'requirejs']);
};
