define(['app', 'angular', 'underscore', 'text!./case-study-hwb.html', 'utilities/km-storage'], function(app, angular, _, template){

app.directive('viewCaseStudyHwb', ['IStorage', function (storage) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			allowDrafts : "@",
			target : "@linkTarget"
		},
		link: function ($scope) {

			//====================
			//
			//====================
			$scope.$watch("document.contact", function (ref) {

				$scope.contact = !ref ? undefined : loadReference(ref.identifier);

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
				var options  = { cache: true };

				if(infoOnly)
					options.info = "";

				if($scope.allowDrafts) {

					qPromise = storage.drafts.get(identifier, options).then(function(success) {

						return success.data;

					}).catch(function() {

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

		}
	};
}]);
});
