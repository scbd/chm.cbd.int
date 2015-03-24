/* jshint node:true */
module.exports = function(grunt) { 'use strict';

    // load all grunt tasks matching the ['grunt-*', '@*/grunt-*'] patterns
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
        bower: {
            install: { }//just run 'grunt bower:install' and you'll see files from your Bower packages in lib directory
        }
    });

    grunt.registerTask('default', ['bower']);
};
