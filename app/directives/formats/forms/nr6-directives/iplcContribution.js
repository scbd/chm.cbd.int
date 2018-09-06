define(['text!./iplcContribution.html', 'app'], function(template, app) { 'use strict';

app.directive("nr6IplcContributionTab", [function () {
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
