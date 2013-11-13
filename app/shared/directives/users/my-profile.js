angular.module('kmApp').compileProvider // lazy
.directive('myProfile', ["$rootScope", "$http", "authHttp", "$browser", "authentication", "URI", function ($rootScope, $http, authHttp, $browser, authentication, URI) {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/shared/directives/users/my-profile.partial.html',
        replace: true,
        transclude: false,
        scope: false,
        link: function ($scope, $element, $attr, $ctrl) {
        },
        controller: ['$scope', '$location', 'URI', function ($scope, $location, URI) {

        }]
    }
}]);