angular.module('kmApp').compileProvider // lazy
.directive('countries', ['$http', function ($http) {
    return {
        priority: 0,
        restrict: 'EC',
        templateUrl: '/app/chm/directives/countries/countries.partial.html?v' + (new Date()).getTime(),
        controller: ['$scope', function ($scope) {

            $scope.countries = $http.get('/api/v2013/countries/').then(function (response) {
                return _.map(response.data, function (country) {
                    country.name = country.name.en; // TODO: L10N
                    return country;
                });
            });
        }]
    };
}]);