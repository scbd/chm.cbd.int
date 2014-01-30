//==================================================
//
// My Completed Tasks
//
//==================================================
angular.module('kmApp').compileProvider // lazy
.directive("myCompletedTasks", [function () {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/tasks/my-completed-tasks.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		controller: [ "$scope", "IWorkflows", "authentication", function ($scope, IWorkflows, authentication) 
		{
			var myUserID = authentication.user().userID;
			var query    = {  
				$and : [
					{ "createdBy" : myUserID }, 
					{ closedOn : { $exists : true } } 
				] 
			};

			$scope.workflows = IWorkflows.query(query);
		}]
	}
}])
;