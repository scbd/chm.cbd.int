define(['text!./my-tasks.html', 'app', 'underscore', 'authentication', 'utilities/km-workflows', 'utilities/km-utilities'], function(template, app, _) { 'use strict';

app.directive("myTasks", ['$http', "$timeout", "IWorkflows", "authentication", function ($http, $timeout, IWorkflows, authentication) {
	return {
		priority: 0,
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope : true,
		link: function ($scope)
		{
			var nextLoad  = null;
			var myUserID = authentication.user().userID;
			var query    = {
				$and : [
					{ "activities.assignedTo" : myUserID },
					{ closedOn : { $exists : false } }
				]
			};

			$scope.tasks = null;

			//==============================
			//
			//==============================
			function load() {

				IWorkflows.query(query).then(function(workflows){

					var tasks  = [];

					workflows.forEach(function(workflow) {

						workflow.activities.forEach(function(activity){

							if(isAssignedToMe(activity)) {
								tasks.push({ workflow : workflow, activity : activity});
							}
						});
					});

					$scope.tasks = tasks;

					nextLoad = $timeout(load, 15*1000);
				});
			}

			load();

			//==============================
			//
			//==============================
			function isAssignedToMe(activity) {

				return _.contains(activity.assignedTo||[], authentication.user().userID||-1);
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
		}
	};
}]);
});
