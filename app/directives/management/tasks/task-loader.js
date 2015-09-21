define(['text!./task-loader.html', 'app', 'lodash', 'authentication', 'utilities/km-workflows', 'utilities/km-storage', 'utilities/km-utilities'], function(template, app, _) { 'use strict';

app.directive("taskLoader", [ "$scope", "$http", "$route", "IStorage", "IWorkflows", "authentication", function ($scope, $http, $route, IStorage, IWorkflows, authentication) {
	return {
		priority: 0,
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope : true,
		link : function($scope) {

			//==================================================
			//
			//
			//==================================================
			function load() {

				IWorkflows.get($route.current.params.id).then(function(workflow){
					$scope.workflow = workflow;

					if(!workflow.closedOn && workflow.data.identifier) {

						IStorage.drafts.get(workflow.data.identifier).then(function(result){
							$scope.document = result.data || result;
						});

						IStorage.documents.get(workflow.data.identifier, { info:"" }).then(function(result){
							$scope.documentInfo = result.data || result;
						});
					}
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

				return _.contains(activity.assignedTo||[], authentication.user().userID||-1);
			};

			//==================================================
			//
			//
			//==================================================
			$scope.isOpen = function(element) {
				return !element.closedOn;
			};

			//==================================================
			//
			//
			//==================================================
			$scope.hasOpenActivities = function(activities) {
				return !_.isEmpty(_.filter(activities, $scope.isOpen));
			};

			load();

		}
	};
}]);
});
