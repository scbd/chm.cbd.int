define(['text!./user-info.html', 'app', 'authentication', 'services/navigation'], function(template, app) { 'use strict';

app.directive("userInfo", ['navigation', 'authentication', '$location', '$window','realmConfig', function (navigation, authentication, $location, $window,realmConfig) {
	return {
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope: {},
		link: function ($scope) {

			navigation.securize();

			authentication.getUser().then(function(u){
				$scope.user = u;
			});

			//==============================
			//
			//==============================
			$scope.isAdmin = function(){

				if(!$scope.user || !$scope.user.roles)
					return false;

				if(realmConfig.isAdministrator(authentication.getUser()) || realmConfig.isChmAdministrator($scope.user))
				{
					return true;
				}
		
				return false;
			};

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

		}
	};
}]);
});
