angular.module('kmApp').compileProvider // lazy
.directive('searchFilterSchemas', function ($http) {
    return {
        restrict: 'EAC',
         templateUrl: '/app/chm/directives/search/search-filter-schemas.partial.html?'+(new Date().getTime()),
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
        controller : ['$scope', '$element', '$location', function ($scope, $element, $location)
        {
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
                return $scope.isSelected(item) || $scope.expanded;
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

            $scope.onclick = function (scope, evt) {
                scope.item.selected = !scope.item.selected;
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
                    console.log(query);
                    $scope.query = query;
                }
            }

            function buildConditions (conditions, items) {
                items.forEach(function (item) { 
                    if(item.selected)
                        conditions.push($scope.field+':'+item.identifier);
                });
            }

            function dictionarize(items) {
                var dictionary = [];
                items.forEach(function (item) { 
                    item.selected = false;
                    dictionary[item.identifier] = item;
                });
                return dictionary;
            }

            $scope.outreachRecords = [
                { identifier: 'notification', title: 'Notifications'  },
                { identifier: 'pressRelease', title: 'Press Releases' },
                { identifier: 'statement'   , title: 'Statements'     },
                { identifier: 'announcement', title: 'Announcements'  }
            ];

            $scope.referenceRecords = [
                // { identifier: 'treaty'                , title: 'Treaties'                   , count: 0 },
                // { identifier: 'article'               , title: 'Treaty Articles'            },
                { identifier: 'event'                 , title: 'Related Events'             , count: 0 },
                { identifier: 'organization'          , title: 'Related Organizations'      },
                { identifier: 'resource'              , title: 'Virtual Library Resources'  }
            ];

             $scope.copRecords = [
                { identifier: 'aichiTarget'           , title: 'Aichi Biodiversity Targets' },
                { identifier: 'strategicPlanIndicator', title: 'Strategic Plan Indicators'  },
                { identifier: 'marineEbsa'            , title: 'Marine EBSAs'               },
                { identifier: 'caseStudy'             , title: 'Case Studies'               , count: 0 }
            ];

            $scope.meetingRecords = [
                { identifier: 'meeting'        , title: 'Meetings'          },
                { identifier: 'meetingDocument', title: 'Meeting Documents' },
                { identifier: 'decision'       , title: 'Decisions'         },
                { identifier: 'recommendation' , title: 'Recommendations'   }
            ];

            $scope.nationalRecords = [
                { identifier: 'focalPoint'              , title: 'National Focal Points'      },
                { identifier: 'nationalReport'          , title: 'National Reports'           },
                { identifier: 'nationalTarget'          , title: 'National Targets'           },
                { identifier: 'nationalIndicator'       , title: 'National Indicators'        },
                { identifier: 'progressAssessment'      , title: 'Progress Assessments'       },
                { identifier: 'implementationActivity'  , title: 'Implementation Activities'  },
                { identifier: 'nationalSupportTool'     , title: 'Guidance and Support Tools' , count: 0 }, 
                {},
                { identifier: 'resourceMobilizationTool', title: 'Resource Mobilization Tools' , count: 0 }
            ];

            $scope.terms = _.union($scope.outreachRecords, $scope.referenceRecords, $scope.copRecords, $scope.meetingRecords, $scope.nationalRecords );
            $scope.termsx = dictionarize($scope.terms);

            function onWatch_items(values) { if(!values) return;
                values.forEach(function (item) {
                    if(_.has($scope.termsx, item.symbol))
                        $scope.termsx[item.symbol].count = item.count;
                });
            }

            $scope.$watch('items', onWatch_items);

            $scope.refresh = buildQuery;
        }]
    }
});
