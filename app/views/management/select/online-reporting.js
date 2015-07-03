define(['lodash', 'app', 'authentication', 'utilities/km-storage', 'utilities/km-workflows', "utilities/solr"], function(_) { 'use strict';

    return ['$scope', '$rootScope',"IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm","user","solr",
     function($scope, $rootScope, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm,user,solr) {


        $scope.schemasList = [
                    { identifier: 'nationalStrategicPlan' ,draft:0, public:0, workflow:0  },
                    { identifier: 'nationalReport',   draft:0, public:0, workflow:0         },
                    { identifier: 'otherReport',      draft:0, public:0, workflow:0         },
                    { identifier: 'nationalTarget',     draft:0, public:0, workflow:0       },
                    { identifier: 'nationalIndicator',  draft:0, public:0, workflow:0       },
                    { identifier: 'nationalAssessment',   draft:0, public:0, workflow:0     },
                    { identifier: 'nationalSupportTool',  draft:0, public:0, workflow:0     },
                    { identifier: 'implementationActivity'  ,draft:0, public:0, workflow:0   },
                    { identifier: 'resourceMobilisation'   ,public:0, draft:0, workflow:0 },
            ];

        //var nationalReportTypes = $http.get('/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms').then(function(response) { return response.data; });
        var cbdNBSAPs          = [   "B0EBAE91-9581-4BB2-9C02-52FCF9D82721"];// NBSAP

        var cbdNationalReports = [   "B3079A36-32A3-41E2-BDE0-65E4E3A51601", // NR5
                                     "272B0A17-5569-429D-ADF5-2A55C588F7A7", // NR4
                                     "DA7E04F1-D2EA-491E-9503-F7923B1FD7D4", // NR3
                                     "A49393CA-2950-4EFD-8BCC-33266D69232F", // NR2
                                     "F27DBC9B-FF25-471B-B624-C0F73E76C8B3"]; // NR1
        //==============================
        //
        //==============================
        $scope.isNationalUser = function(){
            return ($rootScope.user.roles.indexOf('ChmNationalFocalPoint') ||
                    $rootScope.user.roles.indexOf('ChmNationalAuthorizedUser') ||
                    $rootScope.user.roles.indexOf('Administrator') ||
                    $rootScope.user.roles.indexOf('ChmAdministrator')) && $rootScope.user && $rootScope.user.government;
        };

        $scope.government =  userGovernment();
        //==============================
        //
        //==============================
        function userGovernment() {

            if($rootScope.user && $rootScope.user.government){
                return $rootScope.user.government.toLowerCase();
            }
        }




        //==============================
        //
        //==============================
        $scope.load = function() {

                ////////////////
                // All 3 National Reports
                ////////////////
                var userGroups = [];
                  user.userGroups.map(function(group){
                      userGroups.push(solr.escape(group));
                  });

                var ownershipQuery = " AND (_ownership_s:"+userGroups.join(" OR _ownership_s:") + ')';

                var q = '(realm_ss:chm AND schema_s:nationalReport AND _latest_s:true ' +  ownershipQuery + ')';
                 var qsFacetParams =
                 {
                    "q"  : q,
                    "rows" : 0,
                   "facet":true,
                   "facet.mincount":1,
                   "facet.pivot":"reportType_s,_state_s"
                 };

                 var published     = $http.get('/api/v2013/index/select', { params : qsFacetParams});
                $q.when(published)
                  .then(function(result){
                   var pivotResult = result.data.facet_counts.facet_pivot['reportType_s,_state_s'];
                   console.log(pivotResult);
                   calculateFacet(pivotResult, 'publishCount');
                });

                ////////////////
                // All other schema
                ////////////////
                var filter = ['nationalAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity', 'resourceMobilisation'];
                var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")";

                 var qsOtherSchemaFacetParams =
                 {
                    "q"  : '(realm_ss:chm ' + qSchema + ' AND _latest_s:true ' +  ownershipQuery + ')',
                    "rows" : 0,
                   "facet":true,
                   "facet.mincount":1,
                   "facet.pivot":"schema_s,_state_s"
                 };

                 var OtherSchemaFacet     = $http.get('/api/v2013/index/select', { params : qsOtherSchemaFacetParams});

                $q.when(OtherSchemaFacet).then(function(results) {

                      var index=0;
                      _.each(results.data.facet_counts.facet_pivot['schema_s,_state_s'], function(facet){;
                        	var reportType = _.first(_.where($scope.schemasList, {'identifier':facet.value}));
                	        if(reportType)
                        	   facetSummation([facet],reportType);
                      });

                    }).then(null, function(error) {
                       console.log(error );
                   });

        };

        function calculateFacet(list, type){

            var qqNationalReports = _.filter(list, function(o) { return   _.contains(cbdNationalReports, o.value); });
            var qqNBSAPs          = _.filter(list, function(o) { return   _.contains(cbdNBSAPs,          o.value); });

            var others= cbdNationalReports.concat(cbdNBSAPs);
            var qqOthers          = _.filter(list, function(o) { return  !_.contains(others, o.value); });

            var nationalReport = _.where($scope.schemasList, {'identifier':'nationalReport'})[0];
            facetSummation(qqNationalReports,nationalReport);

           var nationalStrategicPlan = _.where($scope.schemasList, {'identifier':'nationalStrategicPlan'})[0];
            facetSummation(qqNBSAPs,nationalStrategicPlan);

            var otherReport = _.where($scope.schemasList, {'identifier':'otherReport'})[0];
            facetSummation(qqOthers,otherReport);

            console.log($scope.schemasList);

        }

        function facetSummation(reportFacets,reportType){
            _.each(reportFacets, function(facets){
                _.each(facets.pivot,function(facet){
                    reportType[facet.value] += facet.count;
                })
            });

        }

        $scope.load();

        $scope.getFacet = function(schema){
            return _.first(_.where($scope.schemasList,{"identifier":schema}));
        }



    }];
});
