define(['text!./implementation.html', 'app'], function(template, app) { 'use strict';

app.directive("nr6ImplementationTab", [function () {
    return {
        restrict: 'E',
        template : template,
        replace: true,
        transclude: false,
        link: function ($scope) {
        }
    };
}]);
});
