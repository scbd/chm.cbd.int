angular.module('kmApp').compileProvider // lazy
.directive('searchFilterFacets', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-filter-facets.partial.html?'+(new Date().getTime()),
        replace: true,
        // require : "?ngModel",
        scope: {
              // placeholder: '@',
              // ngDisabledFn : '&ngDisabled',
              title: '@title',
              items: '=ngModel',
              field: '@field',
              query: '=query',
              // locales    : '=',
              // rows       : '=',
              // required   : "@"
        },
        link: function ($scope, element, attrs, ngModelController)
        {
        },
        controller : ['$scope', '$element', '$window', 'Thesaurus', function ($scope, $element, $window, thesaurus)
        {
            $scope.expanded = false;
            $scope.selectedItems = [];
            $scope.facet = $scope.field.replace('_s', ''); // TODO: replace @field by @facet

            var parameters = $window.URI().search(true);

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

                $scope.updateQuery();
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

                




                





                //if(!$scope.expanded)
                    //$scope.$parent.$broadcast('onExpand', $scope);

                //$scope.expanded = !$scope.expanded;
            };

            $scope.$on('onExpand', function(scope) {
                if(scope!=$scope && $scope.expanded)
                    $scope.expanded = false;
            });

            $scope.filterx = function(item) {
                console.log(item);
                //return item.selected;
            };

            $scope.ccc = function(item) {
                return $scope.isSelected(item) ? 'facet selected' : 'facet unselected';
            };

            $scope.updateQuery = function() {

                console.log($scope.query);
                
                $scope.query = '';

                $scope.selectedItems.forEach(function(item) {
                    $scope.query += ($scope.query=='' ? '' : ' OR ') + $scope.field+':' + item;
                });

                if($scope.query!='')
                    $scope.query = '(' + $scope.query + ')';
                else
                    $scope.query = '*:*';

                console.log($scope.query);
            };

            function select(item) {
                if(!item.selected) item.indeterminate = true;
                if(item.narrowerTerms) item.narrowerTerms.forEach(select);
            }

            var unselect = $scope.unselect = function (item) {
                if(!item.selected) item.indeterminate = false;
                if(item.narrowerTerms) item.narrowerTerms.forEach(unselect);
            }

            function setBroaders(broaderTerms, selected) {

                if(!broaderTerms) return;

                broaderTerms.forEach(function (term) {

                    term.indeterminateCounterA = term.indeterminateCounterA + (selected ? 1 : -1);
                    console.log(term.indeterminateCounterA);
                    term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;

                    setBroaders(term.broaderTerms, selected); 
                });


                // if(term.indeterminate) {
                //     term.state = term.selected;
                //     term.selected = false;
                // }

                // if(!term.indeterminate) {
                //     term.selected = term.state;
                //     term.state = null;
                // }

                // term.indeterminate = selected;

                
            }

            function setNarrowers(narrowerTerms, selected) {

                if(!narrowerTerms) return;

                narrowerTerms.forEach(function (term) { 

                    term.indeterminateCounterB = term.indeterminateCounterB + (selected ? 1 : -1);
                    console.log(term.indeterminateCounterB);
                    term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;

                    setNarrowers(term.narrowerTerms, selected); 
                });


                // 

                // 

                // term.indeterminate = selected;

                
            }

            $scope.onclick = function (scope, evt) {
                scope.item.selected = !scope.item.selected;
                $scope.ts(scope, evt);
            }

            $scope.ts = function (scope, evt) {

                var term = scope.item;

                term.indeterminate = !term.selected && (term.indeterminateCounterA + term.indeterminateCounterB) > 0;

                setBroaders(term.broaderTerms, term.selected);
                setNarrowers(term.narrowerTerms, term.selected);
                
                //if(scope.item.indeterminate)
                  //  scope.item.indeterminate = scope.item.indeterminate = false;

                //if(scope.item.selected==true) unselect(scope.item);
                //else          
         //       if(scope.item.selected) { if(scope.item.narrowerTerms) scope.item.narrowerTerms.forEach(select); }
           //     else                    { if(scope.item.narrowerTerms) scope.item.narrowerTerms.forEach(unselect); }

                //var cb = evt.target;
                                
                //if (cb.readOnly) cb.checked=cb.readOnly=false;
                //else if (!cb.checked) cb.readOnly=cb.indeterminate=true;

                //$scope.actionSelect(scope.item);



                buildQuery();
            }

            function buildQuery () {
                var conditions = [];
                buildConditions(conditions, $scope.terms);

                if(conditions.length==0) $scope.query = '*:*';
                else {
                    var query = '';
                    conditions.forEach(function (condition) { query = query + (query=='' ? '( ' : ' OR ') + condition; });
                    query += ' )';
                    $scope.query = query;
                }

                console.log($scope.query);
            }

            function buildConditions (conditions, items) {
                items.forEach(function (item) { 
                    if(item.selected)
                        conditions.push('thematicAreas_ss:'+item.identifier);
                    else if(item.narrowerTerms) {
                        buildConditions(conditions, item.narrowerTerms);
                    }
                });
            }

            function flatten(items, collection) {
                items.forEach(function (item) { 
                    item.selected = false;
                    item.indeterminateCounterA = 0;
                    item.indeterminateCounterB = 0;
                    collection[item.identifier] = item;
                    if(item.narrowerTerms) 
                        flatten(item.narrowerTerms, collection);
                });
                return collection;
            }

            $scope.termsx = [];
            $http.get('/api/v2013/thesaurus/domains/AICHI-TARGETS/terms').success(function (data) {
                $scope.terms = thesaurus.buildTree(data);
                $scope.termsx = flatten($scope.terms, {});
                $scope.termsxx = _.values($scope.termsx);
                $scope.items.forEach(function (item) {
                    if(_.has($scope.termsx, item.symbol))
                        $scope.termsx[item.symbol].count = item.count;
                });
            });

            $scope.$watch('items', function (values) { if(!values) return;
                values.forEach(function (item) {
                    if(_.has($scope.termsx, item.symbol))
                        $scope.termsx[item.symbol].count = item.count;
                });
            });
        }]
    }
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('bindIndeterminate', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            scope.$watch(attrs.bindIndeterminate, function (value) {
                element[0].indeterminate = value;
            });
        }
    };
}]);