angular.module('kmApp').compileProvider // lazy
.directive('myDrafts', [function () {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/my-drafts.partial.html',
		replace: true,
		transclude: false,
		link : function($scope) {
			$scope.drafts  = null;
			$scope.load();
		},
		controller : ['$scope', "$location", "IStorage", "schemaTypes", "authentication", function ($scope, $location, storage, schemaTypes, authentication) 
		{
			//==============================
			//
			//==============================
			$scope.load = function() {

				$scope.__loading = true;
				$scope.__error   = null;

				var sQuery = undefined;

				if (schemaTypes)
					sQuery = "(type eq '" + schemaTypes.join("' or type eq '") + "')";

				$scope.drafts = undefined;

				return storage.drafts.query(sQuery).then(function(result) {

					$scope.drafts    = result.data.Items;
					$scope.__loading = false;

					return result.data.Items;

				}).catch(function(error) {

					$scope.__error   = error;
					$scope.__loading = false;

				});
			}

			//==============================
			//
			//==============================
			$scope.edit = function(draft)
			{
				$location.url("/management/edit/"+draft.type+"?uid=" +draft.identifier);
			};

			//==============================
			//
			//==============================
			$scope.erase = function(draft)
			{
				storage.drafts.security.canDelete(draft.identifier, draft.type).then(
					function(isAllowed) {
						if (!isAllowed) {
							alert("You are not authorized to delete this draft");
							return;
						}

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

			//==============================
			//
			//==============================
			$scope.unlock = function(draft)
			{
				if(draft.workingDocumentLock && authentication.user() && authentication.user().roles.indexOf("administrator"))
				{
					if (!confirm("WARNING: Unlocking draft can break workflows. \n Unlock the draft?"))
						return;

					storage.drafts.locks.delete(draft.identifier, draft.workingDocumentLock.lockID).then(function(success) {
						$scope.load();

					}).catch(function(error) {

						alert("Error: " + error);
					});
				};				
			};
		}]
	}
}]);
