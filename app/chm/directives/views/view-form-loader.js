﻿angular.module('kmApp').compileProvider // lazy
.directive('cbdViewFormLoader', [function () {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/views/view-form-loader.partial.html',
		replace: true,
		transclude: false,
		scope: {
			linkTarget: "@",
			document: "=",
			locale  : "="
		},
		link: function($scope) {

			$scope.internalDocument     = undefined;
			$scope.internalDocumentInfo = undefined;

			$scope.$watch("document", function(_new) { $scope.internalDocument = _new; });

			$scope.init();
		},
		controller: ['$scope', "URI", 'IStorage', "authentication", "localization", "$q", "$location", "$window", function ($scope, URI, storage, authentication, localization, $q, $location, $window) {
			//==================================
			//
			//==================================
			$scope.init = function () {
				if ($scope.internalDocument)
					return;

				if ($scope.document || $scope.schema)
					return;

				var oQsParams = URI().search(true);

				if (oQsParams.documentID || oQsParams.documentid)
					$scope.load(oQsParams.documentID || oQsParams.documentid);
				else
					$scope.error = "documentID not specified";
			}

			//==================================
			//
			//==================================
			$scope.getLocale = function () {
				return $scope.locale || localization.locale();
			}

			//==================================
			//
			//==================================
			$scope.load = function (identifier) {

				$scope.error = undefined;

				var qDocument     = storage.documents.get(identifier)                .then(function(result) { return result.data || result });
				var qDocumentInfo = storage.documents.get(identifier, { info: true }).then(function(result) { return result.data || result });

				$q.all([qDocument, qDocumentInfo]).then(function(results) {

					$scope.internalDocument = results[0];
					$scope.internalDocumentInfo = results[1];
				}).then(null, function(error) {
					$scope.error = error.Message || error || "Http Error: " + errorCode;
				})
			};

			//==================================
			//
			//==================================
			$scope.user = function() {
				return authentication.user();
			};

			//==================================
			//
			//==================================
			$scope.edit = function() {
				if (!$scope.canEdit())
					throw "Cannot edit form";

				var schema     = $scope.internalDocumentInfo.type;
				var identifier = $scope.internalDocumentInfo.identifier;

				$location.url(new URI("/management/edit/" + schema).search({ uid: identifier, returnUrl : $location.url() }).toString());
			}

			//==================================
			//
			//==================================
			$scope.delete = function() {

				if (!$scope.canDelete())
					throw "Cannot delete";

				var identifier    = $scope.internalDocumentInfo.identifier;
				var schema        = $scope.internalDocumentInfo.type;
				var qDocumentInfo = storage.documents.get(identifier, { info: true }).then(function(result) { return result.data || result });
				var qCanDelete    = storage.documents.security.canDelete(identifier, schema);

				return $q.all([qDocumentInfo, qCanDelete]).then(function(results) {

					var documentInfo = results[0];
					var canDelete    = results[1];

					if (documentInfo.workingDocumentCreatedOn) {
						alert("There is a pending drafts. Cannot delete.")
						return;
					}

					if (!canDelete) {
						alert("You don't have sufficient privilege to delete this record.");
						return;
					}

					if (confirm("Delete the document?")) {
						return storage.documents.delete(identifier).then(function(success) {
							
							$location.url("/database");
						});
					}
				}).then(null, function(error){
					alert("ERROR:"+error);
					throw error;
				});
			};


			//==================================
			//
			//==================================
			$scope.canEdit = function() {
				if (!$scope.user().isAuthenticated)
					return false;

				if (!$scope.internalDocumentInfo)
					return false;

				if ($scope.internalCanEdit === undefined) {

					$scope.internalCanEdit = null; // avoid recall => null !== undefined

					var hasDraft   = !!$scope.internalDocumentInfo.workingDocumentCreatedOn;
					var identifier =   $scope.internalDocumentInfo.identifier;
					var schema     =   $scope.internalDocumentInfo.type;

					var qCanEdit = hasDraft
							     ? storage.drafts.security.canUpdate(identifier, schema)  // has draft
								 : storage.drafts.security.canCreate(identifier, schema); // has no draft

					qCanEdit.then(function(isAllowed) {
						
						$scope.internalCanEdit = isAllowed || false;

					}).then(null, function(error) {

						$scope.internalCanEdit = false;
					});
				}

				return $scope.internalCanEdit===true;
			};

			//==================================
			//
			//==================================
			$scope.canDelete = function() {
				
				$scope.deleteTooltip = undefined;

				if (!$scope.user().isAuthenticated)
					return false;

				if (!$scope.internalDocumentInfo)
					return false;

				if($scope.internalDocumentInfo.workingDocumentCreatedOn) {
					$scope.deleteTooltip = "Cannot delete record with pending drafts";
					return false;
				}

				if ($scope.internalCanDelete === undefined) {

					$scope.internalCanDelete = null; // avoid recall => null !== undefined

					var identifier =   $scope.internalDocumentInfo.identifier;
					var schema     =   $scope.internalDocumentInfo.type;

					var qCanDelete = storage.documents.security.canDelete(identifier, schema);

					qCanDelete.then(function(isAllowed) {
						
						$scope.internalCanDelete = isAllowed || false;

					}).then(null, function(error) {

						$scope.internalCanDelete = false;
					});
				}

				return $scope.internalCanDelete===true;
			};
		}]
	}
}]);