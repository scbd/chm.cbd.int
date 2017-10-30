define(['app', 'text!./national-report-6.html', 'lodash', 'utilities/km-storage', 'ngDialog', 
		"utilities/solr",'scbd-angularjs-services/locale', './national-target', './national-assessment'], 
function(app, template, _){

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
		controller	:  ["$scope", "$http","$rootScope", "$q", "$location", "$filter", 'IStorage',
						 "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route" , 
						 "solr", "realm",'ngDialog', 'locale', 'smoothScroll',
			function ($scope, $http, $rootScope, $q, $location, $filter, storage, navigation, authentication,
			siteMapUrls, thesaurus, guid, $route, solr, realm, ngDialog, locale, smoothScroll) {

				if(!$scope.locale)
					$scope.locale = locale;

				var progressAssessments = [];
				$scope.nationalTargets = [];

				$scope.$watch('document', function(document, old){

					if(!$scope.document||!document)
						return;
					if(document.targetPursued){
						$scope.isLoadingAssessments = true
						var nationalTargets = _.map(document.nationalTargets, function(target){ return loadDocument(target.identifier);});
						$q.all(nationalTargets)
						  .then(function(data){
							  $scope.nationalTargets = [];
							  _.each(data, function(target){
								if(target.data){
									target.data.government = undefined;
									$scope.nationalTargets.push(target.data);
								}
							  });
							  $scope.isLoadingAssessments = false;
						  });
					}

					$scope.isLoadingAssessments = true;
					var nationalAssessmentQuery=[];
					_.each($scope.document.progressAssessments, function (mod) {
						if(mod.assessment && mod.assessment.identifier){
							nationalAssessmentQuery.push(loadDocument(mod.assessment.identifier));
						}
					});
					$q.all(nationalAssessmentQuery)
					.then(function(results){
						var documents = _.map(results, function(result){ 
											result.data.government = undefined; return result.data || {}; 
										});
						$scope.progressAssessments = documents;
					});

					if($scope.document.nationalContribution){
						var queries = [];
						
						var target16 = $scope.document.nationalContribution.aichiTarget16;
						var target20 = $scope.document.nationalContribution.aichiTarget20;

						if(target16){
							var queries = [];
							var realmConfig;                    
							if(realm == "CHM-DEV")
								realmConfig = 'abs-dev';
							else
								realmConfig = 'abs';
							$scope.absNationalReport = undefined;
							if(target16.nationalReport)
								loadReferenceRecords({identifier:removeRevisonNumber(target16.nationalReport.identifier)}, realmConfig)
								.then(function(data){
									$scope.absNationalReport = _.head(data);
								});

							$scope.absLinkedRecords = undefined;
							if((target16.includeLinkedRecords && target16.linkedRecords) || 
							   (!target16.nationalReport && target16.includeLinkedRecords==undefined && target16.linkedRecords)){
								var options = {
									identifier : "(" + _.pluck(target16.linkedRecords, 'identifier').join(' ') + ")"
								}								
								loadReferenceRecords(options, realmConfig)
								.then(function(data){
									$scope.absLinkedRecords = data;
								});;
							}
								
						}
						if(target20 && target20.resourceMobilisationReport){
							$scope.resourceMobilisationReport = undefined;
							loadReferenceRecords({identifier : target20.resourceMobilisationReport.identifier})
							.then(function(data){								
								$scope.resourceMobilisationReport = _.head(data)
							})
						}
					}
				});

				//============================================================
				//
				//============================================================
				$scope.getNationalTargetTitle = function(identifier){

					if($scope.nationalTargets){
						var nationalTarget = _.find($scope.nationalTargets, function(target){
												return target && target.header.identifier == identifier;
											});
						if(nationalTarget)
							return nationalTarget.title;
					}
				};

				//============================================================
				//
				//============================================================
				$scope.hasNationalContributions = function () {
					if($scope.document && $scope.document.nationalContributions){
						return _.has($scope.document.nationalContributions, 'description') || _.has($scope.document.nationalContributions, 'achievementActivities');
					}
				};

				//============================================================
				//
				//============================================================
				$scope.getAssessmentInfo = function(assessment, field){
					var existingAssesment = _.find(progressAssessments, function(progress){
														return  progress.identifier_s == assessment.identifier;
													});
					if(existingAssesment)
						return existingAssesment[field];

				};

				function removeRevisonNumber(identifier){
					if(identifier && identifier.indexOf('@')>0)
						return identifier.substr(0, identifier.indexOf('@'));

					return identifier;
				}

				function getRevisonNumber(identifier){
					if(identifier && identifier.indexOf('@')>0)
						return identifier.substr(identifier.indexOf('@')+1, identifier.length - (identifier.indexOf('@')+1));

					return identifier;
				}

				//============================================================
				//
				//============================================================
				function loadReferenceRecords(options, appRealm) {

					if(options.latest===undefined)
						options.latest = true;

					options = _.assign({
						schema    : options.schema,
						target    : options.nationaTargetId,
						rows	  : 500
					}, options || {});

					var query  = [];

					// Add Schema
					if(options.schema)
					query.push("schema_s:" + solr.escape(options.schema));

					if(options.government)
						query.push("government_s:"+solr.escape(options.government));

					if(options.target)
						query.push("nationalTarget_s:"+solr.escape(options.target));

					if(options.identifier)
						query.push("(identifier_s:"+solr.escape(options.identifier)+")");

					if(options.revision)
						query.push("_revision_i:"+solr.escape(options.revision));
					// Apply ownership
					query.push(["realm_ss:" + (appRealm||realm).toLowerCase(), "(*:* NOT realm_ss:*)"]);

					// Apply ownership
					// query.push(_.map(($rootScope.user||{}).userGroups, function(v){
					// 	return "_ownership_s:"+solr.escape(v);
					// }));

					if(options.latest!==undefined){
						query.push("_latest_s:" + (options.latest ? "true" : "false"));
					}

					// AND / OR everything

					var query =  solr.andOr(query);
					var qsParams =
					{
						"q"  : query,
						"fl" : "identifier_s,uniqueIdentifier_s, schema_t, title_t, summary_t, description_t, reportType_EN_t, " +
							"url_ss, _revision_i, _state_s, _latest_s, _workflow_s, isAichiTarget_b, aichiTargets_*, otherAichiTargets_*, date_dt, progress_s",
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

				$scope.showReferenceRecordDetailss = function(documentId){
					openDialog(documentId, {});
				};

				//============================================================
				//
				//============================================================
				function openDialog(documentId, options) {

					options = options || {};

					return $q(function(resolve, reject) {

						require(['directives/formats/views/form-loader'], function() {

							var directiveHtml = '<DIRECTIVE document-id="@documentId"></DIRECTIVE><br/><div class="btn btn-primary" ng-click="close()">Close</div>'
												.replace(/DIRECTIVE/g, 'view-form-loader')
												.replace(/@documentId/g, documentId);

							$scope.$apply(function(){
								options.template = directiveHtml;
							});
							options.className = 'ngdialog-theme-default wide';
							options.plain = true;
							options.controller = ['$scope', function($scope){
								$scope.close = ngDialog.closeAll;
							}];

							var dialogWindow = ngDialog.open(options);

							dialogWindow.closePromise.then(function(res){

								if(res.value=="$escape")      delete res.value;
								if(res.value=="$document")    delete res.value;
								if(res.value=="$closeButton") delete res.value;

								return res;
							});

							resolve(dialogWindow);

						}, reject);
					});
				}

				function loadDocument(identifier) {
					
					if (identifier) { //lookup single record
						
						return storage.documents.get(identifier)
									.catch(function(e) {
										if (e.status == 404) {
											return storage.drafts.get(identifier);
										}
									});
					}
				};
				
		}]
	};
}]);
});
