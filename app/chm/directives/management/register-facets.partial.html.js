angular.module('kmApp').compileProvider // lazy
.directive("registerFacets", [function () {
    return {
        priority: 0,
        restrict: 'EAC',
        templateUrl: '/app/views/management/register-facets.partial.html',
        replace: true,
        transclude: false,
        scope: {
        },
        link: function($scope) {
            $scope.documents = null;


            $scope.schemasList = [
                { identifier: 'nationalReports',         title: ' National Biodiversity Strategies and Action Plans (NBSAPS)',  type:'nationalReports'  },
                { identifier: 'otherNationalReports',    title: 'Other Reprots',                         type:'nationalReports'  },
                { identifier: 'nbsapNationalReports',    title: 'National Other Reports',                type:'nationalReports'  },

                { identifier: 'progressAssessment',     title: 'Aichi Biodiversity Targets' ,           type:'Progress'  },
                { identifier: 'nationalTarget',         title: 'National Targets' ,                     type:'Progress'  },
                { identifier: 'nationalIndicator',      title: 'National Indicators' ,                  type:'Progress'  },

                { identifier: 'nationalSupportTool',    title: 'Guidance and Support Tools'  ,          type:'Activities'  },
                { identifier: 'implementationActivity', title: 'Implementation Activities'  ,           type:'Activities'  },

                { identifier: 'resourceMobilisation',   title: 'Preliminary Reporting Framework' ,      type:'finance'  },

                { identifier: 'resource',               title: 'Virtual Library - CHM Resouces' ,             type:'Reference'  },
                { identifier: 'organization',           title: 'Biodiversity Related Organizations'  ,  type:'Reference'  },

                { identifier: 'caseStudy',              title: 'Case Studies'  ,                                                 type:'SCBD'  },
                { identifier: 'marineEbsa',             title: 'Marine Ecologically or Biologically Significant Areas (EBSA)'  , type:'SCBD'  },
                { identifier: 'aichiTarget',            title: 'Aichi Targets' ,                                                type:'SCBD'  },
                { identifier: 'strategicPlanIndicator', title: 'Strategic Plan Indicators' ,                                    type:'SCBD'  },

                // { identifier: 'database',               title: 'National Database'  ,                   type:'SCBD'  },
                // { identifier: 'contact',                title: 'Contacts' },
            ];
        },
        controller : ['$scope', "$location", "IStorage", "schemaTypes", '$timeout', '$route','authHttp','authentication','$q',
         function ($scope, $location, storage, schemaTypes, $timeout, $route,$http,authentication, $q)
        {

            if($route.current.params.schema) {

                $scope.hideFilters = true
                $scope.selectedSchemasList = [$route.current.params.schema];
            }

            $scope.loadScheduled = null;

            //==============================
            //
            //==============================
            $scope.search = function() {
                if($scope.loadScheduled)
                    $timeout.cancel($scope.loadScheduled);

                $scope.loadScheduled = $timeout(function () { $scope.load(); }, 200);
            }
            function userGovernment() {
                if(authentication.user().government)
                    return authentication.user().government.toLowerCase();
            }

            $scope.countries          = $http.get('/api/v2013/countries').then(function(response) { return response.data; });
            $scope.nationalReportTypes = $http.get('/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms').then(function(response) { return response.data; });
            $scope.cbdNBSAPs          = ["B0EBAE91-9581-4BB2-9C02-52FCF9D82721"];// NBSAP
            $scope.cbdNationalReports = ["B3079A36-32A3-41E2-BDE0-65E4E3A51601", // NR5
                                         "272B0A17-5569-429D-ADF5-2A55C588F7A7", // NR4
                                         "DA7E04F1-D2EA-491E-9503-F7923B1FD7D4", // NR3
                                         "A49393CA-2950-4EFD-8BCC-33266D69232F", // NR2
                                         "F27DBC9B-FF25-471B-B624-C0F73E76C8B"]; // NR1


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
                            calculateFacet(pivotResult[0].pivot, 'publishCount');
                            calculateFacet(pivotResult[0].pivot, 'publishCount');
                        }

                        var pivotDraftResult = result[1].data.facet_counts.facet_pivot['schema_s,reportType_s'];
                        if(pivotDraftResult.length>0 && pivotDraftResult[0].pivot){
                            calculateFacet(pivotDraftResult[0].pivot, 'draftCount');
                            calculateFacet(pivotDraftResult[0].pivot, 'draftCount');
                            calculateFacet(pivotDraftResult[0].pivot, 'draftCount');
                        }
                        console.log($scope.schemasList)
                    });

                    ////////////////
                    // All other schema
                    ////////////////
                    var filter = ['progressAssessment','nationalTarget','nationalIndicator','nationalSupportTool','implementationActivity','resourceMobilisation'];
                    var qSchema = " AND (schema_s:" +  filter.join(" OR schema_s:") + ")"
                    var published     = $http.get('/api/v2013/index/select?facet=true&facet.limit=512&facet.field=schema_s&fl=&q=(realm_ss:chm '+
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
                                    if(schemaTypeFacet[0].type=='SCBD' || schemaTypeFacet[0].type=='Reference')
                                        return;
                                    if(index==0)
                                          schemaTypeFacet[0].publishCount = facet.count;
                                    else if(index==1)
                                          schemaTypeFacet[0].draftCount = facet.count;
                                    // else if(index==2)
                                    //     schemaTypeFacet[0].requestCount = count;
                                }
                          })
                        index++;
                      });

                    }).then(null, function(error) {
                       console.log(error );
                    })
                }

            }

            function loadVLRFacets(){
                var filter = "filter=resource,organization,caseStudy,marineEbsa,aichiTarget,strategicPlanIndicator";
                var published     = storage.documentQuery.facets(filter,{collection:"my"});
                var drafts    	  = storage.documentQuery.facets(filter,{collection:"mydraft"});
                var requests      = storage.documentQuery.facets('',{collection:"request"});
                $q.all([published, drafts, requests]).then(function(results) {

                  var index=0;
                //   console.log(results)
                  _.each(results, function(facets){
                      _.each(facets.data, function(count, format){

                            var schemaTypeFacet = _.where($scope.schemasList,{"identifier":format});
                            //console.log(schemaTypeFacet,format);
                            if(schemaTypeFacet.length>0){
                                if(index==0)
                                      schemaTypeFacet[0].publishCount = count;
                                else if(index==1)
                                      schemaTypeFacet[0].draftCount = count;
                                else if(index==2)
                                    schemaTypeFacet[0].requestCount = count;
                            }
                      })
                    index++;
                  });
                  //

                }).then(null, function(error) {
                   console.log(error );
                })

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
            };

            function calculateFacet(list, type){

                var qqNationalReports = _.filter(list, function(o) { return   _.contains($scope.cbdNationalReports, o.value); });
                var qqNBSAPs          = _.filter(list, function(o) { return   _.contains($scope.cbdNBSAPs,          o.value); });
                var qqOthers          = _.filter(list, function(o) { return  !(_.contains($scope.cbdNationalReports, o.value) || _.contains($scope.cbdNBSAPs, o.value)); });

                //summmation
                var publishNPCount      = _.reduce(qqNationalReports, function(memo,item){ return memo + item.count;},0)
                var publishNBSAPCount   = _.reduce(qqNBSAPs, function(memo,item){ return memo + item.count;},0)
                var publishOtherCount      = _.reduce(qqOthers, function(memo,item){ return memo + item.count;},0)

                _.where($scope.schemasList, {'identifier':'nationalReports'})[0][type] = publishNPCount;
                _.where($scope.schemasList, {'identifier':'nbsapNationalReports'})[0][type] = publishNBSAPCount;
                _.where($scope.schemasList, {'identifier':'otherNationalReports'})[0][type] = publishOtherCount;


            }

            $scope.getFacet = function(schema, type) {

                var schemaTypeFacet = _.where($scope.schemasList,{"identifier":schema});
                if(schemaTypeFacet.length>0){
                    return _.pluck(schemaTypeFacet, type) || '';
                }
            }

            $scope.load();
            loadVLRFacets();

            $scope.nationalReportsFilter = function(entity){
                return entity && entity.type=='nationalReports';
            }
            $scope.nationalProgressFilter = function(entity){
                return entity && entity.type=='Progress';
            }
            $scope.nationalActivitiesFilter = function(entity){
                return entity && entity.type=='Activities';
            }
            $scope.nationalReferenceFilter = function(entity){
                return entity && entity.type=='Reference';
            }
            $scope.nationalSCBDFilter = function(entity){
                return entity && entity.type=='SCBD';
            }

            $scope.$watch('government', function(newVal, oldVal){
                if(newVal && newVal!=oldVal){
                    _.each($scope.schemasList, function(schema){
                        if(schema.type=='SCBD' || schema.type=='Reference')
                            return;

                        if(schema.publishCount)
                            schema.publishCount = undefined;
                        if(schema.draftCount)
                            schema.draftCount = undefined;
                        if(schema.requestCount)
                            schema.requestCount = undefined;
                    })
                    $scope.load();
                }
            })

        }]
    }
}]);
;
