define(['app', "text!./search-top-menu.html"], function(app, template) {
    app.directive("searchTopMenu", ["$rootScope", function($rootScope) {

        return {
            restrict: "EA",
            template: template,
            replace: true,
            scope: {},
            link: function($scope, element, attrs) {
                $scope.user = $rootScope.user;
            }
        };
    }]);
});
