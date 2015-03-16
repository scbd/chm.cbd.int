﻿/* jshint quotmark: false */
angular.module('kmApp').compileProvider // lazy
.directive("userInfo", [function () {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/user-info.partial.html',
		replace: true,
		transclude: false,
		scope: {},
		link: {},
		controller: ['$rootScope', '$scope', "$routeParams", '$q', 'authHttp', "navigation", "underscore", "$location", "URI", "authentication", "IStorage", "$filter",
		function ($rootScope, $scope, $routeParams, $q, $http, navigation, _, $location, URI, authentication, storage, $filter) {

			navigation.securize(["Administrator", "ChmAdministrator", "ChmNationalFocalPoint", "ChmNationalAuthorizedUser"]);

			$scope.user = authentication.user();
			
			//==============================
			//
			//==============================
			$scope.isAdmin = function(){
				for(var i=0; i < authentication.user().roles.length; i++)
				{
					if(authentication.user().roles[i] == 'Administrator' || authentication.user().roles[i] == 'ChmAdministrator')
					{
						return true;
					}
				}
				return false;
			}

		}]
	};
}]);