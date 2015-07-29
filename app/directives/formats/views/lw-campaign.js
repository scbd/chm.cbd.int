define(['app', 'angular', 'lodash', 'text!./lw-campaign.html', 'utilities/km-storage'], function(app, angular, _, template){

app.directive('viewLwCampaign', ["IStorage", function (storage) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget",
			allowDrafts : "@"
		},
		link : function ($scope)
		{
			$scope.contacts      = undefined;
			$scope.organizations = undefined;

			//====================
			//
			//====================
			// $scope.$watch("document.contacts", function()
			// {
			// 	$scope.contacts = angular.fromJson(angular.toJson($scope.document.contacts));
			//
			// 	if($scope.contacts)
			// 		$scope.loadReferences($scope.contacts);
			// });


			//====================
			//
			//====================
			// $scope.$watch("document.linkedOrganizations", function()
			// {
			// 	$scope.linkedOrganizations = angular.fromJson(angular.toJson($scope.document.linkedOrganizations));
			//
			// 	if($scope.linkedOrganizations)
			// 		$scope.loadReferences($scope.linkedOrganizations);
			// });

			// ====================
			//
			// ====================
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
			};
		}
	};
}]);
});
