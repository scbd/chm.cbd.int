define(['app', 'lodash', 'authentication', 'utilities/km-storage', 'utilities/km-workflows'], function() { 'use strict';

    return ['$scope', '$rootScope',"IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm",
     function($scope, $rootScope, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm) {

        $scope.schemasList = [
            { identifier: 'nationalReport'         ,publishCount:0, draftCount:0, requestCount:0 },
            { identifier: 'aichiTarget'            ,publishCount:0, draftCount:0, requestCount:0 },
            { identifier: 'resourceMobilisation'   ,publishCount:0, draftCount:0, requestCount:0     },
            { identifier: 'resource'               ,publishCount:0, draftCount:0, requestCount:0     },
            { identifier: 'organization'           ,publishCount:0, draftCount:0, requestCount:0    },
            { identifier: 'caseStudy'              ,publishCount:0, draftCount:0, requestCount:0    },
            { identifier: 'marineEbsa'             ,publishCount:0, draftCount:0, requestCount:0   },
            { identifier: 'strategicPlanIndicator' ,publishCount:0, draftCount:0, requestCount:0   },
            { identifier: 'absch'                  ,publishCount:0, draftCount:0, requestCount:0   },
            { identifier: 'bch'                    ,publishCount:0, draftCount:0, requestCount:0   },
        ];

        $scope.government = userGovernment();

        $scope.loadScheduled = null;

        //==============================
        //
        //==============================
        function userGovernment() {
            if($rootScope.user.government){
                $scope.showNational = true;
                return $rootScope.user.government.toLowerCase();
            }
        }

        $scope.loadFacets = function(){

            var absSchemas = [ "absPermit", "absCheckpoint", "absCheckpointCommunique", "authority", "measure", "database", "resource"]

            var publisehdReportQuery = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.field=realm_ss&fl=&facet.mincount=1&q=(realm_ss:abs AND '+
            '(schema_s:' +  absSchemas.join(" OR schema_s:") + '))+AND+NOT+version_s:*&rows=0&wt=json');

            $q.when(publisehdReportQuery)
            .then(function(results){
                var abs = _.first(_.where($scope.schemasList,{"identifier":"absch"}));

                var publishCount    = readFacets2(results.data.facet_counts.facet_fields.realm_ss)
                abs.publishCount    = publishCount ? publishCount[0].count : 0;

            });


            var filter = ['progressAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity','resourceMobilisation','nationalReport','resource','organization','caseStudy','marineEbsa','aichiTarget','strategicPlanIndicator'];
            var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")";

            var published     = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.mincount=1&facet.field=schema_s&fl=&q=(realm_ss:chm '+
                                qSchema + ')+AND+NOT+version_s:*&rows=0&wt=json');
            var drafts    	  = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.mincount=1&facet.field=schema_s&fl=&q=(realm_ss:chm '+
                                qSchema + ')+AND+version_s:*+AND+NOT+workflow_s:*&rows=0&wt=json');
            var request    	  = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.mincount=1&facet.field=schema_s&fl=&q=(realm_ss:chm '+
                                qSchema + ')+AND+version_s:*+AND+workflow_s:*&rows=0&wt=json');

            $q.all([published, drafts, request])
            .then(function(results) {

              var index=0;
              _.each(results, function(facets){
                  _.each(readFacets2(facets.data.facet_counts.facet_fields.schema_s), function(facet){
                        // add all schema's under national report
                        if(_.indexOf(['progressAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity'])>0){
                          format = 'nationalReport'
                        }
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

          })
          .catch(function(error) {
               console.log(error );
          });

        };

        $scope.loadFacets();

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

        $scope.getFacet = function(schema){
            return _.first(_.where($scope.schemasList,{"identifier":schema}));
        }

    }];
});
