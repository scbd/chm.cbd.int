define(['app', 'text!./national-report-6.html', 'lodash', 'utilities/km-storage'], function(app, template, _){

app.directive('viewNationalReport6', ["$q", "IStorage", function ($q, storage) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget",
			allowDrafts : "@"
		},
		link : function ($scope)
		{

		},
		controller	:  ["$scope", "$http","$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility",
 						"navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route" , "solr", "realm",
			function ($scope, $http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, 
			siteMapUrls, thesaurus, guid, $route, solr, realm) {
				
				var nationalAssessments = [];
				var nationalTargets = [];

				$scope.$watch('document.nationalTargets', function(newVal, old){
					
					if(!$scope.document)
						return;				
					
					var nationalTargetsQuery=[];
					var nationalAssessmentQuery=[];
					_.each($scope.document.nationalTargets, function (mod) {
						if(mod.identifier){
							nationalTargetsQuery.push(storage.documents.get(mod.identifier));
						}
					});		
					$q.all(nationalTargetsQuery)
					.then(function(results){					
						var documents = _.map(results, function(result){ return result.data || {}; });
						nationalTargets = documents;
					});

					_.each($scope.document.progressAssessments, function (mod) {
						if(mod.assessment && mod.assessment.identifier){
							nationalAssessmentQuery.push(loadReferenceRecords({schema:'nationalAssessment', identifier:mod.assessment.identifier, rows:1}))
						}
					});			
					$q.all(nationalAssessmentQuery)
					.then(function(results){
						var documents = _.map(results, function(result){ return result[0] || {}; });					
						nationalAssessments = documents;
					});
				});

				$scope.getNationalTargetTitle = function(identifier){

					if(nationalTargets){
						var nationalTarget = _.find(nationalTargets, function(target){
												return target && target.header.identifier == identifier; 
											});
						if(nationalTarget)
							return nationalTarget.title
					}	
				}

				$scope.getAssessmentInfo = function(assessment, field){
					var existingAssesment = _.find(nationalAssessments, function(progress){
														return  progress.identifier_s == assessment.identifier;
													});
					if(existingAssesment)
						return existingAssesment[field];

				}

				function loadReferenceRecords(options) {
					
					options = _.assign({
						identifier: options.identifier,
						schema    : options.schema,
						target    : options.nationaTargetId,
						latest    : true,
						rows	  : 500
					}, options || {});

					var query  = [];

					// Add Schema
					query.push("schema_s:" + solr.escape(options.schema));
					
					if(options.identifier)
						query.push("identifier_s:"+solr.escape(options.identifier));

					if(options.target)
						query.push("nationalTarget_s:"+solr.escape(options.target));

					// Apply ownership
					query.push(["realm_ss:" + realm.toLowerCase(), "(*:* NOT realm_ss:*)"]);

					// Apply ownership
					query.push(_.map(($rootScope.user||{}).userGroups, function(v){
						return "_ownership_s:"+solr.escape(v);
					}));

					if(options.latest!==undefined){
						query.push("_latest_s:" + (options.latest ? "true" : "false"));
					}

					// AND / OR everything

					var query =  solr.andOr(query);
					var qsParams =
					{
						"q"  : query,
						"fl" : "identifier_s, schema_*, title_*, summary_*, description_*, created*, updated*, reportType_*_t, " +
							"url_ss, _revision_i, _state_s, _latest_s, _workflow_s, isAichiTarget_b, jurisdiction_*, aichiTargets_*, otherAichiTargets_*, date_dt, progress_s",
						"sort"  : "updatedDate_dt desc",
						"start" : 0,
						"rows"   : options.rows,
					};

					return $http.get("/api/v2013/index", { params : qsParams }).then(function(res) {

						return _.map(res.data.response.docs, function(v){
							return _.defaults(v, {
								schemaName     : solr.lstring(v, "schema_*_t",     "schema_EN_t",     "schema_s"),
								title          : solr.lstring(v, "title_*_t",      "title_EN_t",      "title_t"),
								summary        : solr.lstring(v, "summary_*_t",    "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t")
							});
						});

					});
				}
		}]
	};
}]);
});
