

module.exports = function(grunt) {

 //Initializing the configuration object
      grunt.initConfig({

            less: {
              development: {
                options: {
                  paths: ["assets/css"]
                },
                files: {
                  "./app/css/bootstrap.css":"./app/css/SCBDBootstrapVariables.less"
                }
              }
            }

            
      });

      grunt.loadNpmTasks('grunt-contrib-concat');
      grunt.loadNpmTasks('grunt-contrib-uglify');
      grunt.loadNpmTasks('grunt-contrib-less');
      grunt.loadNpmTasks('grunt-contrib-watch');
      grunt.registerTask('default', ['watch']);
      grunt.registerTask('default', ['bower']);
};
