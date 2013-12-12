angular.module('kmApp').compileProvider // lazy
.directive("myTasks", ['authHttp', function ($http) {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/tasks/my-tasks.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		controller: [ "$scope", "IWorkflows", "authentication", function ($scope, IWorkflows, authentication) 
		{
			var myUserID = authentication.user().userID;
			var query    = { 
				$and : [
					{ "activities.assignedTo" : myUserID }, 
					{ closedOn : { $exists : false } } 
				] 
			};

			$scope.workflows = IWorkflows.query(query);

			//==============================
			//
			//==============================
			$scope.edit = function (workflow) {
				$location.url("/management/edit/" + workflow.info.type + "?uid=" + workflow.info.identifier);
			};
		}]
	}
}])

;