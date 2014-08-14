define(['angular', 'angular-animate', 'angular-route', 'angular-cookies', 'angular-sanitize', 'leaflet-directive', 'angular-strap', 'angular-growl'], function(angular) { 'use strict';

    var legacyNoDuplicateStores = {};

    var app = angular.module('kmApp', ['ngRoute', 'ngCookies', 'ngSanitize', 'ngAnimate', 'leaflet-directive', '$strap.directives', 'angular-growl']);

    app.config(['$controllerProvider', '$compileProvider', '$provide', '$filterProvider', 'growlProvider', function($controllerProvider, $compileProvider, $provide, $filterProvider, growlProvider) {

        // Allow dynamic registration

        app.filter     = legacyNoDuplicate('filter',     $filterProvider.register);
        app.factory    = legacyNoDuplicate('factory',    $provide.factory);
        app.value      = legacyNoDuplicate('value',      $provide.value);
        app.controller = legacyNoDuplicate('controller', $controllerProvider.register);
        app.directive  = legacyNoDuplicate('directive',  $compileProvider.directive);

        // Lagacy dynamic registration

        app.controllerProvider = $controllerProvider;
        app.compileProvider    = $compileProvider;

        growlProvider.onlyUniqueMessages(true);
        growlProvider.globalTimeToLive(5000);
    }]);

    return app;

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////

    function legacyNoDuplicate(store, handlerFn)
    {
        legacyNoDuplicateStores[store] = {};

        return function(name, a, b, c, d, e, f, g, h, i, j)
        {
            if(legacyNoDuplicateStores[store][name]!==undefined) {
                console.log("Duplicate:", store, name);
                return legacyNoDuplicateStores[store][name];
            }

            legacyNoDuplicateStores[store][name] = handlerFn(name, a, b, c, d, e, f, g, h, i, j) || null;

            return legacyNoDuplicateStores[store][name];
        };
    }

    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////
});
