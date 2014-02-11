﻿//==================================================
//
// My Pending Tasks
//
//==================================================
angular.module('kmApp').compileProvider // lazy
.directive("myPendingTasks", [function () {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/tasks/my-pending-tasks.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		controller: [ "$scope", "$timeout", "IWorkflows", "authentication", function ($scope, $timeout, IWorkflows, authentication) 
		{
			var nextLoad = null;
			var myUserID = authentication.user().userID;
			var query    = { 
				$and : [
					{ "createdBy" : myUserID } , 
					{ closedOn : { $exists : false } } 
				] 
			};

			//==============================
			//
			//==============================
			function load() {
				
				IWorkflows.query(query).then(function(workflows){

					workflows.forEach(function(workflow) { //tweaks
						if(!workflow.activities || !workflow.activities.length)
							workflow.activities = [null];
					});

					$scope.workflows = workflows;

					nextLoad = $timeout(load, 15*1000);
				})
			}

			load();

			//==============================
			//
			//==============================
			$scope.isOpen = function(element) {
				return element && !element.closedOn;
			}

			//==============================
			//
			//==============================
			$scope.formatWID = function (workflowID) {
				return workflowID.replace(/(?:.*)(.{3})(.{4})$/g, "W$1-$2");
			};

			//============================================================
			//
			// ROUTE CHANGE CLEAN-UP
			//
			//============================================================
			var unreg_RouteChangeStart = $scope.$on('$routeChangeStart', function() {

				unreg_RouteChangeStart();

				if(nextLoad)
					$timeout.cancel(nextLoad);
			});
		}]
	}
}])
;