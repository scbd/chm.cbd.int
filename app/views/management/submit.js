define(['lodash','app',  'authentication', 'utilities/km-storage', 'utilities/km-workflows', "utilities/solr"], function(_) { 'use strict';

    return ['$scope', '$rootScope',"IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm","user","solr",
     function($scope, $rootScope, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm, user, solr) {

        $scope.schemasList = [
            { identifier: 'nationalReport'         ,public:0, draft:0, workflow:0 },
            { identifier: 'nationalStrategicPlan'  ,public:0, draft:0, workflow:0 },
            { identifier: 'otherReport'            ,public:0, draft:0, workflow:0 },
            { identifier: 'resourceMobilisation'   ,public:0, draft:0, workflow:0 },
            { identifier: 'nationalTarget'         ,public:0, draft:0, workflow:0 },
            { identifier: 'nationalAssessment'     ,public:0, draft:0, workflow:0 },
            { identifier: 'nationalIndicator'      ,public:0, draft:0, workflow:0 },
            { identifier: 'aichiTarget'            ,public:0, draft:0, workflow:0 },
            { identifier: 'resource'               ,public:0, draft:0, workflow:0 },
            { identifier: 'organization'           ,public:0, draft:0, workflow:0 },
            { identifier: 'caseStudy'              ,public:0, draft:0, workflow:0 },
            { identifier: 'marineEbsa'             ,public:0, draft:0, workflow:0 },
            { identifier: 'strategicPlanIndicator' ,public:0, draft:0, workflow:0 },
            { identifier: 'absch'                  ,public:0, draft:0, workflow:0 },
            { identifier: 'authority'              ,public:0, draft:0, workflow:0 },
            { identifier: 'measure'                ,public:0, draft:0, workflow:0 },
            { identifier: 'database'               ,public:0, draft:0, workflow:0 },
            { identifier: 'absPermit'              ,public:0, draft:0, workflow:0 },
            { identifier: 'absCheckpoint'          ,public:0, draft:0, workflow:0 },
            { identifier: 'absCheckpointCommunique',public:0, draft:0, workflow:0 },
            { identifier: 'measure'                ,public:0, draft:0, workflow:0 },
            { identifier: 'authority'              ,public:0, draft:0, workflow:0 },
            { identifier: 'bch'                    ,public:0, draft:0, workflow:0 },
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

            ////////////////
            // ABS Facets
            ///////////////

            var publishedQuery  = $http.get("/api/v2013/documents/query/facets", { params : {collection:"my",      realm:'ABS-DEV'}});
            var draftQuery      = $http.get("/api/v2013/documents/query/facets", { params : {collection:"mydraft", realm:'ABS-DEV'}});
            var requestQuery    = $http.get("/api/v2013/documents/query/facets", { params : {collection:"request", realm:'ABS-DEV'}});

            $q.all([publishedQuery,draftQuery,requestQuery])
            .then(function(results){
                var index=0;
        		  _.each(results, function(facets){
        			  _.each(facets.data, function(count, format){
                            if(format == 'resource')
                                return;

        					var schemaTypeFacet = _.find($scope.schemasList,{identifier:format});
        					if(schemaTypeFacet){
        						if(index===0)
        						  	schemaTypeFacet.public = count;
        			            else if(index==1)
        						  	schemaTypeFacet.draft = count;
        			            else if(index==2)
        							schemaTypeFacet.request = count;
        					}
        			  });
        			index++;
        		  });
            });

            ////////////////
            // CHM Facets
            ///////////////


            var filter = ['nationalAssessment','nationalTarget','nationalIndicator','resourceMobilisation','nationalReport','resource','organization','caseStudy','marineEbsa','aichiTarget','strategicPlanIndicator'];
            var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")";

              // Apply ownership
              var userGroups = [];
              user.userGroups.map(function(group){
                  userGroups.push(solr.escape(group));
              });

            var ownershipQuery = " AND (_ownership_s:"+userGroups.join(" OR _ownership_s:") + ')';
            var q = '(realm_ss:' + realm.toLowerCase() + ' ' + qSchema + ownershipQuery + ')';

            var qsOtherSchemaFacetParams =
             {
                "q"  : q,
                "rows" : 0,
               "facet":true,
               "facet.mincount":1,
               "facet.pivot":"schema_s,_state_s"
             };

             var OtherSchemaFacet     = $http.get('/api/v2013/index/select', { params : qsOtherSchemaFacetParams});

            $q.when(OtherSchemaFacet).then(function(results) {

                  _.each(results.data.facet_counts.facet_pivot['schema_s,_state_s'], function(facet){
                       var schema = facet.value;
                        // if(_.indexOf(['resourceMobilisation'],schema)>=0){
                        //     schema = 'nationalReport';
                        // }

                        // if(_.indexOf(['nationalTarget','nationalIndicator'],schema)>=0){
                        //     schema = 'nationalAssessment';
                        // }

                    	var reportType = _.first(_.where($scope.schemasList, {'identifier':schema}));
            	        if(reportType)
                    	   facetSummation(facet,reportType);
                  });

            }).then(null, function(error) {
               console.log(error );
            });
        };

        $scope.loadFacets();

        function facetSummation(facets,reportType){
            _.each(facets.pivot,function(facet){
                reportType[facet.value] += facet.count;
            });

        }
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
            return _.find($scope.schemasList,{"identifier":schema});
        }

        var isAdmin         = user.roles.indexOf('Administrator')>=0;
        var isNationalAdmin = user.roles.indexOf('NFP-CBD')>=0 || user.roles.indexOf('ChmNationalFocalPoint')>=0 || user.roles.indexOf('ChmNationalAuthorizedUser')>=0;

        $scope.enableNr = isAdmin || isNationalAdmin || user.roles.indexOf('ChmNrNationalFocalPoint')>=0 || user.roles.indexOf('ChmNrNationalAuthorizedUser')>=0;
        $scope.enableRm = isAdmin || isNationalAdmin || user.roles.indexOf('ChmRmFocalPoint')>=0 || user.roles.indexOf('ChmRmNAU')>=0;
    }];
});
