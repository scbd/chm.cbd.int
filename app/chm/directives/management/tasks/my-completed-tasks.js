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
		controller: [ "$scope", "$timeout", "IWorkflows", "authentication", function ($scope, $timeout, IWorkflows, authentication) 
		{
			var nextLoad = null;
			var myUserID = authentication.user().userID;
			var query    = {  
				$and : [
					{ "createdBy" : myUserID }, 
					{ closedOn : { $exists : true } } 
				] 
			};

			//==============================
			//
			//==============================
			function load() {
				
				IWorkflows.query(query).then(function(workflows){

					$scope.workflows = workflows;

					nextLoad = $timeout(load, 15*1000);
				});
			}

			load();

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