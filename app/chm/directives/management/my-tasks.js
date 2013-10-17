angular.module('kmApp').compileProvider // lazy
.directive("myTasks", ['authHttp', function ($http) {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/my-tasks.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		link : function($scope) {
			$scope.workflows = null;
			$scope.load();
		},
		controller: [ "$scope", "authHttp", "IStorage", function ($scope, $http, storage) 
		{
			//==============================
			//
			//==============================
			$scope.load = function() {
				$scope.__loading = true;
				$scope.__error   = null;

				$http.get('/api/v2013/workflows-task/mytasks')
					.success(function(data) {
						$scope.workflows = data.workflows;
						$scope.__loading = false;
					})
					.error(function(error){
						$scope.__error   = error;
						$scope.__loading = false;
					});
			}
			//==============================
			//
			//==============================
			$scope.edit = function (workflow) {
				$location.url("/management/edit/" + workflow.info.type + "?uid=" + workflow.info.identifier);
			};
		}]
	}
}])

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
		templateUrl: '/app/chm/directives/management/my-tasks.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		link : function($scope) {
			$scope.workflows = {}; // Model
			$scope.load();
		},
		controller: [ "$scope", "authHttp", "IStorage", function ($scope, $http, storage) 
		{
			//==============================
			//
			//==============================
			$scope.load = function() {
				$scope.__loading = true;
				$scope.__error   = null;

				$http.get('/api/v2013/workflows-mocks/mypendingtasks')
					.success(function(data) {
						$scope.workflows = data.workflows;
						$scope.__loading = false;
					})
					.error(function(error){
						$scope.__error   = error;
						$scope.__loading = false;
					});
			}
		}]
	}
}])

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
		templateUrl: '/app/chm/directives/management/my-tasks.partial.html',
		replace: true,
		transclude: false,
		scope : true,
		link : function($scope) {
			$scope.workflows = {}; // Model
			$scope.load();
		},
		controller: [ "$scope", "authHttp", "IStorage", function ($scope, $http, storage) 
		{
			//==============================
			//
			//==============================
			$scope.load = function() {
				$scope.__loading = true;
				$scope.__error   = null;

				$http.get('/api/v2013/workflows-mocks/mycompletedtasks')
					.success(function(data) {
						$scope.workflows = data.workflows;
						$scope.__loading = false;
					})
					.error(function(error){
						$scope.__error   = error;
						$scope.__loading = false;
					});
			}
		}]
	}
}])
;