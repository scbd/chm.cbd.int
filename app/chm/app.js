define(['angular', 'ngSanitize'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'ngSanitize', 'leaflet-directive'];

    angular.defineModules(deps);

    return angular.module('kmApp', deps);
});
