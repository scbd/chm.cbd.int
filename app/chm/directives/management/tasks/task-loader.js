angular.module('kmApp').compileProvider // lazy
.directive("taskLoader", [function () {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/tasks/task-loader.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		link : function($scope) {},
		controller: [ "$scope", "authHttp", "$route", "IWorkflows", "authentication", function ($scope, $http, $route, IWorkflows, authentication) 
		{
			load();
			//==================================================
			//
			//
			//==================================================
			function load() {

				IWorkflows.get($route.current.params.id).then(function(workflow){
					$scope.workflow = workflow;
				});
			}

			//==================================================
			//
			//
			//==================================================
			$scope.updateActivity = function(activityName, resultData) {

				IWorkflows.updateActivity($scope.workflow._id, activityName, resultData).then(load);
			};

			//==================================================
			//
			//
			//==================================================
			$scope.isAssignedToMe = function(activity) {

				return activity.assignedTo.indexOf(authentication.user().userID)>=0;
			};
		}]
	}
}])
