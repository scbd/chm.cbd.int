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
        controller: ['$scope' , '$filter', '$location', 'URI', function ($scope, $filter, $location, URI) {


            //==================================
            //
            //==================================
            $scope.init = function() {
            }

            //==================================
            //
            //==================================
            $scope.onPostChangePassword = function(data) {
                $http.put('/api/v2013/users/'+$scope.user.userID, angular.toJson($scope.document))
                .success(function (data, status, headers, config) {
                    //debugger;
                })
                .error(function (data, status, headers, config) {
                    $scope.error = data;
                    //debugger;
                });
            };

        }]
    }
}]);