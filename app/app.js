define(['angular', 'ngSanitize', 'ngAnimate' ,'ngAria' ,
'ngMaterial', 'ngSmoothScroll', 'textAngular'], function(angular) { 'use strict';


    var deps = ['ngRoute', 'ngSanitize', 'ngCookies', 'leaflet-directive', 
    'ng-breadcrumbs','ngAnimate' ,'ngAria' ,'ngMaterial', 'smoothScroll', 
    'ngDialog', 'textAngular'];

    angular.defineModules(deps);

    var app = angular.module('kmApp', deps);

    app.config(['$httpProvider', function($httpProvider){

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
    }]);

    return app;
});
