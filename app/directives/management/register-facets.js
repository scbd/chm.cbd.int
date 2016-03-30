define(['text!./register-facets.html', 'app', 'lodash', 'authentication', 'utilities/km-storage', 'utilities/km-workflows', './facet-bar'], function(template, app, _) { 'use strict';

app.directive('registerFacets', ['$rootScope', "$location", "IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm","IWorkflows","realmConfig",
                        function ($rootScope, $location, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm, IWorkflows,realmConfig) {
    return {
        priority: 0,
        restrict: 'E',
        template: template,
        replace: true,
        transclude: false,
        scope: {
        },
        link: function($scope) {
            $scope.documents = null;


            $scope.schemasList = [
                { identifier: 'nationalStrategicPlan',      title: 'National Biodiversity Strategies and Action Plans (NBSAPS)',  type:'nationalReports',  schema:"nationalReport" ,editType:"nbsap"  },
                { identifier: 'nationalReport',             title: 'National Reports',                         type:'nationalReports' , schema:"nationalReport"  ,editType:"nr" },
                { identifier: 'otherReport',                title: 'Other Reports',                            type:'nationalReports' , schema:"nationalReport" ,editType:"other"  },

                { identifier: 'aichiTarget',                title: 'Aichi Biodiversity Targets' ,              type:'Progress'  },
                { identifier: 'nationalTarget',             title: 'National Targets' ,                        type:'Progress'  },
                { identifier: 'nationalIndicator',          title: 'National Indicators' ,                     type:'Progress'  },

                { identifier: 'nationalSupportTool',        title: 'Guidance and Support Tools'  ,             type:'Activities'  },
                { identifier: 'implementationActivity',     title: 'Implementation Activities'  ,              type:'Activities'  },

                { identifier: 'resourceMobilisation',       title: 'Preliminary Reporting Framework' ,         type:'Finance'  },

                { identifier: 'resource',                   title: 'Virtual Library - CHM Resouces' ,          type:'Reference'  },
                { identifier: 'organization',               title: 'Biodiversity Related Organizations'  ,     type:'Reference'  },
                { identifier: 'capacityBuildingInitiative', title: 'Capacity-building Initiatives',            type:'Reference'  },
                { identifier: 'capacityBuildingResouce',    title: 'Capacity-building Resouces',               type:'Reference'  },

                { identifier: 'caseStudy',                  title: 'Case Studies'  ,                                                 type:'SCBD'  },
                { identifier: 'marineEbsa',                 title: 'Marine Ecologically or Biologically Significant Areas (EBSA)'  , type:'SCBD'  },
                //{ identifier: 'nationalAssessment',                title: 'Aichi Targets' ,                                                type:'SCBD'  },
                { identifier: 'strategicPlanIndicator',     title: 'Strategic Plan Indicators' ,                                    type:'SCBD'  },

                // { identifier: 'database',               title: 'National Database'  ,                   type:'SCBD'  },
                // { identifier: 'contact',                title: 'Contacts' },
            ];

            $rootScope.government = userGovernment();


            if($route.current.params.schema) {

                $scope.hideFilters = true;
                $scope.selectedSchemasList = [$route.current.params.schema];
            }

            $scope.loadScheduled = null;

            //open section based on url
            if($location.url().indexOf("/nationalStrategicPlan") >= 0 ||
               $location.url().indexOf("/nationalReport") >= 0 ||
               $location.url().indexOf("/otherReport") >= 0 ||
               $location.url().indexOf("/nationalAssessment") >= 0 ||
               $location.url().indexOf("/nationalTarget") >= 0 ||
               $location.url().indexOf("/nationalIndicator") >= 0 ||
               $location.url().indexOf("/nationalSupportTool") >= 0 ||
               $location.url().indexOf("/implementationActivity") >= 0 ||
               $location.url().indexOf("/resourceMobilisation") >= 0
            ){
                $scope.showNational = true;
            }
            //open section based on url
            if($location.url().indexOf("/resource") >= 0 ||
               $location.url().indexOf("/organization") >= 0 ||
               $location.url().indexOf("/capacityBuildingInitiative") >= 0 ||
               $location.url().indexOf("/capacityBuildingResource") >= 0) {
                   $scope.showReference = true;
            }

            //open section based on url
            if($location.url().indexOf("/marineEbsa") >= 0 ||
               $location.url().indexOf("/caseStudy") >= 0 ||
               $location.url().indexOf("/caseStudyHwb") >= 0 ||
               $location.url().indexOf("/aichiTarget") >= 0 ||
               $location.url().indexOf("/strategicPlanIndicator") >= 0
                ){
                $scope.showSCBD = true;
            }

            //==============================
            //
            //==============================
            $scope.isNationalUser = function(){

                    if( realmConfig.isChmNationalFocalPoint($rootScope.user) || //$rootScope.user.roles[i] == 'ChmNationalFocalPoint' ||
                        realmConfig.isChmNationalAuthorizedUser($rootScope.user) || //$rootScope.user.roles[i] == 'ChmNationalAuthorizedUser' ||
                        realmConfig.isAdministrato($rootScope.user) || //$rootScope.user.roles[i] == 'Administrator' ||
                        realmConfig.isChmAdministrator($rootScope.user) && $rootScope.user.government) //$rootScope.user.roles[i] == 'ChmAdministrator' && $rootScope.user.government)
                    {
                        return true;
                    }

                return false;
            };
            //==============================
            //
            //==============================
            $scope.isReferenceUser = function(){

                if(realmConfig.isUser($rootScope.user) )
                {
                    return true;
                }

                return false;
            };
            //==============================
            //
            //==============================
            $scope.isSCBDUser = function(){

                if(realmConfig.isScbdStaff($rootScope.user))
                {
                    return true;
                }

                return false;
            };

            //==============================
            //
            //==============================
            $scope.search = function() {
                if($scope.loadScheduled)
                    $timeout.cancel($scope.loadScheduled);

                $scope.loadScheduled = $timeout(function () { $scope.load(); }, 200);
            };

            //==============================
            //
            //==============================
            function userGovernment() {

                // if($scope.isAdmin() && $scope.government)
                //      return $scope.government.toLowerCase();

                if($rootScope.user.government){
                    $scope.showNational = true;
                    return $rootScope.user.government.toLowerCase();
                }
                return '';
            }

            $scope.countries          = $http.get('/api/v2013/countries').then(function(response) { return response.data; });
            $scope.nationalReportTypes = $http.get('/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms').then(function(response) { return response.data; });
            $scope.cbdNBSAPs          = ["B0EBAE91-9581-4BB2-9C02-52FCF9D82721"];// NBSAP
            $scope.cbdNationalReports = ["B3079A36-32A3-41E2-BDE0-65E4E3A51601", // NR5
                                         "272B0A17-5569-429D-ADF5-2A55C588F7A7", // NR4
                                         "DA7E04F1-D2EA-491E-9503-F7923B1FD7D4", // NR3
                                         "A49393CA-2950-4EFD-8BCC-33266D69232F", // NR2
                                         "F27DBC9B-FF25-471B-B624-C0F73E76C8B3"]; // NR1


            //==============================
            //
            //==============================
            $scope.load = function() {
                // console.log(userGovernment(),authentication.user())


                if(userGovernment() || $scope.government){
                    ////////////////
                    // All 3 National Reports
                    ////////////////
                    var publisehdReportQuery = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.pivot=schema_s,reportType_s&fl=&q=(realm_ss:chm AND schema_s:nationalReport '+
                    'AND government_s:' + (userGovernment()  || $scope.government.toLowerCase())+ ')+AND+NOT+version_s:*&rows=0&wt=json');
                    var draftReportQuery = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.pivot=schema_s,reportType_s&fl=&q=(realm_ss:chm AND schema_s:nationalReport '+
                    'AND government_s:' + (userGovernment()  || $scope.government.toLowerCase()) + ')+AND+version_s:*&rows=0&wt=json');


                    $q.all([publisehdReportQuery,draftReportQuery]).then(function(result){

                        var pivotResult = result[0].data.facet_counts.facet_pivot['schema_s,reportType_s'];

                        if(pivotResult.length>0 && pivotResult[0].pivot){
                            calculateFacet(pivotResult[0].pivot, 'publishCount');
                        }

                        var pivotDraftResult = result[1].data.facet_counts.facet_pivot['schema_s,reportType_s'];
                        if(pivotDraftResult.length>0 && pivotDraftResult[0].pivot){
                            calculateFacet(pivotDraftResult[0].pivot, 'draftCount');
                        }
                    });

                    ////////////////
                    // All other schema
                    ////////////////
                    var filter = ['nationalAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity','resourceMobilisation'];
                    var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")";
                    var published     = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.field=schema_s&fl=&fq=(realm_ss:chm '+
                                        'AND government_s:' + (userGovernment()  || $scope.government.toLowerCase()) + qSchema + ')+AND+NOT+version_s:*&rows=0&wt=json');
                    var drafts    	  = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.field=schema_s&fl=&q=(realm_ss:chm '+
                                        'AND government_s:' + (userGovernment()  || $scope.government.toLowerCase()) + qSchema + ')+AND+version_s:*&rows=0&wt=json');
                    // var requests      = storage.documentQuery.facets(filter,{collection:"request"});
                    $q.all([published, drafts]).then(function(results) {

                      var index=0;
                      _.each(results, function(facets){
                          _.each(readFacets2(facets.data.facet_counts.facet_fields.schema_s), function(facet){

                                var schemaTypeFacet = _.where($scope.schemasList,{"identifier":facet.schema});

                                if(schemaTypeFacet.length>0){
                                    if(schemaTypeFacet[0].type=='SCBD' || schemaTypeFacet[0].type=='Reference' || schemaTypeFacet[0].type=='nationalReports')
                                        return;
                                    if(index===0)
                                          schemaTypeFacet[0].publishCount = facet.count;
                                    else if(index==1)
                                          schemaTypeFacet[0].draftCount = facet.count;
                                    // else if(index==2)
                                    //     schemaTypeFacet[0].requestCount = count;
                                }
                          });
                        index++;
                      });

                    }).then(null, function(error) {
                       console.log(error );
                   });
                }

            };


            $scope.loadVLRFacets = function(){
                var filter = "filter=resource,organization,caseStudy,marineEbsa,aichiTarget,strategicPlanIndicator,capacityBuildingInitiative,capacityBuildingResource";
                var published     = storage.documentQuery.facets(filter,{collection:"my"});
                var drafts    	  = storage.documentQuery.facets(filter,{collection:"mydraft"});
                var requests      = storage.documentQuery.facets(filter,{collection:"request"});
                $q.all([published, drafts, requests]).then(function(results) {

                  var index=0;

                  _.each(results, function(facets){
                      _.each(facets.data, function(count, format){
                          if(_.indexOf(["resource","organization","capacityBuildingInitiative","caseStudy","marineEbsa","aichiTarget","strategicPlanIndicator","capacityBuildingResource"],format)>=0){
                                var schemaTypeFacet = _.where($scope.schemasList,{"identifier":format});
                                if(schemaTypeFacet.length>0){
                                    if(index===0)
                                          schemaTypeFacet[0].publishCount = count;
                                    else if(index==1)
                                          schemaTypeFacet[0].draftCount = count;
                                    else if(index==2)
                                        schemaTypeFacet[0].requestCount = count;
                                }
                            }
                      });
                    index++;
                  });
                  //

                }).then(null, function(error) {
                   console.log(error );
               });

            };

            $scope.loadRequestsCount = function(){
                var myUserID = $rootScope.user.userID;
                var query    = {
                    $and : [
                        { "activities.assignedTo" : myUserID },
                        { closedOn : { $exists : false } },
                        { "data.realm" : realm.value }
                    ]
                };

                IWorkflows.query(query).then(function(workflows){
                    $scope.requestCount = workflows.length;
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

                var qqNationalReports = _.filter(list, function(o) { return   _.contains($scope.cbdNationalReports, o.value); });
                var qqNBSAPs          = _.filter(list, function(o) { return   _.contains($scope.cbdNBSAPs,          o.value); });

                var others= $scope.cbdNationalReports.concat($scope.cbdNBSAPs);
                var qqOthers          = _.filter(list, function(o) { return  !_.contains(others, o.value); });

                //summmation
                var publishNPCount      = _.reduce(qqNationalReports, function(memo,item){ return memo + item.count;},0);
                var publishNBSAPCount   = _.reduce(qqNBSAPs, function(memo,item){ return memo + item.count;},0);
                var publishOtherCount   = _.reduce(qqOthers, function(memo,item){ return memo + item.count;},0);

                _.where($scope.schemasList, {'identifier':'nationalReport'})[0][type] = publishNPCount;
                _.where($scope.schemasList, {'identifier':'nationalStrategicPlan'})[0][type] = publishNBSAPCount;
                _.where($scope.schemasList, {'identifier':'otherReport'})[0][type] = publishOtherCount;

                //console.log($scope.schemasList)
            }

            $scope.load();
            $scope.loadVLRFacets();
            $scope.loadRequestsCount();

            $scope.nationalReportsFilter = function(entity){
                return entity && entity.type=='nationalReports';
            };
            $scope.nationalProgressFilter = function(entity){
                return entity && entity.type=='Progress';
            };
            $scope.nationalActivitiesFilter = function(entity){
                return entity && entity.type=='Activities';
            };
            $scope.nationalReferenceFilter = function(entity){
                return entity && entity.type=='Reference';
            };
            $scope.nationalSCBDFilter = function(entity){
                return entity && entity.type=='SCBD';
            };
            $scope.nationalFinanceFilter = function(entity){
                return entity && entity.type=='Finance';
            };
        }
    };
}]);
});
