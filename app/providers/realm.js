define(['app'], function (app) { 'use strict';

    app.provider("realm", {

        $get : ["$location", function($location) {

            if($location.$$host!= "chm.cbd.int"){
                return 'CHM-DEV';
            }
            return $delegate;
        }]
    });
    
    app.factory('realmHttpIntercepter', ['realm', function(realm) {

		return {
			request: function(config) {
				var trusted = /^https:\/\/api.cbd.int\//i .test(config.url) ||
						      /^https:\/\/localhost[:\/]/i.test(config.url) ||
							  /^\/\w+/i                   .test(config.url);

                //exception if the APi call needs to be done for different realm
                if(trusted && realm && config.params && config.params.realm && config.params.realm != realm) {
                      config.headers = angular.extend(config.headers || {}, { realm : config.params.realm });
                }
                else if(trusted && realm ) {
                    config.headers = angular.extend(config.headers || {}, { realm : realm });
                }

                return config;
			}
		};
	}]);

}); //define
