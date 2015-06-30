define(['app', 'angular', 'authentication', 'utilities/km-utilities', 'directives/news', 'directives/meetings'], function() { 'use strict';

	return ['$scope', '$rootScope', '$route', '$browser', '$location', '$window', 'user', 'authentication', function ($scope, $rootScope, $route, $browser, $location, $window, user, authentication) {

        $rootScope.homePage = true;
        $rootScope.userGovernment = user.government;
        $rootScope.navigation = [];
        $rootScope.navigationTree = [];

        $scope.email = $rootScope.lastLoginEmail || "";



		//========================================
		//
		//========================================
		$scope.goto = function (path) {

			$window.location.href = path;
		}

        //========================================
        //
        //========================================
        $scope.signIn = function () {

            var sEmail = $scope.email;
            var sPassword = $scope.password;

            authentication.signIn(sEmail, sPassword).then(function () { // Success

				$scope.isForbidden = false;
				$scope.password = "";
                authentication.getUser().then(function () { $location.path("/submit"); });

			}).catch(function (error) { // Error

				$scope.isUnavailable = error.errorCode != 403;
				$scope.isForbidden = error.errorCode == 403;
				$scope.password = "";
            });
        };
    }];
});
