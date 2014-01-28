angular.module('kmApp').compileProvider // lazy
.directive("myTasks", ['authHttp', function ($http) {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/tasks/my-tasks.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		controller: [ "$scope", "$timeout", "IWorkflows", "authentication", "underscore", function ($scope, $timeout, IWorkflows, authentication, _) 
		{
			var myUserID = authentication.user().userID;
			var query    = { 
				$and : [
					{ "activities.assignedTo" : myUserID }, 
					{ closedOn : { $exists : false } } 
				] 
			};

			//==============================
			//
			//==============================
			function load() {
				
				IWorkflows.query(query).then(function(workflows){

					$scope.workflows = workflows;

					$timeout(load, 15*1000);
				});
			}

			load();
			
			//==============================
			//
			//==============================
			$scope.isOpen = function(element) {
				return !element.closedOn;
			}
			
			//==============================
			//
			//==============================
			$scope.isAssignedToMe = function(activity) {

				return _.contains(activity.assignedTo||[], authentication.user().userID||-1);
			};
		
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