define(['app', "text!./top-menu.html"], function(app, template) {
    app.directive("topMenu", ["$rootScope", function($rootScope) {

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
