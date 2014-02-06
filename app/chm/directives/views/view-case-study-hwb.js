angular.module('kmApp').compileProvider // lazy
.directive('viewCaseStudy', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-case-study-hwb.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			allowDrafts : "@",
			target : "@linkTarget"
		},
		controller: ['$scope', 'IStorage', "underscore", function ($scope, storage, _) {

			//====================
			//
			//====================
			$scope.$watch("document.contact", function (ref) {

				$scope.contact = !ref ? undefined : loadReference(ref.identifier)

			});

			//====================
			//
			//====================
			$scope.$watch("document.organizations", function (refs) {

				$scope.organizations = !refs ? undefined : _.map(refs, function(o) {
					return loadReference(o.identifier);
				});

			});

			//====================
			//
			//====================
			$scope.$watch("document.resources", function (refs) {
				
				$scope.resources = !refs ? undefined : _.map(refs, function(o) {
					return loadReference(o.identifier, true);
				});

			});

			//====================
			//
			//====================
			function loadReference(identifier, infoOnly) {

				var qPromise = null;
				var options  = { cache: true }

				if(infoOnly)
					options.info = "";

				if($scope.allowDrafts) {

					qPromise = storage.drafts.get(identifier, options).then(function(success) {

						return success.data;

					}).catch(function(error) {
						
						return storage.documents.get(identifier, options).then(function(success) {
							return success.data;
						});

					});
				}
				else {

					qPromise = storage.documents.get(identifier, options).then(function(success) {
						return success.data;
					});

				}

				return qPromise.catch(function(error) {
					return {
						identifier : identifier,
						error : error,
						errorCode : error.status
					};
				});
			}

		}]
	}
}]);
