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
		controller: [ "$scope", "$timeout", "IWorkflows", "authentication", function ($scope, $timeout, IWorkflows, authentication) 
		{
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

					$timeout(load, 15*1000);
				})
			}

			load();

			//==============================
			//
			//==============================
			$scope.isOpen = function(element) {
				return element && !element.closedOn;
			}
		}]
	}
}])
;