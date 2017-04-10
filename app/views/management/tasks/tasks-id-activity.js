define(['lodash', 'directives/management/register-facets', 'authentication', "directives/formats/views/form-loader", 'utilities/km-workflows', 'utilities/km-storage', 'utilities/km-utilities'], function(_) { 'use strict';

return [ "$scope", "$timeout", "$http", "$route", "$location", "IStorage", "IWorkflows", "authentication",
function ($scope, $timeout, $http, $route, $location, IStorage, IWorkflows, authentication)
{
	function load() {

		var workflowID   = $route.current.params.id;
		var activityName = $route.current.params.activity;
		IWorkflows.get(workflowID).then(function(workflow){
			var activity;

			if(workflow.closedOn)
				activity = _.last(workflow.activities)
			else
				activity = _.find(workflow.activities, function(activity){ return !activity.closedOn});

			if(!activity)
				$location.path('/management/requests/'+$route.current.params.id);

			if(workflow.data.identifier && !workflow.closedOn) {
					IStorage.drafts.get(workflow.data.identifier).then(function(result){
						$scope.document = result.data || result;
					});
			}
			else
				IStorage.documents.get(workflow.data.identifier).then(function(result){
					$scope.document = result.data || result;
				});

			$scope.workflow = workflow;
			$scope.activity = activity;
		});
	}

	//==================================================
	//
	//
	//==================================================
	$scope.updateActivity = function(resultData) {

		IWorkflows.updateActivity($scope.workflow._id, $scope.activity.name, resultData).then(function(){

			$location.url("/management/requests/"+$scope.workflow._id);

		}).catch(function(error) {
			alert(error);
		});
	};

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
		return !element.closedOn;
	};

	//==============================
	//
	//==============================
	$scope.formatWID = function (workflowID) {
		if(!workflowID)
			return '';
		return workflowID.replace(/(?:.*)(.{3})(.{4})$/g, "W$1-$2");
	};

	load();


	$scope.onlineReportingURL = function(schema){
		// console.log(schema);
		if(_.indexOf(['nationalReport','nationalAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity'],schema)>=0)
			return	 'online-reporting/';
		else
			return '';
	}
}];
});
