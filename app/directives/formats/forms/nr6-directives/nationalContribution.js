define(['text!./nationalContribution.html', 'app'], function(template, app) { 'use strict';

app.directive("nr6NationalContributionTab", [function () {
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
