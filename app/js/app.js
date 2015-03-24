define(['angular'], function(angular) { 'use strict';

    var deps = ['ngRoute', 'leaflet-directive', '$strap.directives'];

    angular.defineModules(deps);

    var app = angular.module('kmApp', deps);

    app.config(['$controllerProvider', '$compileProvider', function($controllerProvider, $compileProvider) {

        // Lagacy dynamic registration

        app.controllerProvider = $controllerProvider;
        app.compileProvider    = $compileProvider;
    }]);

    return app;
});
