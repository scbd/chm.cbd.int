define(['app', 'directives/forms/form-controls' , 'utilities/km-utilities', 'jqvmap', 'jqvmapworld',  ], function() { 'use strict';

    return ["$scope","$http", "$q", "$location", '$timeout', "$filter", "Thesaurus", function ($scope, $http, $q, $location, $timeout, $filter,  thesaurus) {


        if(!$scope.options) {
            $scope.options = {
                countries:		$http.get("/api/v2013/thesaurus/domains/countries/terms",{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
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



        $scope.filterSchema     = "nationalReport,nationalTarget,nationalIndicator,progressAssessment,implementationActivity,nationalSupportTool";
        $scope.filterGovernment = 'ca,ar';
        $scope.filterKeywords = '';



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

            }).error(function (error) { console.log('onerror'); console.log(error); });
        };

        //================================================
        $scope.runSearch = function() {

            //$scope.queryGovernment = buildQuery($scope.government, 'government_s');
            //$scope.querySchema = buildQuery($scope.schema, 'schema_s');
            //$scope.queryKeywords = $scope.keyword == '' ? '*:*' : '(title_t:"' + $scope.keyword + '*" OR government_EN_t:"' + $scope.keyword +  '*" OR description_t:"' + $scope.keyword + '*" OR text_EN_txt:"' + $scope.keyword + '*")';

            $scope.currentPage=0;
            $scope.query();
        };

        if(!$scope.documents) {
            $scope.runSearch();
        }


        //$scope.query();

        // //================================================
        // $scope.$watch('government', function() {
        //
        //     //if($scope.government == null) $scope.documents = "";
        //
        //     //if($scope.government){
        //         $scope.queryGovernment = buildQuery($scope.government, 'government_s')
        //     //}
        //
        // });
        //
        // // //================================================
        // $scope.$watch('schema', function() {
        //     $scope.querySchema = buildQuery($scope.schema, 'schema_s');
        //
        // });
        // // //================================================
        // $scope.$watch('keyword', function () {
        //     $scope.queryKeywords = $scope.keyword == '' ? '*:*' : '(title_t:"' + $scope.keyword + '*" OR government_EN_t:"' + $scope.keyword +  '*" OR description_t:"' + $scope.keyword + '*" OR text_EN_txt:"' + $scope.keyword + '*")';
        //
        // });


        //================================================
        function buildQuery (fitler, field) {

            if(!fitler) return '*:*';
            if(!fitler.length===0) return '*:*';

            var conditions = [];

            fitler.forEach(function (item) {
                if(item)
                    conditions.push(field+':'+item.identifier);
            });

            var query = '';

            conditions.forEach(function (condition) { query = query + (query==='' ? '( ' : ' OR ') + condition; });
            query += ' )';

            return query;
        }



        //================================================
        //================================================
        //================================================
        //================================================
        //================================================

        function loadMap() {

            jQuery('#vmap').vectorMap({
                map: 'world_en',
                backgroundColor: null,
                   color: '#ffffff',
                   hoverOpacity: 0.7,
                   selectedColor: '#666666',
                   enableZoom: true,
                   showTooltip: true,
                   scaleColors: ['#C8EEFF', '#006491'],
                   normalizeFunction: 'polynomial'
            });
            $('.jqvmap-zoomin').html('<i class="glyphicon glyphicon-plus"/>')
            $('.jqvmap-zoomout').html('<i class="glyphicon glyphicon-minus"/>')
        }

        loadMap();

        //================================================




    }];
});
