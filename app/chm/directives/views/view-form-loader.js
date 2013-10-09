angular.module('kmApp').compileProvider // lazy
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
		controller: ['$scope', "URI", 'IStorage', "authentication", "localization", "$q", "$location", function ($scope, URI, storage, authentication, localization, $q, $location) {
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

				storage.documents.get(identifier)
					.success(function (doc, status, headersFn) {
						$scope.internalDocument = doc;
					})
					.error(function(error, errorCode) {
						$scope.error = error.Message || error || "Http Error: " + errorCode;
					});
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

				$location.url(new URI("/management/edit/" + schema).search({ uid: identifier, returnUrl: $location.url() }).toString());
			}

			//==================================
			//
			//==================================
			$scope.canEdit = function() {
				if (!$scope.user().isAuthenticated)
					return false;

				if ($scope.internalCanEdit === undefined && !$scope.internalDocumentInfo && $scope.internalDocument) {

					var onErrorFn = function(error) {
						$scope.internalCanEdit = false;
					};

					$scope.internalDocumentInfo = storage.documents.get($scope.internalDocument.header.identifier, { info: true }).then(
						function(result) {
							$scope.internalDocumentInfo = result.data;

							var hasDraft       = !!$scope.internalDocumentInfo.workingDocumentCreatedOn;
							var identifier     = $scope.internalDocumentInfo.identifier;
							var schema         = $scope.internalDocumentInfo.type;

							var qCanEditPromise = hasDraft
												? storage.drafts.security.canUpdate(identifier, schema)  //yes
												: storage.drafts.security.canCreate(identifier, schema); //no

							qCanEditPromise.then(
								function(isAllowed) {
									$scope.internalCanEdit = isAllowed;
								},
								onErrorFn);
						},
						onErrorFn);
				}

				return $scope.internalCanEdit==true;
			};
		}]
	}
}]);