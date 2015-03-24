define(['angular'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'leaflet-directive', '$strap.directives'];

    angular.defineModules(deps);

    return angular.module('kmApp', deps);
});
