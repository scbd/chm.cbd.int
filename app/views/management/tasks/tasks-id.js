define(['underscore', 'directives/management/register-facets', 'authentication', "directives/formats/views/form-loader", 'utilities/km-workflows', 'utilities/km-storage', 'utilities/km-utilities'], function(_) { 'use strict';

return [ "$scope", "$timeout", "$http", "$route", "IStorage", "IWorkflows", "authentication", function ($scope, $timeout, $http, $route, IStorage, IWorkflows, authentication)
{
	//==================================================
	//
	//
	//==================================================
	function load() {

		IWorkflows.get($route.current.params.id).then(function(workflow){
			$scope.workflow = workflow;

			if(workflow.data.identifier && !workflow.closedOn) {

				IStorage.drafts.get(workflow.data.identifier).then(function(result){
					$scope.document = result.data || result;
				});
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
		return workflowID.replace(/(?:.*)(.{3})(.{4})$/g, "W$1-$2");
	};
	
	load();
}];
});
