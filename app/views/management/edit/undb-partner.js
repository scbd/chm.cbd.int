define(['app', 'angular'], function(app, angular) { 'use strict';

    return['$scope', '$route', '$location', function ($scope, $route, $location) {
        var id = $route.current.params.uid||'';
        if(id=='new')
            id = undefined;
        var workflowId = $location.search().workflowId ? '?workflowId=' + $location.search().workflowId : '';

        if(id || workflowId)
            window.location.href = 'https://www.cbd.int/undb-new/actors/partners/edit/'+id + workflowId;
        else
            window.location.href = 'https://www.cbd.int/undb-new/actors/partners/register';
    }];
});
