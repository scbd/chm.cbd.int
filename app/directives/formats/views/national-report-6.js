define(['app', 'text!./national-report-6.html', 'lodash', 'utilities/km-storage', 'ngDialog', 
		"utilities/solr",'scbd-angularjs-services/locale', './national-target', './national-assessment',
		'directives/forms/km-value-ml'], 
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
				
				var queryString = $location.search();
				if(queryString && queryString.print){
					$scope.pdfMode = true;
				}
				if(!$scope.locale)
					$scope.locale = locale;

				$scope.gspcTargets  = {};
				$scope.aichiTargets	= {};
				var progressAssessments = [];
				$scope.nationalTargets = {};

				$scope.$watch('document', function(document, old){
					
					if(!$scope.document||!document)
						return;
					
					if($route.current.params && $route.current.params.code){
						if(document.targetPursued && document.nationalTargets_body){
							$scope.nationalTargets = {};
							_.each(document.nationalTargets_body, function(target){
									target.government = undefined;
									$scope.nationalTargets[target.header.identifier] = target;
							});
						}
						if(document.progressAssessmentsassessment_body){
							$scope.progressAssessments = [];
							_.each(document.progressAssessmentsassessment_body, function(assessment){
								assessment.government = undefined;
								$scope.progressAssessments.push(assessment);
							});
						}
					}
					else{
						
						if(document.targetPursued){
							
							
								$scope.isLoadingTargets = true
								var nationalTargets = _.map(document.nationalTargets, function(target){ return loadDocument(target.identifier);});
								$q.all(nationalTargets)
								.then(function(data){
									$scope.nationalTargets = {};
									_.each(_.compact(data), function(target){
										if(target && target.data){
											target.data.government = undefined;
											$scope.nationalTargets[target.data.header.identifier] = target.data;
										}
									});
								})
								.finally(function(){
									$scope.isLoadingTargets = false;
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
							if(results){
								var documents = _.map(_.compact(results), function(result){ 
													result.data.government = undefined; return (result||{}).data || {}; 
												});
								$scope.progressAssessments = documents;
							}
						})
						.finally(function(){
						$scope.isLoadingAssessments = false;
						});
					}

					if($scope.document.nationalContribution){
						var queries = [];
						
						var target16 = $scope.document.nationalContribution.aichiTarget16;
						var target20 = $scope.document.nationalContribution.aichiTarget20;

						if(target16){
							var queries = [];
							var realmConfig;                    
							if(realm == "CHM-DEV")
								realmConfig = 'abs-dev';
							else if(realm == "CHM-TRG")
								realmConfig = 'abs-trg';
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

					var gspcTargetQuery		= $http.get("/api/v2013/thesaurus/domains/8D405050-50AF-45EA-95F7-A31A11196424/terms", {cache: true}).then(function(o) {return o.data;});
					var aichiTargetQuery	= $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms", {cache: true}).then(function(o) {return o.data;});
					$q.all([gspcTargetQuery, aichiTargetQuery])
					.then(function(resutl){
						_.each(resutl[0], function(target){ $scope.gspcTargets[target.identifier] = target });
						_.each(resutl[1], function(target){ $scope.aichiTargets[target.identifier] = target });
					})
				});

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
						"sort"  : "createdDate_dt desc",
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

							var directiveHtml = '<DIRECTIVE document-id="@documentId" target="_blank"></DIRECTIVE><br/><div class="btn btn-primary" ng-click="close()">Close</div>'
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
							
						return storage.documents.get(identifier, {info:true})
									.then(function(target){
										if($location.path() != '/database/record')//if user is not on public record page show working draf document else published record.
											return { data : target.data.workingDocumentBody || target.data.body };
										else
											return { data : target.data.body };
									})
									.catch(function(e) {										
										if (e.status == 404 && $location.path() != '/database/record') {
											return storage.drafts.get(identifier).catch(function(e) {});
										}
									});
					}
				};
				
		}]
	};
}]);
});
