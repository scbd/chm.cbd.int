define(['angular', 'ngSanitize','ngAnimate' ,'ngAria' ,'ngMaterial', 'ngSmoothScroll'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngSanitize', 'leaflet-directive', 'ng-breadcrumbs','ngAnimate' ,'ngAria' ,'ngMaterial', 'smoothScroll'];

    angular.defineModules(deps);

    var app = angular.module('kmApp', deps);

    app.config(['$httpProvider', '$provide', function($httpProvider, $provide){

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
    }]);


    return app;
});
