angular.module('kmApp').compileProvider // lazy
.directive('password', ["$rootScope", "$http", "authHttp", "$browser", "authentication", "URI", function ($rootScope, $http, authHttp, $browser, authentication, URI) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/shared/directives/users/password.html',
        replace: true,
        transclude: false,
        scope: false,
        link: function ($scope, $element, $attr, $ctrl) {
            $scope.init();
        },
        controller: ['$scope' , '$filter', '$location', '$route', 'URI', '$window', function ($scope, $filter, $location, $route, URI, $window) {

            //==================================
            //
            //==================================
            $scope.init = function() {
            }

            //==================================
            //
            //==================================
            $scope.onPostChangePassword = function(data) {

                var headers = { Authorization: "Ticket " + $location.search().key };

                $http.put('/api/v2013/changepassword', angular.toJson($scope.document), { headers:headers }).success(function (data, status, headers, config) {
                    $scope.error = "";

                    alert("Thank you!\r\n\r\nYour account has been successfully activated.")
                    
                    $window.location = 'https://chm.cbd.int/';

                }).error(function (data, status, headers, config) {
                    $scope.error = status;
                    $scope.success = undefined;
                    //debugger;
                });
            };

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