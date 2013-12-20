//==================================================
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
		controller: [ "$scope", "IWorkflows", "authentication", function ($scope, IWorkflows, authentication) 
		{
			var myUserID = authentication.user().userID;
			var query    = { 
				$and : [
					{ "createdBy" : myUserID } , 
					{ closedOn : { $exists : false } } 
				] 
			};

			$scope.workflows = IWorkflows.query(query).then(function(workflows){

				workflows.forEach(function(workflow) {

					if(!workflow.activities || !workflow.activities.length)
						workflow.activities = [null];
				});

				return workflows;
			});

			$scope.isOpen = function(element) {
				return element && !element.closedOn;
			}
		}]
	}
}])
;