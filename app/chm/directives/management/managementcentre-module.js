angular.module('kmApp').compileProvider // lazy
.directive('myDrafts', [function () {
		return {
			priority: 0,
			restrict: 'EAC',
			templateUrl: '/app/partials/clearinghouse/management/my-drafts.html',
			replace: true,
			transclude: false,
			scope: {
				cmsParamsFn : "&cmsParams"
			},
			link : function($scope) {
				$scope.drafts  = null;
				$scope.schemas = ($scope.cmsParamsFn()||{}).schemas;
				$scope.load();
			},
			controller : ['$scope', "IStorage", function ($scope, storage) 
			{
				//==============================
				//
				//==============================
				$scope.load = function() {
					$scope.__loading = true;
					$scope.__error   = null;

					var sQuery = undefined;

					if ($scope.schemas)
						sQuery = "(type eq '" + $scope.schemas.join("' or type eq '") + "')";

					storage.drafts.query(sQuery).then(
						function(result) {
							$scope.drafts = result.data.Items 
							$scope.__loading = false;
						},
						function(error) {
							$scope.__error   = error;
							$scope.__loading = false;
						});
				}

				//==============================
				//
				//==============================
				$scope.edit = function(draft)
				{
					window.location = "/managementcentre/edit/"+draft.type+".shtml?uid=" +draft.identifier;
				};

				//==============================
				//
				//==============================
				$scope.erase = function(draft)
				{
					storage.drafts.security.canDelete(draft.identifier, draft.type).then(
						function(isAllowed) {
							if (!isAllowed)
								if (alert("You are not authorised to delete this draft?"))
									return;

							if (!confirm("Delete the draft?"))
								return;

							storage.drafts.delete(draft.identifier).then(
								function(success) {
									$scope.drafts.splice($scope.drafts.indexOf(draft), 1);
								},
								function(error) {
									alert("Error: " + error);
								});
						});				
				};
			}]
		}
	}]);

	//==================================================
	//
	// My Documents 
	//
	//==================================================
angular.module('kmApp').compileProvider // lazy
.directive("myDocuments", [function () {
		return {
			priority: 0,
			restrict: 'EAC',
			templateUrl: '/app/partials/clearinghouse/management/my-documents.html',
			replace: true,
			transclude: false,
			scope: {
				cmsParamsFn : "&cmsParams"
			},
			link: function($scope) {
				$scope.documents = null;
				$scope.schemas   = ($scope.cmsParamsFn()||{}).schemas;
				$scope.load();
			},
			controller : ['$scope', "IStorage", function ($scope, storage) 
			{
				//==============================
				//
				//==============================
				$scope.load = function() {
					$scope.__loading = true;
					$scope.__error   = null;

					var sQuery = undefined;

					if ($scope.schemas)
						sQuery = "(type eq '" + $scope.schemas.join("' or type eq '") + "')"

					storage.documents.query(sQuery, "my").then(
						function(result) {
							$scope.documents = result.data.Items;
							$scope.__loading = false;
						},
						function(error) {
							$scope.__error   = error;
							$scope.__loading = false;
						});
				}

				//==============================
				//
				//==============================
				$scope.edit = function(document)
				{
					window.location = "/managementcentre/edit/"+document.type+".shtml?uid="+document.identifier;
				};

				//==============================
				//
				//==============================
				$scope.erase = function(document)
				{
					if(document.workingDocumentUpdatedOn)
					{
						alert("There is a pending documents. Cannot delete.")
						return;
					}

					storage.documents.security.canDelete(document.identifier, document.type).then(
						function(isAllowed) {
							if (!isAllowed)
								if (alert("You are not authorised to delete this document?"))
									return;

							if (!confirm("Delete the document?"))
								return;

							storage.documents.delete(document.identifier).then(
								function(success) {
									$scope.documents.splice($scope.documents.indexOf(document), 1);
								},
								function(error) {
									alert("Error: " + error);
								});
						});				
				};
			}]
		}
	}]);

	//==================================================
	//
	// My Tasks
	//
	//==================================================
angular.module('kmApp').compileProvider // lazy
.directive("myTasks", ['authHttp', function ($http) {
		return {
			priority: 0,
			restrict: 'EAC',
			templateUrl: '/app/partials/clearinghouse/management/my-tasks.html',
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
					window.location = "/managementcentre/edit/" + workflow.info.type + ".shtml?uid=" + workflow.info.identifier;
				};
			}]
		}
	}])

	//==================================================
	//
	// My Pending Tasks
	//
	//==================================================
	.directive("myPendingTasks", [function () {
		return {
			priority: 0,
			restrict: 'EAC',
			templateUrl: '/app/partials/clearinghouse/management/my-tasks.html',
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
	.directive("myCompletedTasks", [function () {
		return {
			priority: 0,
			restrict: 'EAC',
			templateUrl: '/app/partials/clearinghouse/management/my-tasks.html',
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