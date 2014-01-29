angular.module('kmApp').controllerProvider.register("TaskRequestController", [ "$scope", "$timeout", "authHttp", "$route", "IStorage", "IWorkflows", "authentication", "underscore", function ($scope, $timeout, $http, $route, IStorage, IWorkflows, authentication, _) 
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
	
	load();

	//==================================================
	//
	//
	//==================================================
	$scope.updateActivity = function(activityName, resultData) {

		IWorkflows.updateActivity($scope.workflow._id, activityName, resultData).then(function(){
			load();
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
	}

	//==================================================
	//
	//
	//==================================================
	$scope.hasOpenActivities = function(activities) {
		return !_.isEmpty(_.filter(activities, $scope.isOpen));
	}
	
}]);
