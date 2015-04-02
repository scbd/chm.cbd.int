/* jshint quotmark: false */
angular.module('kmApp') // lazy
.directive("userInfo", [function () {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/user-info.partial.html',
		replace: true,
		transclude: false,
		scope: {},
		link: {},
		controller: ['$rootScope', '$scope', "$routeParams", '$q', '$http', "navigation", "underscore", "$location", "URI", "authentication", "IStorage", "$filter","$window",
		function ($rootScope, $scope, $routeParams, $q, $http, navigation, _, $location, URI, authentication, storage, $filter,$window) {

			navigation.securize();

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

			$scope.actionPassword = function () {
				var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
				$window.location.href = 'https://accounts.cbd.int/password?redirect_uri='+redirect_uri;
			};

			//============================================================
			//
			//
			//============================================================
			$scope.actionProfile = function () {
				var redirect_uri = $window.encodeURIComponent($location.protocol()+'://'+$location.host()+':'+$location.port()+'/');
				$window.location.href = 'https://accounts.cbd.int/profile?redirect_uri='+redirect_uri;
			};

		}]
	};
}]);
