define(['app', 'lodash', 'authentication', 'utilities/km-storage', 'utilities/km-workflows'], function() { 'use strict';

    return ['$scope', '$rootScope',"IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm",
     function($scope, $rootScope, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm) {


        $scope.schemasList = [
                    { identifier: 'nationalStrategicPlan'   },
                    { identifier: 'nationalReport',         },
                    { identifier: 'otherReport',            },
                    { identifier: 'nationalTarget',         },
                    { identifier: 'nationalIndicator',      },
                    { identifier: 'progressAssessment',     },
                    { identifier: 'nationalSupportTool',    },
                    { identifier: 'implementationActivity'  }
            ];

        var nationalReportTypes = $http.get('/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms').then(function(response) { return response.data; });
        var cbdNBSAPs          = ["B0EBAE91-9581-4BB2-9C02-52FCF9D82721"];// NBSAP
        var cbdNationalReports = ["B3079A36-32A3-41E2-BDE0-65E4E3A51601", // NR5
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
                var publisehdReportQuery = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.pivot=schema_s,reportType_s&fl=&facet.mincount=1&q=(realm_ss:chm AND schema_s:nationalReport '+
                    ')+AND+NOT+version_s:*&rows=0&wt=json');
                var draftReportQuery = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.pivot=schema_s,reportType_s&fl=&facet.mincount=1&q=(realm_ss:chm AND schema_s:nationalReport '+
                    ')+AND+version_s:*+AND+NOT+workflow_s:*&rows=0&wt=json');
                var requestReportQuery = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.pivot=schema_s,reportType_s&fl=&facet.mincount=1&q=(realm_ss:chm AND schema_s:nationalReport '+
                    ')+AND+version_s:*+AND+workflow_s:*&rows=0&wt=json');


                $q.all([publisehdReportQuery, draftReportQuery, requestReportQuery])
                  .then(function(result){

                    var pivotResult = result[0].data.facet_counts.facet_pivot['schema_s,reportType_s'];
                    if(pivotResult.length>0 && pivotResult[0].pivot){
                        calculateFacet(pivotResult[0].pivot, 'publishCount');
                    }

                    var pivotDraftResult = result[1].data.facet_counts.facet_pivot['schema_s,reportType_s'];
                    if(pivotDraftResult.length>0 && pivotDraftResult[0].pivot){
                        calculateFacet(pivotDraftResult[0].pivot, 'draftCount');
                    }

                    var pivotRequestResult = result[2].data.facet_counts.facet_pivot['schema_s,reportType_s'];
                    if(pivotRequestResult.length>0 && pivotRequestResult[0].pivot){
                        calculateFacet(pivotRequestResult[0].pivot, 'requestCount');
                    }
                });

                ////////////////
                // All other schema
                ////////////////
                var filter = ['progressAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity'];
                var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")";

                var published     = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.mincount=1&facet.field=schema_s&fl=&q=(realm_ss:chm '+
                                    qSchema + ')+AND+NOT+version_s:*&rows=0&wt=json');
                var drafts    	  = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.mincount=1&facet.field=schema_s&fl=&q=(realm_ss:chm '+
                                    qSchema + ')+AND+version_s:*+AND+NOT+workflow_s:*&rows=0&wt=json');
                var request    	  = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.mincount=1&facet.field=schema_s&fl=&q=(realm_ss:chm '+
                                    qSchema + ')+AND+version_s:*+AND+workflow_s:*&rows=0&wt=json');

                $q.all([published, drafts, request]).then(function(results) {

                  var index=0;
                  _.each(results, function(facets){
                      _.each(readFacets2(facets.data.facet_counts.facet_fields.schema_s), function(facet){

                            var schemaTypeFacet = _.where($scope.schemasList,{"identifier":facet.schema});

                            if(schemaTypeFacet.length>0){
                                if(index===0)
                                      schemaTypeFacet[0].publishCount = facet.count;
                                else if(index==1)
                                      schemaTypeFacet[0].draftCount = facet.count;
                                else if(index==2)
                                    schemaTypeFacet[0].requestCount = count;
                            }
                      });
                    index++;
                  });

                }).then(null, function(error) {
                   console.log(error );
               });

        };

        function readFacets2(solrArray) {
            var facets = [];
            if(solrArray){
                for (var i = 0; i < solrArray.length; i += 2) {
                    var facet = solrArray[i];
                    facets.push({ schema: facet, title: facet, count: solrArray[i + 1] });
                }
            }
            return facets;
        }

        function calculateFacet(list, type){

            var qqNationalReports = _.filter(list, function(o) { return   _.contains(cbdNationalReports, o.value); });
            var qqNBSAPs          = _.filter(list, function(o) { return   _.contains(cbdNBSAPs,          o.value); });

            var others= cbdNationalReports.concat($scope.cbdNBSAPs);
            var qqOthers          = _.filter(list, function(o) { return  !_.contains(others, o.value); });

            //summmation
            var publishNPCount      = _.reduce(qqNationalReports, function(memo,item){ return memo + item.count;},0);
            var publishNBSAPCount   = _.reduce(qqNBSAPs, function(memo,item){ return memo + item.count;},0);
            var publishOtherCount   = _.reduce(qqOthers, function(memo,item){ return memo + item.count;},0);

            _.where($scope.schemasList, {'identifier':'nationalReport'})[0][type] = publishNPCount;
            _.where($scope.schemasList, {'identifier':'nationalStrategicPlan'})[0][type] = publishNBSAPCount;
            _.where($scope.schemasList, {'identifier':'otherReport'})[0][type] = publishOtherCount;

        }

        $scope.load();

        $scope.getFacet = function(schema){
            return _.first(_.where($scope.schemasList,{"identifier":schema}));
        }



    }];
});
