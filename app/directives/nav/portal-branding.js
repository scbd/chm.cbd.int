define(['app', 'services/realmConfig'], function(app) {
    app.directive('portalBranding', function() {
        return {
            restrict: 'EAC',
            replace: true,
            // transclude: true,
            templateUrl: '/app/directives/nav/portal-branding.html',
            scope: {
                uid: '@',
            },
            link: ['$scope', '$q', '$element', function($scope, $q, $element) {

            }],
            controller: ['$scope', '$rootScope', 'realm', function($scope, $rootScope, realm) {

                    $rootScope.test_env = $scope.test_env        = realm != 'CHM';
            }]
        };

    });
});
