define(['app', 'angular', 'authentication'], function(app) { 'use strict';

    app.directive('signin', ["$rootScope", '$location', "authentication", function ($rootScope, $location, authentication) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/directives/users/signin.html',
        replace: true,
        transclude: false,
        scope: false,
        link: function ($scope) {

            $scope.password   = "";
            $scope.email      = $rootScope.lastLoginEmail || "";

            //==============================
            //
            //==============================
            $scope.signIn = function () {

                clearErrors();
                $scope.isLoading = true;

                var sEmail = $scope.email;
                var sPassword = $scope.password;

                authentication.signIn(sEmail, sPassword).then(
                    function () { // Success
                        if ($location.search().returnUrl)
                            $location.url($location.search().returnUrl);
                        else
                            $location.url('/management');
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

            $scope.actionSignup = function () {
                $location.url('https://accounts.cbd.int/signup');
              };

            //==============================
            //
            //==============================
            $scope.signOut = function () {
                authentication.signOut();
            };

            //==============================
            //
            //==============================
            function clearErrors() {
                $scope.isForbidden = false;
                $scope.isNoService = false;
                $scope.isError = false;
                $scope.error = null;
            }

            //==============================
            //
            //==============================
            var user = null;
            $scope.isAuthenticated = function () {

                if(!user) {

                    user = authentication.getUser().then(function (u){
                        user = u;
                    });
                }

                return user.isAuthenticated;
            };
        }
    };
}]);
});
