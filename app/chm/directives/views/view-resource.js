angular.module('kmApp')
//============================================================
//
// View Contact
//
//============================================================
.directive('cbdViewResource', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-resource.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget"
		},
		controller : ['$scope', "IStorage", function ($scope, storage) 
		{
			//====================
			//
			//====================
			$scope.$watch("document.organizations", function(_new)
			{
				$scope.organizations = angular.fromJson(angular.toJson(_new||[]))

				if($scope.organizations)
					$scope.loadReferences($scope.organizations);
			});

			//====================
			//
			//====================
			$scope.loadReferences = function(targets) {

				angular.forEach(targets, function(ref){

					storage.documents.get(ref.identifier, { cache : true})
						.success(function(data){
							ref.document = data;
						})
						.error(function(error, code){
							if (code == 404 && $scope.allowDrafts == "true") {

								storage.drafts.get(ref.identifier, { cache : true})
									.success(function(data){
										ref.document = data;
									})
									.error(function(draftError, draftCode){
										ref.document  = undefined;
										ref.error     = error;
										ref.errorCode = code;
									});
							}

							ref.document  = undefined;
							ref.error     = error;
							ref.errorCode = code;

						});
				});
			}
		}]
	}
}]);
