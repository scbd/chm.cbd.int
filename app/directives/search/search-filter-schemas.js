define(['text!./search-filter-schemas.html', 'app', 'lodash'], function(template, app, _) { 'use strict';

    app.directive('searchFilterSchemas', function () {
    return {
        restrict: 'EAC',
        template: template,
        replace: true,
        scope: {
              title: '@title',
              items: '=ngModel',
              field: '@field',
              query: '=query',
        },
        controller : ['$scope', '$element', '$location', "$timeout", function ($scope, $element, $location, $timeout)
        {
            $scope.expanded = false;
            $scope.selectedItems = [];
            $scope.facet = $scope.field.replace('_s', ''); // TODO: replace @field by @facet

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

                $element.find("#dialogSelect").modal("show");
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
                    $scope.query += ($scope.query==='' ? '' : ' OR ') + $scope.field+':' + item;
                });

                if($scope.query!=='')
                    $scope.query = '(' + $scope.query + ')';
                else
                    $scope.query = '*:*';

                console.log($scope.query);
            };

            $scope.onclick = function (scope) {
                scope.item.selected = !scope.item.selected;
                buildQuery();
            };

            function buildQuery () {
                var conditions = [];
                buildConditions(conditions, $scope.terms);

                $scope.query = '*:*';

                if(conditions.length) {
                    var query = '';
                    conditions.forEach(function (condition) { query = query + (query==='' ? '( ' : ' OR ') + condition; });
                    query += ' )';

                    $scope.query = query;
                }

                // update querystring

                var items = _(_.values($scope.termsx)).where({ selected : true }).map(function(o) { return o.identifier; }).value();

                if(_.isEmpty(items))
                    items = null;

                $location.replace();
                $location.search("schema", items);
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
                { identifier: 'nationalReport'          , title: 'National Reports and NBSAPs'},
                { identifier: 'nationalTarget'          , title: 'National Targets'           },
                { identifier: 'nationalIndicator'       , title: 'National Indicators'        },
                { identifier: 'nationalAssessment'      , title: 'Progress Assessments'       },
                { identifier: 'implementationActivity'  , title: 'Implementation Activities'  },
                { identifier: 'nationalSupportTool'     , title: 'Guidance and Support Tools' , count: 0 },
                {},
                { identifier: 'resourceMobilisation'    , title: 'Financial Reporting Framework'}
            ];

            $scope.terms = _.union($scope.outreachRecords, $scope.referenceRecords, $scope.copRecords, $scope.meetingRecords, $scope.nationalRecords );
            $scope.termsx = dictionarize($scope.terms);

            // Set intitial selection from QueryString parameters

            var qsSelection = _([$location.search().schema]).flatten().compact().value();

            qsSelection.forEach(function(id) {
                if($scope.termsx[id])
                    $scope.termsx[id].selected = true;
            });

            function onWatch_items(values) { if(!values) return;
                values.forEach(function (item) {
                    if(_.has($scope.termsx, item.symbol))
                        $scope.termsx[item.symbol].count = item.count;
                });
            }

            $scope.$watch('items', onWatch_items);

            $scope.refresh = buildQuery;

            $timeout(buildQuery);
        }]
    };
});
});
