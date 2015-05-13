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
        $scope.signIn = function () {

            var sEmail = $scope.email;
            var sPassword = $scope.password;

            authentication.signIn(sEmail, sPassword).then(function () { // Success
                $scope.password = "";
                authentication.getUser().then(function () { $location.path("/submit"); });
            },
            function (error) { // Error
                $scope.password = "";
                $scope.isLoading = false;
                $scope.isForbidden = error.errorCode == 403;
                $scope.isNoService = error.errorCode == 404;
                $scope.isError = error.errorCode != 403 && error.errorCode != 404;
                $scope.error = error.error;
                throw error;
            });
        };
    }];
});
