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

            var filter = "filter=progressAssessment,nationalTarget,nationalIndicator,nationalSupportTool,implementationActivity,resourceMobilisation,nationalReport,resource,organization,caseStudy,marineEbsa,aichiTarget,strategicPlanIndicator";
            var published     = storage.documentQuery.facets(filter,{collection:"my"});
            var drafts    	  = storage.documentQuery.facets(filter,{collection:"mydraft"});
            var requests      = storage.documentQuery.facets(filter,{collection:"request"});
            $q.all([published, drafts, requests]).then(function(results) {

              var index=0;
              console.log(results)
              _.each(results, function(facets){
                  _.each(facets.data, function(count, format){
                        // add all schema's under national report
                        if(_.indexOf(['progressAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity'])>0){
                            format = 'nationalReport'
                        }
                        var schemaTypeFacet = _.where($scope.schemasList,{"identifier":format});
                        if(schemaTypeFacet.length>0){
                            if(index===0)
                                  schemaTypeFacet[0].publishCount += count;
                            else if(index==1)
                                  schemaTypeFacet[0].draftCount += count;
                            else if(index==2)
                                schemaTypeFacet[0].requestCount += count;
                        }
                  });
                index++;
            });

            }).then(null, function(error) {
               console.log(error );
           });

        };

        $scope.loadFacets();

        $scope.getFacet = function(schema){
            return _.first(_.where($scope.schemasList,{"identifier":schema}));
        }

    }];
});
