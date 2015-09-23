define(['lodash', 'app', 'authentication', 'utilities/km-storage', 'utilities/km-workflows', "utilities/solr"], function(_) { 'use strict';

    return ['$scope', '$rootScope',"IStorage", "schemaTypes", '$timeout', '$route','$http','authentication','$q',"realm","user","solr", 'navigation', '$mdDialog', '$location','realmConfig',
     function($scope, $rootScope, storage, schemaTypes, $timeout, $route,$http, authentication, $q, realm,user,solr, navigation, $mdDialog, $location,realmConfig) {

         $scope.displayStyle='table';
         $scope.showSubmissionSection = true;
         $scope.showProgressSection = true;

         $scope.onDelete    = del;
         $scope.onEdit      = edit;
         $scope.onWorkflow  = viewWorkflow;
         $scope.how_past_assessments=false;

        $scope.schemasList = [
                    { identifier: 'nationalStrategicPlan',  draft:0, public:0, workflow:0  },
                    { identifier: 'nationalReport',   draft:0, public:0, workflow:0         },
                    { identifier: 'otherReport',      draft:0, public:0, workflow:0         },
                    { identifier: 'nationalTarget',     draft:0, public:0, workflow:0       },
                    { identifier: 'nationalIndicator',  draft:0, public:0, workflow:0       },
                    { identifier: 'nationalAssessment',   draft:0, public:0, workflow:0     },
                    { identifier: 'nationalSupportTool',  draft:0, public:0, workflow:0     },
                    { identifier: 'implementationActivity',  draft:0, public:0, workflow:0   },
                    { identifier: 'resourceMobilisation',   draft:0 ,public:0, workflow:0 },
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
            return $rootScope.user && $rootScope.user.government && (realmConfig.isChmNationalFocalPoint($rootScope.user) 
                        || realmConfig.isChmNationalAuthorizedUser($rootScope.user)
                        || realmConfig.isAdministrato($rootScope.user) 
                        || realmConfig.isChmAdministrator($rootScope.user));
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


        //======================================================
        //
        //
        //======================================================
        function loadNationalTargets() {

            $scope.loading = true;

            $q.when(loadRecords({schema:'nationalTarget'}))
            .then(function(data){
                if(data){

                    $scope.nationalTargets = data;

                    _.each($scope.nationalTargets, function(target){

                        loadRecords({schema:'nationalAssessment',nationaTargetId:target.identifier_s})
                        .then(function(data){

                             target.assessments = data;

                            // target.assessment = _.first(data)
                            // target.pastAssessments = data;
                            // console.log(target.assessment);
                        });

                    });
                }
            })
            .catch(function(res){

                $scope.records     = [];
                $scope.recordCount = -1;
                $scope.error       = res.data || res;

                console.error($scope.error);

            }).finally(function(){
                delete $scope.loading;
            });
        }

        //======================================================
        //
        //
        //======================================================
        function loadRecords(options){
            // Execute query

            var qsParams =
            {
                "q"  : buildQuery(options),
                "fl" : "identifier_s, schema_*, title_*, summary_*, description_*, created*, updated*, reportType_*_t, " +
                       "url_ss, _revision_i, _state_s, _latest_s, _workflow_s, isAichiTarget_b, jurisdiction_*, aichiTargets_*, otherAichiTargets_*, date_dt, progress_s",
                "sort"  : "updatedDate_dt desc",
                "start" : 0,
                "row"   : 500,
            };

            return $http.get("/api/v2013/index", { params : qsParams }).then(function(res) {

                return _.map(res.data.response.docs, function(v){
                    return _.defaults(v, {
                        schemaName     : solr.lstring(v, "schema_*_t",     "schema_EN_t",     "schema_s"),
                        title          : solr.lstring(v, "title_*_t",      "title_EN_t",      "title_t"),
                        summary        : solr.lstring(v, "summary_*_t",    "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t"),
                        url            : toLocalUrl(v.url_ss)
                    });
                });

            });
        }

        //======================================================
        //
        //
        //======================================================
        function buildQuery(options) {

            options = _.assign({
                schema    : options.schema,
                target    : options.nationaTargetId,
                latest    : true
            }, options || {});

            var query  = [];

            // Add Schema
            query.push("schema_s:" + solr.escape(options.schema));

            if(options.target)
                query.push("nationalTarget_s:"+solr.escape(options.target));

            // Apply ownership
            query.push(["realm_ss:" + realm.toLowerCase(), "(*:* NOT realm_ss:*)"]);

            // Apply ownership
            query.push(_.map(user.userGroups, function(v){
                return "_ownership_s:"+solr.escape(v);
            }));

            if(options.latest!==undefined){
                query.push("_latest_s:" + (options.latest ? "true" : "false"));
            }

            // AND / OR everything

            return solr.andOr(query);
        }

        //======================================================
        //
        //
        //======================================================
        function toLocalUrl(urls) {

            var url = navigation.toLocalUrl(_.first(urls));

            if(_(url).startsWith('/') && (_(url).endsWith('=null') || _(url).endsWith('=undefined')))
                return null;

            return url;
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

                var q = '(realm_ss:' + realm.toLowerCase() + ' AND schema_s:nationalReport AND _latest_s:true ' +  ownershipQuery + ')';
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
                    "q"  : '(realm_ss:' + realm.toLowerCase() + ' ' + qSchema + ' AND _latest_s:true ' +  ownershipQuery + ')',
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


        //======================================================
        //
        //
        //======================================================
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


        //======================================================
        //
        //
        //======================================================
        function facetSummation(reportFacets,reportType){
            _.each(reportFacets, function(facets){
                _.each(facets.pivot,function(facet){
                    reportType[facet.value] += facet.count;
                })
            });

        }

        $scope.load();
        loadNationalTargets();

        $scope.getFacet = function(schema){
            return _.first(_.where($scope.schemasList,{"identifier":schema}));
        }

        //======================================================
        //
        //
        //======================================================
        function edit(record, type)
        {
            $location.url(navigation.editUrl(record.schema_s, record.identifier_s, type));
        }


        //======================================================
        //
        //
        //======================================================
        function del(record, type, ev)
        {
            var repo = null;
            var identifier = record.identifier_s;

            $q.when(record).then(function(r) {

                    if(r._state_s == "public")  repo = storage.documents;
               else if(r._state_s == "draft")   repo = storage.drafts;
               else                             throw new Alert("Cannot delete request");

               return repo.exists(identifier);

           }).then(function(exist) {

                if(!exist)
                    throw new Alert("Record not found.");

                var confirm = $mdDialog.confirm()
                  .title('Are you sure you want to delete?')
                  .ariaLabel('delete records')
                  .ok('DELETE RECORD')
                  .cancel('CANCEL')
                  .targetEvent(ev);

                $mdDialog.show(confirm)
                .then(function() {
                    return repo.delete(identifier);
                }).then(function() {

                    if(type=='nationalTargets'){
                        _.remove($scope.nationalTargets, function(r){
                           return r==record;
                        });
                    }

                    else if(type=='nationalAssessment'){

                         _.each($scope.nationalTargets, function(target){
					       _.each(target, function(assessment){
                             _.remove(assessment, function(r){
                                return r==record;
					        });
        			     });
                        });

                    }

                   else {
                        record=undefined;
                    }
                });

            }).catch(function(e){

                if(e instanceof Noop)
                    return;

                if(e instanceof Alert) {
                    alert(e.message);
                    return;
                }

                $scope.error = e;
            });

            function Alert(msg) { this.message = msg; }
            function Noop()     { }
        }

        //======================================================
        //
        //
        //======================================================
        function viewWorkflow(record)
        {
            $location.url("/management/requests/" + record._workflow_s.replace(/^workflow-/i, "") + "/publishRecord");
        }
         //======================================================
        //
        //
        //======================================================
        $scope.$on("RefreshList", function(ev) {
             $scope.load();
             loadNationalTargets();
        });
        //======================================================
        //
        //gets the unique aichi targets from targets and subtargets
        //======================================================
        $scope.getAichiTargets = function(targets){

            if(!targets) return [];

             var list = [];
             var n = "";

            _.forEach(targets, function(name, key) {

              n = name.substring(0, 15);

              if(list.indexOf(n) == -1 )
                list.push(n);
            });

            return list;

        }


    }];
});
