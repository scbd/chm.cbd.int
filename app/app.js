define(['angular', 'ngSanitize', 'ngAnimate' ,'ngAria' ,
'ngMaterial', 'ngSmoothScroll', 'textAngular', 'ngMeta'], function(angular) { 'use strict';


    var deps = ['ngRoute', 'ngSanitize', 'ngCookies', 'leaflet-directive', 
    'ng-breadcrumbs','ngAnimate' ,'ngAria' ,'ngMaterial', 'smoothScroll', 
    'ngDialog', 'textAngular', 'ngMeta'];

    angular.defineModules(deps);

    var app = angular.module('kmApp', deps);

    app.config(['$httpProvider', 'ngMetaProvider', function($httpProvider, ngMetaProvider){

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');

        ngMetaProvider.useTitleSuffix(true);
        ngMetaProvider.setDefaultTitle('Clearing-House Mechanism');
        ngMetaProvider.setDefaultTitleSuffix(' | Clearing-House Mechanism');
        ngMetaProvider.setDefaultTag('description', ' | Clearing-House Mechanism of the Convention on Biological Diversity | CHM | CBD');
    }])
    .run(['ngMeta', function(ngMeta) {
        ngMeta.init();
    }]);

    return app;
});
