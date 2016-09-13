define(['app', 'angular'], function(app, angular) { 'use strict';

return ['$scope', '$route', '$location', function ($scope, $route, $location) {
	            var qs = $route.current.params;
		        var id = $route.current.params.uid||'';
		        if(id=='new')
		            id = '';
				var workflowId = $location.search().workflowId ? '?workflowId=' + $location.search().workflowId : '';
		        window.location.href = 'https://www.cbd.int/undb-new/actions/submit-form/' + id + workflowId;
        }];
});
