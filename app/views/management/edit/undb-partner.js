define(['app', 'angular'], function(app, angular) { 'use strict';

    return['$scope', '$route', function ($scope, $route) {
        var id = $route.current.params.uid||'';
        if(id=='new')
            id = '';
        window.location.href = 'https://www.cbd.int/undb-new/actors/partners/register/'+id;
    }];
});
