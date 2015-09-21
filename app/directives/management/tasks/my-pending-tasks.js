define(['text!./my-completed-tasks.html', 'app', 'authentication', 'utilities/km-workflows', 'utilities/km-utilities'], function(template, app) { 'use strict';

app.directive("myPendingTasks", ["$timeout", "IWorkflows", "authentication", function ($timeout, IWorkflows, authentication)  {
	return {
		priority: 0,
		restrict: 'E',
		template : template,
		replace: true,
		transclude: false,
		scope : true,
		link : function ($scope)
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
				});
			}

			load();

			//==============================
			//
			//==============================
			$scope.isOpen = function(element) {
				return element && !element.closedOn;
			};

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
		}
	};
}]);
});
