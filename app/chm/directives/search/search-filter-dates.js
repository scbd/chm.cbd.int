define(['text!./search-filter-dates.html', 'app'], function(template, app) { 'use strict';

    app.directive('searchFilterDates', function () {
        return {
            restrict: 'EAC',
            template: template,
            replace: true,
            scope: {
                  title: '@title',
                  query: '=query'
            },
            link: function ($scope) {

                var now = new Date();

                $scope.dates = [
                    { text: 'Any', date: '' },
                    { text: 'Last day', date: new Date(new Date(now).setDate(now.getDate()-1)).toISOString() },
                    { text: 'Last week', date: new Date(new Date(now).setDate(now.getDate()-7)).toISOString() },
                    { text: 'Last two weeks', date: new Date(new Date(now).setDate(now.getDate()-14)).toISOString() },
                    { text: 'Last month', date: new Date(new Date(now).setMonth(now.getMonth()-1)).toISOString() },
                    { text: 'Last two months', date: new Date(new Date(now).setMonth(now.getMonth()-2)).toISOString() },
                    { text: 'Last six months', date: new Date(new Date(now).setMonth(now.getMonth()-6)).toISOString() },
                    { text: 'Last year', date: new Date(new Date(now).setMonth(now.getMonth()-12)).toISOString() },
                ];

                $scope.since = null;
                $scope.until = null;
                $scope.selectedDate = '';

                $scope.$watch('since', updateQuery);
                $scope.$watch('until', updateQuery);

                function updateQuery () {

                    if($scope.since || $scope.until) {
                        var since = $scope.since ? $scope.since + 'T00:00:00.000Z' : '*';
                        var until = $scope.until ? $scope.until + 'T23:59:59.999Z' : '*';

                        $scope.query = ' ( createdDate_s:[ ' + since + ' TO ' + until + ' ] ) ';
                    } else {
                        $scope.query = '*:*';
                    }
                }

                $scope.$watch('selectedDate', function () {
                    $scope.since = $scope.selectedDate.date ? new Date($scope.selectedDate.date).toISOString().substr(0, 10) : null;
                    $scope.until = null;
                });

                $scope.updateQuery = updateQuery;
            }
        };
    });
});
