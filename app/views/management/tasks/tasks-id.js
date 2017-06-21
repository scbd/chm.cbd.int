define(['lodash', 'directives/management/register-facets', 'authentication', "directives/formats/views/form-loader", 'utilities/km-workflows', 'utilities/km-storage', 'utilities/km-utilities'], function(_) { 'use strict';

return [ "$scope", "$timeout", "$http", "$route", "IStorage", "IWorkflows", "authentication", function ($scope, $timeout, $http, $route, IStorage, IWorkflows, authentication)
{
	//==================================================
	//
	//
	//==================================================
	function load() {

		IWorkflows.get($route.current.params.id).then(function(workflow){
			$scope.workflow = workflow;
			if(!!!(workflow)){
				$http.get("/api/v2016/bbi-requests/"+$route.current.params.id).then(
					function(resp){
						if(!resp.data){
									$scope.error= 'Error: no workflow found by ID: '+$route.current.params.id;
									return;
						}
						$scope.workflow=_.clone(resp.data);
						$scope.workflow.type={};
						$scope.workflow.type.name='publishReferenceRecord';
						$scope.workflow.schema="bbiRequest";
						$scope.activity={};
						$scope.activity.name='publishRecord';
						$scope.activity.schema='bbiRequest';
						$scope.document=_.clone(resp.data);
						$scope.document.header={};
						$scope.document.header.schema="bbiRequest";
						return resp.data;
					});

			}else{
			if(workflow.data.identifier && !workflow.closedOn) {

				IStorage.drafts.get(workflow.data.identifier).then(function(result){
					$scope.document = result.data || result;
				});
			}
			}
		});

}

	//==================================================
	//
	//
	//==================================================
	$scope.isAssignedToMe = function(activity) {

		return activity && _.contains(activity.assignedTo||[], authentication.user().userID||-1);
	};

	//==================================================
	//
	//
	//==================================================
	$scope.isOpen = function(element) {
		return element && !element.closedOn;
	};

	//==================================================
	//
	//
	//==================================================
	$scope.isClose = function(element) {
		return element && element.closedOn;
	};

	//==============================
	//
	//==============================
	$scope.formatWID = function (workflowID) {
		return (workflowID||'').replace(/(?:.*)(.{3})(.{4})$/g, "W$1-$2");
	};

	load();
}];
});
