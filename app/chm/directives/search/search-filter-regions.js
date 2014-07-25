define(['app', 'underscore'], function(app, _) { 'use strict';

    app.directive('searchFilterRegions', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-filter-regions.partial.html?v'+(new Date()).getTime(),
        replace: true,
        scope: {
              title: '@title',
              items: '=ngModel',
              field: '@field',
              query: '=query',
        },
        link: function ($scope, element, attrs, ngModelController)
        {
        },
        controller : ['$scope', '$element', '$location', 'Thesaurus', function ($scope, $element, $location, thesaurus)
        {
            var self = this;
            self.termsMap = [];

            $scope.expanded = false;
            $scope.selectedItems = [];
            $scope.facet = $scope.field.replace('_s', ''); // TODO: replace @field by @facet

            var parameters = $location.search();

            if (parameters[$scope.facet]) {
                $scope.selectedItems.push(parameters[$scope.facet]);
            }

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

            $scope.ccc = function(item) {
                return $scope.isSelected(item) ? 'facet selected' : 'facet unselected';
            };

            $scope.onclick = function (scope, evt) {
                scope.item.selected = !scope.item.selected;
                buildQuery();
            }

            function buildQuery () {
                var conditions = [];
                buildConditions(conditions, self.termsMap);

                if(conditions.length==0) $scope.query = '*:*';
                else {
                    var query = '';
                    conditions.forEach(function (condition) { query = query + (query=='' ? '( ' : ' OR ') + condition; });
                    query += ' )';
                    $scope.query = query;
                }
            }

            function buildConditions (conditions, items) {
                _.values(items).forEach(function (item) {
                    if(item.selected)
                        conditions.push($scope.field+':'+item.identifier);
                });
            }

            function dictionarize(items) {
                var dictionary = [];
                (items||[]).forEach(function (item) {
                    item.selected = false;
                    dictionary[item.identifier] = item;
                });
                return dictionary;
            }

            function flatten(items, collection) {
                items.forEach(function (item) {
                    item.selected = false;
                    collection[item.identifier] = item;
                    if(item.narrowerTerms)
                        flatten(item.narrowerTerms, collection);
                });
                return collection;
            }

            $scope.$watch('items', function() {
                $scope.terms = $http.get('/api/v2013/thesaurus/domains/regions/terms', { cache:true }).then(function (response) {

                    var termsTree = thesaurus.buildTree(response.data);
                    self.termsMap = flatten(termsTree, {});
                    var classes   = _.filter(termsTree, function where (o) { return !!o.narrowerTerms && o.identifier!='1796f3f3-13ae-4c71-a5d2-0df261e4f218'});

                    _.values(self.termsMap).forEach(function (term) {
                        term.name = term.name.replace('CBD Regional Groups - ', '');
                        term.name = term.name.replace('Inland water ecosystems - ', '');
                        term.name = term.name.replace('Large marine ecosystems - ', '');

                        term.name = term.name.replace('Mountains - All countries', 'Mountains');
                        term.name = term.name.replace('Global - All countries', 'Global');
                        term.name = term.name.replace('Americas - All countries', 'Americas');
                        term.name = term.name.replace('Africa - All countries', 'Africa');
                        term.name = term.name.replace('Asia - All countries', 'Asia');
                        term.name = term.name.replace('Europe - All countries', 'Europe');
                        term.name = term.name.replace('Oceania - All countries', 'Oceania');

                        term.name = term.name.replace('Mountains - ', '');
                        term.name = term.name.replace('Global - ', '');
                        term.name = term.name.replace('Americas - ', '');
                        term.name = term.name.replace('Africa - ', '');
                        term.name = term.name.replace('Asia - ', '');
                        term.name = term.name.replace('Europe - ', '');
                        term.name = term.name.replace('Oceania - ', '');

                        term.name = term.name.replace('regions', '<All>');
                        term.name = term.name.replace('groups', '<All>');

                        term.selected = false;
                        term.count = 0;
                    });

                    $scope.allTerms = _.values(self.termsMap);

                    ($scope.items||[]).forEach(function (item) {
                        if(_.has(self.termsMap, item.symbol))
                            self.termsMap[item.symbol].count = item.count;
                    });

                    return classes;

                });
            });

            function onWatch_items(values) {
                (values||[]).forEach(function (item) {
                    if(_.has($scope.termsx, item.symbol))
                        $scope.termsx[item.symbol].count = item.count;
                });
            }

            $scope.refresh = buildQuery;
        }]
    }
});
});
