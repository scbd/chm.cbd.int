define(['text!./implementation.html', 'app','directives/forms/km-value-ml'], function(template, app) { 'use strict';

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
