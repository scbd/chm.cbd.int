angular.module('kmApp').compileProvider // lazy
.directive("myDocuments", [function () {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/my-documents.partial.html',
		replace: true,
		transclude: false,
		scope: {
		},
		link: function($scope) {
			$scope.documents = null;
			$scope.load();
		},
		controller : ['$scope', "$location", "IStorage", "ngProgress", "schemaTypes", function ($scope, $location, storage, ngProgress, schemaTypes) 
		{
			//==============================
			//
			//==============================
			$scope.load = function() {

				ngProgress.start();

				$scope.__loading = true;
				$scope.__error   = null;

				var sQuery = undefined;

				if (schemaTypes)
					sQuery = "(type eq '" + schemaTypes.join("' or type eq '") + "')"

				$scope.documents = undefined;

				return storage.documents.query(sQuery, "my").then(function(result) {

					$scope.documents = result.data.Items
					$scope.__loading = false;

					return result.data.Items;

				}).catch(function(error) {

					$scope.__error   = error;
					$scope.__loading = false;

				}).finally(function(){
					ngProgress.complete();
				});
			}

			//==============================
			//
			//==============================
			$scope.edit = function(document)
			{
				$location.url("/management/edit/"+document.type+"?uid="+document.identifier);
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
						if (!isAllowed) {
							alert("You are not authorized to delete this document?");
							return;
						}

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
;