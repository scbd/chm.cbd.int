/* global $ */
define(["lodash", 'app','directives/forms/form-controls', 'utilities/km-utilities', 'jqvmap', 'jqvmapworld'], function(_) { 'use strict';

    return ["$scope", "$http", "$q", "$location", '$timeout', "$filter", "Thesaurus", function ($scope, $http, $q, $location, $timeout, $filter, thesaurus) {

        $scope.loading = true;
        $scope.countries=[];
        $scope.colors={};

        $http.get("/api/v2013/thesaurus/domains/countries/terms",{ cache: true }).then(function (o) {$scope.countries = $filter('orderBy')(o.data, 'name');});

        if(!$scope.options) {
            $scope.options = {
                countries: $http.get("/api/v2013/thesaurus/domains/countries/terms",{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
            };
        }

        $scope.nationalRecords = [
            { identifier: 'nationalReport'          , title: 'National Reports and NBSAPs'},
            { identifier: 'nationalTarget'          , title: 'National Targets'           },
            { identifier: 'nationalIndicator'       , title: 'National Indicators'        },
            { identifier: 'progressAssessment'      , title: 'Progress Assessments'       },
            { identifier: 'implementationActivity'  , title: 'Implementation Activities'  },
            { identifier: 'nationalSupportTool'     , title: 'Guidance and Support Tools' },
        ];

        $scope.querySchema     = " ( schema_s:nationalReport OR schema_s:nationalTarget OR schema_s:nationalIndicator OR schema_s:progressAssessment OR schema_s:implementationActivity OR schema_s:nationalSupportTool ) ";
        $scope.queryGovernment = '*:*';
        $scope.queryKeywords = '*:*';

        //================================================
        $scope.query = function () {

            // NOT version_s:* remove non-public records from resultset
            var q = 'NOT version_s:* AND realm_ss:chm AND ' + $scope.querySchema + ' AND ' + $scope.queryGovernment + ' AND ' + $scope.queryKeywords;

            var queryParameters = {
                'q': q,
                'sort': 'createdDate_dt desc, title_t asc',
                'fl': 'id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
                'wt': 'json',
                'start': 0,
                'rows': 1000,
                'cb': new Date().getTime(),
                'group':true,
                'group.field':'government_s',
                'group.limit':1000,
                'group.sort': 'government_EN_t asc'
            };

            $http.get('/api/v2013/index/select', { params: queryParameters}).success(function (data) {

                //$scope.count = data.response.numFound;
                $scope.documents = data.grouped.government_s.groups;
                $scope.records = $scope.documents;

            }).error(function (error) { console.log('onerror'); console.log(error); });
        };



        //================================================
        $scope.$watch('government', function() {

                if(!$scope.government) {
                    return;
                }

                if(!$scope.documents) {
                    runSearch();
                }

                var recs = [];
                var docs = $scope.documents;
                var gov = $scope.government;

                for(var i=0; i < docs.length;i++){
                    for(var j=0; j < gov.length;j++){
                        if(docs[i].groupValue == gov[j].identifier){
                            recs.push(docs[i]);
                        }
                    }
                }

                $scope.records = recs;
                updateMap(recs);

                return;
        });

        // //================================================



        //================================================
        // function buildQuery (fitler, field) {
        //
        //     if(!fitler) return '*:*';
        //     if(!fitler.length===0) return '*:*';
        //
        //     var conditions = [];
        //
        //     fitler.forEach(function (item) {
        //         if(item)
        //             conditions.push(field+':'+item.identifier);
        //     });
        //
        //     var query = '';
        //
        //     conditions.forEach(function (condition) { query = query + (query==='' ? '( ' : ' OR ') + condition; });
        //     query += ' )';
        //
        //     return query;
        // }




        // // //================================================
        $scope.$watch('records', function() {


            if(!$scope.records){
                console.log("watching records !rec")
                return;
            }

            if($scope.records.length == 0){
                console.log("watching records rec.length=0")
                $('#vmap').vectorMap('set', 'colors', '');
                return;
            }
            console.log("watching records");
            updateMap($scope.records);
            $scope.loading = false;

        });


        //================================================
        //================================================
        //================================================
        //================================================
        //================================================

        //================================================
        function updateMap(recs) {

            //jQuery('#vmap').vectorMap('set', 'colors', '');

            if(!recs){
                console.log("udpate map !rec")
                return;
            }

            if(recs.length == 0){
                console.log("udpate map rec.length=0")
                $('#vmap').vectorMap('set', 'colors', {});
                return;
            }

            var colors = {};
            _.forEach(recs, function(item) {
                colors[item.groupValue] = "#428bca";
                console.log(item.groupValue)
            });

            $('#vmap').vectorMap('set', 'colors', colors);

            console.log("map updated:" +  colors)

            console.log("start");
            for(var i = 0; i < colors.length; i++){
                console.log(i + " = " + colors[i]);
            }
            console.log(colors);
            console.log("end");

        }

        //================================================
        function loadMap() {

            $('#vmap').vectorMap({
                map: 'world_en',
                backgroundColor: null,
                    backgroundColor: '#fff',
                   color: '#ffffff',
                   hoverOpacity: 0.7,
                   selectedColor: '#666666',
                   enableZoom: true,
                   showTooltip: true,
                   normalizeFunction: 'polynomial',
                   onRegionClick: function(element, code, region)
                    {
                        var message = 'You clicked "'
                            + region
                            + '" which has the code: '
                            + code.toUpperCase();

                        alert(message);
                    }
                        });
            $('.jqvmap-zoomin').html('<i class="glyphicon glyphicon-plus"/>')
            $('.jqvmap-zoomout').html('<i class="glyphicon glyphicon-minus"/>')

        }

        //================================================
        function runSearch() {
            $scope.loading = true;
            $scope.currentPage=0;
            $scope.query();
            $scope.loading = false;
        }

        //================================================
        loadMap();
        runSearch();

    }];
});
