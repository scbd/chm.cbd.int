angular.module('kmApp').compileProvider // lazy
.directive('changePassword', ["$rootScope", "$http", "authHttp", "$browser", "authentication", function ($rootScope, $http, authHttp, $browser, authentication) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/shared/directives/users/change-password.html',
        replace: true,
        transclude: false,
        scope: false,
        link: function ($scope, $element, $attr, $ctrl) {
        },
        controller: ['$scope' , '$filter', '$location', '$route', '$window', function ($scope, $filter, $location, $route, $window) {

            //============================================================
            //
            //
            //============================================================
            $scope.actionChangePassword = function(data) {
                var sEmail = $scope.user.email;
                var sPassword = $scope.document.oldPassword;

                authentication.signIn(sEmail, sPassword).then(
                    function (data) { // Success
                        var headers = { Authorization: "Ticket " + $location.search().key };
                        $scope.document.authenticationToken = data.token.authenticationToken;
                        $http.put('/api/v2013/changepassword', angular.toJson($scope.document)).success(function (data, status, headers, config) {
                            $scope.error = "";

                            alert("Thank you!\r\n\r\nYour password has been updated.")
                            
                            //$window.location = 'https://chm.cbd.int/';

                        }).error(function (data, status, headers, config) {
                            $scope.error = status;
                            $scope.success = undefined;
                        });
                    },
                    function (error) { // Error
                        $scope.password = "";
                        $scope.isLoading = false;
                        $scope.isForbidden = error.errorCode == 403;
                        $scope.isNoService = error.errorCode == 404;
                        $scope.isError = error.errorCode != 403 && error.errorCode != 404;
                        $scope.error = error.error;
                        if($scope.error == "")
                            $scope.error = "Old password does not seem valid"
                        throw error;
                    });

            };

            //============================================================
            //
            //
            //============================================================
            $scope.updateComplexity =  function(){
                //debugger;
                $("#password").complexify({}, function (valid, complexity) {
                    if (!valid) {
                        $('#progress').css({'width':complexity + '%'}).removeClass('progressbarValid').addClass('progressbarInvalid');
                    } else {
                        $('#progress').css({'width':complexity + '%'}).removeClass('progressbarInvalid').addClass('progressbarValid');
                    }
                    $('#complexity').html(Math.round(complexity) + '%');
                });
            };
        }]
    }
}]);

angular.module('kmApp').compileProvider.directive('validLength', [function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var validator = function(value) {
                ctrl.$setValidity('length', (value||'').length>=10);
                return value;
            };
            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.unshift(validator);
        }
    };
}]);

angular.module('kmApp').compileProvider.directive('validPassword', [function() {
    return {
        require: 'ngModel',
        link: function(scope, elm, attrs, ctrl) {
            var validator = function(value) {
                var count = 0;
                count += (/[a-z]/g).test(value) ? 1 : 0;
                count += (/[A-Z]/g).test(value) ? 1 : 0;
                count += (/[0-9]/g).test(value) ? 1 : 0;
                count += (/[^0-9^A-Z^a-z]/g).test(value) ? 1 : 0;
                ctrl.$setValidity('password', (value||'').length>=10 && count>=2);
                return value;
            };
            ctrl.$parsers.unshift(validator);
            ctrl.$formatters.unshift(validator);
        }
    };
}]);