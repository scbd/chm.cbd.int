define(['text!./countryProfile.html', 'app'], function(template, app) { 'use strict';

app.directive("nr6CountryProfileTab", [function () {
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
