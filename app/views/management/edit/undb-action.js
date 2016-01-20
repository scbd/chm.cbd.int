define(['app', 'angular'], function(app, angular) { 'use strict';

return ['$scope', '$route', function ($scope, $route) {
	            var qs = $route.current.params;
            window.location.href = 'https://cbd.int/undb-new/actions/submit-form/' + qs.uid||'';
        }];
});
