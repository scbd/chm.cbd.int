define(['angular', 'ngSanitize'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngSanitize', 'leaflet-directive', '$strap.directives'];

    angular.defineModules(deps);

    return angular.module('kmApp', deps);
});