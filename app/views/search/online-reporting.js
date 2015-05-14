define(['app', 'directives/forms/form-controls' , 'utilities/km-utilities'], function() { 'use strict';

    return ["$scope","$http", "$q", "$location", '$timeout', "$filter", "Thesaurus", function ($scope, $http, $q, $location, $timeout, $filter,  thesaurus) {



        if(!$scope.options) {
            $scope.options = {
                countries:		$http.get("/api/v2013/thesaurus/domains/countries/terms",{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
            };
        }


        var self = this;

        $scope.actionSetPage = function (pageNumber) {
            $scope.currentPage = Math.min($scope.pageCount-1, Math.max(0, pageNumber));
        };

        $scope.loaded          = false;
        $scope.querySchema     = "( schema_s:nationalReport OR schema_s:nationalTarget OR schema_s:nationalIndicator OR schema_s:progressAssessment OR schema_s:implementationActivity OR schema_s:nationalSupportTool ) ";
        $scope.queryGovernment = '*:*';


        //================================================
        $scope.query = function () {

            // NOT version_s:* remove non-public records from resultset
            var q = 'NOT version_s:* AND realm_ss:chm AND schema_s:* AND ' + $scope.querySchema + ' AND ' + $scope.queryGovernment ;

            var queryParameters = {
                'q': q,
                'sort': 'createdDate_dt desc, title_t asc',
                'fl': 'id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
                'wt': 'json',
                'start': 0,
                'rows': 100000,
                'cb': new Date().getTime(),
                'group':true,
                'group.field':'government_s',
                'group.limit':1000
            };

            $http.get('/api/v2013/index/select', { params: queryParameters}).success(function (data) {

                //$scope.count = data.response.numFound;
                $scope.documents = data.grouped.government_s.groups;

            }).error(function (error) { console.log('onerror'); console.log(error); });
        };

        //================================================
        function search() {
            $scope.currentPage=0;
            $scope.query();
        }

        //================================================
        $scope.$watch('government', function() {
            $scope.queryGovernment = buildQuery($scope.government, 'government_s')
            search();
        });

//http://localhost:2000/api/v2013/index/select?cb=1431627063564&fl=id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t&q=NOT+version_s:*+AND+realm_ss:chm+AND+schema_s:*+AND+(+schema_s:nationalReport+OR+schema_s:nationalTarget+OR+schema_s:nationalIndicator+OR+schema_s:progressAssessment+OR+schema_s:implementationActivity+OR+schema_s:nationalSupportTool+)++AND+*:*&rows=100000&sort=createdDate_dt+desc,+title_t+asc&start=0&wt=json&group=true&group.field=government_EN_t

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



    }];
});
