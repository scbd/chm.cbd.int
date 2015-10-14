define(['text!./search-filter-dates.html', 'app', 'directives/forms/km-date'], function(template, app) { 'use strict';

    app.directive('searchFilterDates', ["$location", function ($location) {
        return {
            restrict: 'EAC',
            template: template,
            replace: true,
            require : '^search',
            scope: {
                  title: '@title',
            },
            link : function ($scope, $element, $attr, searchCtrl)//jshint ignore:line
            {

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

                $scope.since = $location.search().startDate;
                $scope.until = $location.search().endDate;

                $scope.$watch('since', updateQuery);
                $scope.$watch('until', updateQuery);

                if(!$scope.since && !$scope.until)
                    $scope.selectedDate = $scope.dates[0];

                function updateQuery () {

                    if($scope.since || $scope.until) {
                        var since = $scope.since ? $scope.since + 'T00:00:00.000Z' : '*';
                        var until = $scope.until ? $scope.until + 'T23:59:59.999Z' : '*';
                        searchCtrl.addSubQuery('createdDate_s','[ ' + since + ' TO ' + until + ']',true);
                    }
                    if(!$scope.since && !$scope.until)
                        searchCtrl.deleteAllSubQuery('createdDate_s');

                    searchCtrl.search();
                    $location.search("startDate",      $scope.since        || null);
                    $location.search("endDate",        $scope.until        || null);
                }

                $scope.$watch('selectedDate', function (_new, _old) {
                    if(_new==_old)
                        return;

                    $scope.since = $scope.selectedDate.date ? new Date($scope.selectedDate.date).toISOString().substr(0, 10) : null;
                    $scope.until = null;
                });

                $scope.updateQuery = updateQuery;
            }
        };
    }]);
});
