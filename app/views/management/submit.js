define(['lodash','app',  'authentication', 'utilities/km-storage', 'utilities/km-workflows', "utilities/solr"], function(_) { 'use strict';

    return ['$scope', '$rootScope',"IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm","user","solr",
     function($scope, $rootScope, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm, user, solr) {

        $scope.schemasList = [
            { identifier: 'nationalReport'         ,public:0, draft:0, workflow:0 },
            { identifier: 'aichiTarget'            ,public:0, draft:0, workflow:0 },
            { identifier: 'resource'               ,public:0, draft:0, workflow:0 },
            { identifier: 'organization'           ,public:0, draft:0, workflow:0 },
            { identifier: 'caseStudy'              ,public:0, draft:0, workflow:0 },
            { identifier: 'marineEbsa'             ,public:0, draft:0, workflow:0 },
            { identifier: 'strategicPlanIndicator' ,public:0, draft:0, workflow:0 },
            { identifier: 'absch'                  ,public:0, draft:0, workflow:0 },
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
            var absSchemas = [ "absPermit", "absCheckpoint", "absCheckpointCommunique", "authority", "measure", "database", "resource"]
            
            var qsABSFacetParams =
            {
                "q"  : '(realm_ss:abs AND '+'(schema_s:' +  absSchemas.join(" OR schema_s:") + ')) AND NOT version_s:*',
                "rows" : 0,
               "facet":true,
               "facet.mincount":1,
               "facet.field":"realm_ss"
            };
            var publisehdReportQuery = $http.get('/api/v2013/index/select', { params : qsABSFacetParams});

            $q.when(publisehdReportQuery)
            .then(function(results){
                var abs = _.first(_.where($scope.schemasList,{"identifier":"absch"}));

                var publishCount    = readFacets2(results.data.facet_counts.facet_fields.realm_ss)
                abs.publishCount    = publishCount ? publishCount[0].count : 0;

            });

            ////////////////
            // CHM Facets
            ///////////////

            
            var filter = ['progressAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity','resourceMobilisation','nationalReport','resource','organization','caseStudy','marineEbsa','aichiTarget','strategicPlanIndicator'];
            var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")";
            
              // Apply ownership
              var userGroups = [];
              user.userGroups.map(function(group){
                  userGroups.push(solr.escape(group));
              });
           
            var ownershipQuery = " AND (_ownership_s:"+userGroups.join(" OR _ownership_s:") + ')';
            var q = '(realm_ss:chm ' + qSchema + ownershipQuery + ')';
        	
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
                        if(_.indexOf(['progressAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity', 'resourceMobilisation',],schema)>=0){
                            schema = 'nationalReport';
                        }
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
            return _.first(_.where($scope.schemasList,{"identifier":schema}));
        }
        
        var isAdmin         = user.roles.indexOf('Administrator')>=0;
        var isNationalAdmin = user.roles.indexOf('NFP-CBD')>=0 || user.roles.indexOf('ChmNationalFocalPoint')>=0 || user.roles.indexOf('ChmNationalAuthorizedUser')>=0;

        $scope.enableNr = isAdmin || isNationalAdmin || user.roles.indexOf('ChmNrNationalFocalPoint')>=0 || user.roles.indexOf('ChmNrNationalAuthorizedUser')>=0;
        $scope.enableRm = isAdmin || isNationalAdmin || user.roles.indexOf('ChmRmFocalPoint')>=0 || user.roles.indexOf('ChmRmNAU')>=0;
    }];
});
