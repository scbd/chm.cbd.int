define(['text!./countries.html','app', 'underscore'], function(template, app, _) { 'use strict';

app.directive('countries', ['$http', function ($http) {
    return {
        priority: 0,
        restrict: 'E',
        template: template,
        link : function ($scope) {

            $http.get('/api/v2013/countries/').then(function (response) {
                $scope.countries =  _.map(response.data, function (country) {
                    country.name = country.name.en; // TODO: L10N
                    return country;
                });
            });
        }
    };
}]);
});
