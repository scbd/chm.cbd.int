define(['app', 'angular'], function(app, angular) {
    'use strict';

    return ['$scope', '$route', '$location', function($scope, $route, $location) {
        var schema = $route.current.params.schema || '';
        var id = $route.current.params.uid || '';
        // if (id == 'new')
        //     id = '';
        var workflowId = $location.search().workflowId ? '?workflowId=' + $location.search().workflowId : '';

				if(schema.indexOf('bbi')>=0)
						redirectToBbiForm (schema);
				else if(schema.indexOf('undb')>=0)
						redirectToUndbForm (schema);
        else if(schema==='event')
          redirectEvent ();
				else
					$location.path('/404');

          function redirectEvent () {
  					  var host = document.location.hostname;

  						if(host.indexOf('localhost')>=0 || host.indexOf('staging')>=0 )
  		        	window.location.href = 'https://undb.staging.cbd.int/dashboard/submit/event/' + id + workflowId;
  						else if(host.indexOf('cbddev.xyz')>=0)
  							 window.location.href = 'https://undb.cbddev.xyz/dashboard/submit/event/'+ id + workflowId;
  						else
  							 window.location.href = 'https://www.cbd.int/2011-2020//dashboard/submit/event/'+id + workflowId;
  				}
				function redirectToBbiForm (schema) {
					  var host = document.location.hostname;

						if(host.indexOf('localhost')>=0 || host.indexOf('staging')>=0 )
		        	window.location.href = 'https://bbi.staging.cbd.int/biobridge/platform/submit/'+schema+'/' + id + workflowId;
						else if(host.indexOf('cbddev.xyz')>=0)
							 window.location.href = 'https://bbi.cbddev.xyz/biobridge/platform/submit/'+schema+'/' + id + workflowId;
						else
							 window.location.href = 'https://www.cbd.int/biobridge/platform/submit/'+schema+'/' + id + workflowId;
				}
				function redirectToUndbForm (schema) {
						var host = document.location.hostname;

						if(host.indexOf('localhost')>=0 || host.indexOf('staging')>=0 )
							window.location.href = 'https://undb.staging.cbd.int/dashboard/submit/'+schema+'/' + id + workflowId;
						else if(host.indexOf('cbddev.xyz')>=0)
							 window.location.href = 'https://undb.cbddev.xyz/dashboard/submit/'+schema+'/' + id + workflowId;
						else
							 window.location.href = 'https://www.cbd.int/2011-2020//dashboard/submit/'+schema+'/' + id + workflowId;
				}
    }];
});