define(['lodash','app',  'authentication', 'utilities/km-storage', 'utilities/km-workflows', "utilities/solr","services/realmConfig"], function(_) { 'use strict';

    return ['$scope', '$rootScope',"IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm","user","solr",'realmConfig',
     function($scope, $rootScope, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm, user, solr,realmConfig) {
         
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
            { identifier: 'lwEvent'                ,public:0, draft:0, workflow:0 },
            { identifier: 'lwProject'              ,public:0, draft:0, workflow:0 },
            { identifier: 'lwDonor'                ,public:0, draft:0, workflow:0 },
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


            var filter = ['nationalAssessment','nationalTarget','nationalIndicator','resourceMobilisation','resource','organization','caseStudy','marineEbsa','aichiTarget','strategicPlanIndicator','lwEvent','lwProject','lwDonor'];
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
            loadNBSAPSFacets ();
           loadOtherNRFacets ();
           loadNationalReportFacets();
        };// $scope.loadFacets = function(){
        
        function loadNBSAPSFacets (){
              
                        var qSchema = "(schema_s:nationalReport AND     reportType_s:("+solr.escape('B0EBAE91-9581-4BB2-9C02-52FCF9D82721') +") ";
                        var userGroups = [];
                            user.userGroups.map(function(group){
                                userGroups.push(solr.escape(group));
                            });
                        var ownershipQuery = " AND (_ownership_s:"+userGroups.join(" OR _ownership_s:") + ')';
                        //    var ownershipQuery = " AND (_ownership_s:user\:"+ user.userID + ')';
                        var q = qSchema +'AND (realm_ss:' + realm.toLowerCase() + ' OR (*:* NOT realm_ss:*))' +   ownershipQuery + ')';
            
                        var qsOtherSchemaFacetParams =
                        {
                            "q"  : q,
                            "rows" : 0,
                            "facet":true,
                        //   "facet.mincount":1,
                            "facet.field":"_state_s"
                         };
                        var OtherSchemaFacet     = $http.get('/api/v2013/index', { params : qsOtherSchemaFacetParams});
                        var schemaFacet = null;
                        $q.when(OtherSchemaFacet).then(function(results) {
//  
                        
                       schemaFacet= $scope.getFacet('nationalStrategicPlan');  
                      
                        var facetObj = formatFacets(results.data.facet_counts.facet_fields._state_s);                        
                        if(schemaFacet){
                            schemaFacet.workflow=facetObj.workflow;
                            schemaFacet.draft=facetObj.draft;
                            schemaFacet.public=facetObj.public;                           
                        }                               
       
                        }).then(null, function(error) {
                        console.log(error );
                        });
        }//loadNBSAPS
        
        function loadNationalReportFacets (){
               
                        var nr    = [ 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3',   //1st NR
                                    'A49393CA-2950-4EFD-8BCC-33266D69232F',   //2nd NR
                                    'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4',   //3rd NR
                                    '272B0A17-5569-429D-ADF5-2A55C588F7A7',   //4th NR
                                    'B3079A36-32A3-41E2-BDE0-65E4E3A51601'    //5th NR
                        ];
                        
                        var qSchema = "(schema_s:nationalReport AND     "+"reportType_s:("+ _(nr).map(solr.escape).values().join(' ') +")";
                        var userGroups = [];
                            user.userGroups.map(function(group){
                                userGroups.push(solr.escape(group));
                            });
                        var ownershipQuery = " AND (_ownership_s:"+userGroups.join(" OR _ownership_s:") + ')';
                        //    var ownershipQuery = " AND (_ownership_s:user\:"+ user.userID + ')';
                            var q = qSchema +'AND (realm_ss:' + realm.toLowerCase() + ' OR (*:* NOT realm_ss:*))' +   ownershipQuery + ')';
                
                            var qsOtherSchemaFacetParams =
                            {
                                "q"  : q,
                                "rows" : 0,
                                "facet":true,
                                "facet.field":"_state_s"
                            };
            
                        var OtherSchemaFacet     = $http.get('/api/v2013/index', { params : qsOtherSchemaFacetParams});
                        var schemaFacet = null;
                            $q.when(OtherSchemaFacet).then(function(results) {

                        
                       schemaFacet= $scope.getFacet('nationalReport');  

                        var facetObj = formatFacets(results.data.facet_counts.facet_fields._state_s);                        
                        if(schemaFacet){
                            schemaFacet.workflow=facetObj.workflow;
                            schemaFacet.draft=facetObj.draft;
                            schemaFacet.public=facetObj.public;                           
                        }   
                              
                    }).then(null, function(error) {
                    console.log(error );
                    });
        }//loadNBSAPS
        
        function loadOtherNRFacets (){
        
                var nbsap = [ 'B0EBAE91-9581-4BB2-9C02-52FCF9D82721' ]; //NBSAP
                var nr    = [ 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3',   //1st NR
                              'A49393CA-2950-4EFD-8BCC-33266D69232F',   //2nd NR
                              'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4',   //3rd NR
                              '272B0A17-5569-429D-ADF5-2A55C588F7A7',   //4th NR
                              'B3079A36-32A3-41E2-BDE0-65E4E3A51601'    //5th NR
                ];
           
                var qSchema = "(schema_s:nationalReport AND     "+"NOT reportType_s:("+ _(nbsap).union(nr).map(solr.escape).values().join('  ') +")";
                var userGroups = [];
                    user.userGroups.map(function(group){
                        userGroups.push(solr.escape(group));
                    });
                var ownershipQuery = " AND (_ownership_s:"+userGroups.join(" OR _ownership_s:") + ')';
        
                var q = qSchema +'AND (realm_ss:' + realm.toLowerCase() + ' OR (*:* NOT realm_ss:*))' +   ownershipQuery + ')';
        
                var qsOtherSchemaFacetParams =
                {
                    "q"  : q,
                    "rows" : 0,
                    "facet":true,
                    //   "facet.mincount":1,
                    "facet.field":"_state_s"
                };
                var OtherSchemaFacet     = $http.get('/api/v2013/index', { params : qsOtherSchemaFacetParams});
                var schemaFacet = null;
                
                $q.when(OtherSchemaFacet).then(function(results) {
        
                        
                        
                        schemaFacet= $scope.getFacet('otherReport'); 
                        var facetObj = formatFacets(results.data.facet_counts.facet_fields._state_s);                        
                        if(schemaFacet){
                            schemaFacet.workflow=facetObj.workflow;
                            schemaFacet.draft=facetObj.draft;
                            schemaFacet.public=facetObj.public;                           
                        }        
                    }).then(null, function(error) {
                    console.log(error );
                    });
        }//loadNBSAPS

        $scope.loadFacets();
 
        function formatFacets(facets){
            if(facets){
                var facetObject = {};
                _.each(facets,function(value,key){
                        if(value==='public')
                            facetObject.public = facets[key+1];
                        if(value==='draft')
                            facetObject.draft = facets[key+1];
                        if(value==='workflow')
                            facetObject.workflow = facets[key+1];
                });
                return facetObject;
            }
        }

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

        var isAdmin         = realmConfig.isAdministrator(user); //user.roles.indexOf('Administrator')>=0;
        var isNationalAdmin = realmConfig.isNFPCBD(user) || realmConfig.isChmNationalFocalPoint(user) || realmConfig.isChmNationalAuthorizedUser(user)>=0;

        $scope.enableNr = isAdmin || isNationalAdmin || realmConfig.isChmNrNationalFocalPoint(user) || realmConfig.isChmNrNationalAuthorizedUser(user);
        $scope.enableRm = isAdmin || isNationalAdmin || realmConfig.isChmRmFocalPoint(user) || realmConfig.isChmRmNAU(user);
     

    }];
});
