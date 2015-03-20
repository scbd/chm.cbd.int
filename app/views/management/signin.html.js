/* global escape */

define(['app', 'angular', 'authentication', 'directives/users/signin.html'], function() { 'use strict';

	return ['$scope', '$rootScope', '$route', '$browser', '$location', '$window', 'user', 'authentication', function ($scope, $rootScope, $route, $browser, $location, $window, user, authentication) {

        $rootScope.homePage = true;
        $rootScope.userGovernment = user.government;
        $rootScope.navigation = [];
        $rootScope.navigationTree = [];

        $scope.email = $browser.cookies().lastLoginEmail || "";
        $scope.rememberMe = !!$browser.cookies().lastLoginEmail;

        //========================================
        //
        //========================================
        $scope.signIn = function () {

            var sEmail = $scope.email;
            var sPassword = $scope.password;

            authentication.signIn(sEmail, sPassword).then(function () { // Success
                $scope.password = "";
                $scope.setCookie("lastLoginEmail", $scope.rememberMe ? sEmail : undefined, 365, '/');
                authentication.getUser().then(function () { $location.path("/management"); });
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

        //========================================
        //
        //========================================
        $scope.setCookie = function (name, value, days, path) {
            var sCookieString = escape(name) + "=";

            if (value) sCookieString += escape(value);
            else days = -1;

            if (path)
                sCookieString += "; path=" + path;

            if (days || days === 0) {
                var oExpire = new Date();

                oExpire.setDate(oExpire.getDate() + days);

                sCookieString += "; expires=" + oExpire.toUTCString();
            }

            $window.document.cookie = sCookieString;
        };
    }];
});
