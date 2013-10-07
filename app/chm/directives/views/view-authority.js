angular.module('kmCBD')
//============================================================
//
// View Contact
//
//============================================================
.directive('cbdViewAuthority', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-authority.partial.html',
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
			$scope.contacts = undefined;
		},
		controller : ['$scope', "IStorage", function ($scope, storage) 
		{
			//====================
			//
			//====================
			$scope.$watch("document.contacts", function(_new)
			{
				$scope.contacts = angular.fromJson(angular.toJson(_new||[]))

				if($scope.contacts)
					$scope.loadReferences($scope.contacts);
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

.directive('cbdViewAuthorityReference', [function() {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/views/view-authority-reference.partial.html',
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
