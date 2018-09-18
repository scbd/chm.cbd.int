define(['text!./progress.html', 'app'], function(template, app) { 'use strict';

app.directive("nr6ProgressTab", [function () {
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
