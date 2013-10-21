angular.module('kmApp').compileProvider // lazy
.directive('viewCaseStudy', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-case-study.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "="
		},
		controller: ['$scope', 'IStorage', function ($scope, storage) {



			//====================
			//
			//====================
			$scope.$watch("document.contact", function (_new) {
				if ($scope.document) {
					$scope.contact = angular.fromJson(angular.toJson($scope.document.contact))

					if ($scope.contact)
						$scope.loadReference($scope.contact);
				}
			});

			//====================
			//
			//====================
			$scope.loadReference = function (ref) {

				storage.documents.get(ref.identifier, { cache: true })
					.success(function (data) {
						ref.document = data;
					})
					.error(function (error, code) {
						if (code == 404 && $scope.allowDrafts == "true") {

							storage.drafts.get(ref.identifier, { cache: true })
								.success(function (data) {
									ref.document = data;
								})
								.error(function (draftError, draftCode) {
									ref.document = undefined;
									ref.error = error;
									ref.errorCode = code;
								});
						}

						ref.document = undefined;
						ref.error = error;
						ref.errorCode = code;

					});
			}

			//====================
			//
			//====================
			$scope.$watch("document.organizations", function (_new) {
				if ($scope.document) {
					$scope.organizations = angular.fromJson(angular.toJson($scope.document.organizations))

					if ($scope.organizations)
						$scope.loadReferences($scope.organizations);
				}
			});
			//====================
			//
			//====================
			$scope.$watch("document.resources", function (_new) {
				if ($scope.document) {
					$scope.resources = angular.fromJson(angular.toJson($scope.document.resources))

					if ($scope.resources)
						$scope.loadReferences($scope.resources);
				}
			});

			//====================
			//
			//====================
			$scope.loadReferences = function (targets, infoOnly) {

				angular.forEach(targets, function (ref) {

					var oOptions = { cache: true };

					if (infoOnly)
						oOptions.info = true;

					storage.documents.get(ref.identifier, oOptions)
						.success(function (data) {
							ref.document = data;
						})
						.error(function (error, code) {
							if (code == 404 && $scope.allowDrafts == "true") {

								storage.drafts.get(ref.identifier, oOptions)
									.success(function (data) {
										ref.document = data;
									})
									.error(function (draftError, draftCode) {
										ref.document = undefined;
										ref.error = error;
										ref.errorCode = code;
									});
							}

							ref.document = undefined;
							ref.error = error;
							ref.errorCode = code;

						});
				});
			}

			//====================
			//
			//====================
			$scope.canShowIcon = function () {
				return $scope.document!=undefined && !jQuery.isEmptyObject($scope.document.icons);
			};

		}]
	}
}]);
