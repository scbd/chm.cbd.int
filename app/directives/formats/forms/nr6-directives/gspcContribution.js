define(['text!./gspcContribution.html', 'app'], function(template, app) { 'use strict';

app.directive("nr6GspcContributionTab", [function () {
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
