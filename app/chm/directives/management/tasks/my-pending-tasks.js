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

			$scope.workflows = IWorkflows.query(query);

			$scope.isOpen = function(element) {
				return !element.closedOn;
			}
		}]
	}
}])
;