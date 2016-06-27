define(['app', 'angular'], function(app, angular) { 'use strict';

    return['$scope', '$route', function ($scope, $route) {
        window.location.href = 'https://www.cbd.int/undb-new/actors/partners/register/'+$route.current.params.uid||'';
    }];
});
