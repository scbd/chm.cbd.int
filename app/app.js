define(['angular', 'ngSanitize','ngAnimate' ,'ngAria' ,'ngMaterial', 'ngSmoothScroll'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngSanitize', 'leaflet-directive', 'ng-breadcrumbs','ngAnimate' ,'ngAria' ,'ngMaterial', 'smoothScroll'];

    angular.defineModules(deps);

    var app = angular.module('kmApp', deps);

    app.config(['$httpProvider', function($httpProvider){

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');

    }]);

    app.factory('realmHttpIntercepter', ["realm", function(realm) {

		return {
			request: function(config) {

				var trusted = /^https:\/\/api.cbd.int\//i .test(config.url) ||
						      /^https:\/\/localhost[:\/]/i.test(config.url) ||
							  /^\/\w+/i                   .test(config.url);

                if(trusted && realm) {
                    config.headers = angular.extend(config.headers || {}, { realm : realm });
                }

                return config;
			}
		};
	}]);

    return app;
});
