angular.module('kmCBD')
//============================================================
//
// View Contact
//
//============================================================
.directive('cbdViewOrganization', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-organization.partial.html',
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
		},
		controller : ['$scope', "IStorage", function ($scope, storage) 
		{
			//====================
			//
			//====================
			$scope.$watch("document.contacts", function(_new)
			{
				$scope.contacts = angular.fromJson(angular.toJson($scope.document.contacts))

				if($scope.contacts)
					$scope.loadReferences($scope.contacts);
			});


			//====================
			//
			//====================
			$scope.$watch("document.linkedOrganizations", function(_new)
			{
				$scope.linkedOrganizations = angular.fromJson(angular.toJson($scope.document.linkedOrganizations))

				if($scope.linkedOrganizations)
					$scope.loadReferences($scope.linkedOrganizations);
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
}])
.directive('cbdViewOrganizationReference', [function () {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/views/view-organization-reference.partial.html',
		replace: true,
		transclude: false,
		scope: {
			document: "=ngModel",
			locale: "=",
			target: "@linkTarget"
		},
		controller: ['$scope', function ($scope) {
		}]
	}
}]);

