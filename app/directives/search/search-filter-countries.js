define(['text!./search-filter-countries.html','app', 'lodash', 'jquery'], function(template, app, _, $) { 'use strict';

    app.directive('searchFilterCountries', ["$http", '$location', '$timeout', function ($http, $location, $timeout) {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        require : "^search",
        scope: {
              title: '@title',
              items: '=ngModel',
              field: '@field',
              query: '=query',
        },
        link : function ($scope, $element, $attr, searchCtrl)
        {
            $scope.alphabet = ['A','B','C','D','E','F','G','H','I','J','K','L','M',
                               'N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

            $scope.expanded = false;
            $scope.selectedItems = [];
            $scope.facet = $scope.field.replace('_s', ''); // TODO: replace @field by @facet

            $element.find("#dialogSelect").on('show.bs.modal', function(){
                $timeout(function(){ //Ensure angular context
                    //TODO Computes facets
                });
            });

            $scope.isSelected = function(item) {
                return $.inArray(item.symbol, $scope.selectedItems) >= 0;
            };

            $scope.closeDialog = function() {
                $element.find("#dialogSelect").modal("hide");
            };

            $scope.actionSelect = function(item) {

                if($scope.isSelected(item)) {
                    $scope.selectedItems.splice($.inArray(item.symbol, $scope.selectedItems), 1);
                } else {
                    $scope.selectedItems.push(item.symbol);
                }

                buildQuery();
            };

            $scope.actionExpand = function() {

                var count1 = Math.ceil($scope.items.length/3);
                var count2 = Math.ceil(($scope.items.length-count1)/2);
                var count3 = Math.ceil(($scope.items.length-count2-count1));

                $scope.items1 = $scope.items.slice(0, count1);
                $scope.items2 = $scope.items.slice(count1, count2+count2);
                $scope.items3 = $scope.items.slice(count1+count2, count1+count2+count3);

                console.log($scope.items1);
                console.log($scope.items2);
                console.log($scope.items3);


                $element.find("#dialogSelect").modal("show");
            };

            $scope.ccc = function(item) {
                return $scope.isSelected(item) ? 'facet selected' : 'facet unselected';
            };

            $scope.onclick = function (scope) {
                scope.item.selected = !scope.item.selected;
                buildQuery();
            };

            function buildQuery () {

                var conditions = [];

                $scope.terms.forEach(function (item) {
                    if(item.selected)
                        conditions.push($scope.field+':'+item.identifier);
                });

                $scope.query = null;

                if(conditions.length)
                    $scope.query = "(" + conditions.join(" OR ") + ")";

                //TODO searchCtrl.setSubQuery

                // update querystring

                var items = _($scope.terms).where({ selected : true }).map(function(o) { return o.identifier; }).value();

                if(_.isEmpty(items))
                    items = null;

                $location.replace();
                $location.search("country", items);
            }

            $scope.terms = [];
            $scope.termsx = {};

            $http.get('/api/v2013/thesaurus/domains/countries/terms').success(function (data) {

                var qsSelection = _([$location.search().country]).flatten().compact().value();

                $scope.terms = _.map(data, function(t) {

                    t.selected = qsSelection.indexOf(t.identifier)>=0;

                    $scope.termsx[t.identifier] = t;

                    return t;
                });

                onWatch_items($scope.items);

                if(qsSelection.length)
                    buildQuery();
            });

            function onWatch_items(values) {

                 if(!values) return;
                values.forEach(function (item) {
                    if(_.has($scope.termsx, item.symbol))
                        $scope.termsx[item.symbol].count = item.count;
                });
            }

            $scope.$watch('items', onWatch_items);

            $scope.refresh = buildQuery;
        }
    };
}]);
});
