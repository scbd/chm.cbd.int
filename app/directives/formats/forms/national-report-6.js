define(['require', 'text!./national-report-6.html', 'app', 'angular', 'lodash', 'json!app-data/edit-form-messages.json', 'authentication', '../views/national-report-6',
'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities',
'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', './reference-selector', "utilities/solr", "./reference-selector", 'ngDialog', 'scbd-angularjs-services/locale'
	],
	function(require, template, app, angular, _, messages) {
		'use strict';

		app.directive("editNationalReport6", ["$http", "$rootScope", "$q", "$location", "$filter", 'IStorage', 
		"editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", "solr", 
		"realm", '$compile', "$timeout", 'ngDialog', 'locale', 'smoothScroll', '$mdDialog',
			function($http, $rootScope, $q, $location, $filter, storage, editFormUtility, 
				navigation, authentication, siteMapUrls,thesaurus, guid, $route, solr, 
				realm, $compile, $timeout, ngDialog, locale, smoothScroll, $mdDialog) {
				return {
					restrict: 'E',
					template: template,
					replace: true,
					transclude: false,
					scope: {},
					link: function($scope, $element) {

						var targetAssessments = [];
						var aichiTargets = [];
						var gspcTargets = [];
						$scope.status = "";
						$scope.error = null;
						$scope.tab = "general";
						$scope.document = null;
						$scope.locale = locale;
						$scope.review = {
							locale: locale
						};
						$scope.qs = $location.search();
						$scope.user
							// Ensure user as signed in
						navigation.securize();
						$scope.waitForWorkflow = {};

						//==================================
						//
						//==================================
						$scope.init = function() {

							if ($scope.document)
								return;

							$scope.status = "loading";

							var qs = $route.current.params;
							var schema = "nationalReport6";
							var reportType = qs.type;
							var promise = null;
							var keepTypeOptions = null;
							var rmTypeOptions = null;

							if (qs.uid) { // Load
								promise = editFormUtility.load(qs.uid, schema);
							} else { // Create

								promise = $q.when(guid()).then(function(identifier) {
									return storage.drafts.security.canCreate(identifier, schema)
									.then(function(isAllowed) {

										if (!isAllowed)
											throw {
												data: {
													error: "Not allowed"
												},
												status: "notAuthorized"
											};

										return identifier;
									});
								}).then(function(identifier) {

									return {
										header: {
											identifier: identifier,
											schema: schema,
											languages: [locale]
										},
										government: $scope.defaultGovernment() ? {
											identifier: $scope.defaultGovernment()
										} : undefined,
										targetPursued: undefined,
										implementationMeasures : [{}]
									};

								});
							}

							promise.then(function(doc) {

								if (!$scope.options) {

									$scope.options = {
										countries: $http.get("/api/v2013/thesaurus/domains/countries/terms", {
											cache: true
										}).then(function(o) {
											return $filter('orderBy')(o.data, 'name');
										}),
										jurisdictions: $http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms", {
											cache: true
										}).then(function(o) {
											return o.data;
										}),
										aichiTargets: function() {
											return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms", {
												cache: true
											}).then(function(o) {
												return o.data;
											});
										},
										gspcTargets: function() {
											return $http.get("/api/v2013/thesaurus/domains/8D405050-50AF-45EA-95F7-A31A11196424/terms", {
												cache: true
											}).then(function(o) {
												return o.data;
											});
										},

										assessment: function() {
											return $http.get("/api/v2013/thesaurus/domains/8D3DFD9C-EE6D-483D-A586-A0DDAD9A99E0/terms", {
												cache: true
											}).then(function(o) {
												return o.data;
											});
										},
										categoryProgress: function() {
											return $http.get("/api/v2013/thesaurus/domains/EF99BEFD-5070-41C4-91F0-C051B338EEA6/terms", {
												cache: true
											}).then(function(o) {
												return o.data;
											});
										},
										confidenceLevel: function() {
											return $http.get("/api/v2013/thesaurus/domains/B40C65BE-CFBF-4AA2-B2AA-C65F358C1D8D/terms", {
												cache: true
											}).then(function(o) {
												return o.data;
											});
										},
										gspcCategoryProgress: function() {
											return $http.get("/api/v2013/thesaurus/domains/254B8AE2-05F2-43C7-8DB1-ADC702AE14A8/terms", {
												cache: true
											}).then(function(o) {
												return o.data;
											});
										},
										nationalTargets: function() {
											var targets = $scope.nationalTargets;
											if (!targets)
												targets = loadNationalTargets();
											return $q.when(targets)
												.then(function() {
													return _.map($scope.nationalTargets, function(item) {
														return {
															title: item.title_t,
															identifier: item.identifier_s
														};
													});
												});
										},

									};

								}

								return doc;

							}).then(function(doc) {
								return $q.when($scope.options.aichiTargets())
									.then(function(data) {
										aichiTargets = data;
										if (!doc.nationalContribution) {
											doc.nationalContribution = {};
											for (var i = 1; i <= 20; i++) {
												doc.nationalContribution['aichiTarget' + i] = {
													identifier: 'AICHI-TARGET-' + (i < 10 ? '0' + i : i)
												};
											}
										}
										return doc;
								});
								return doc;

							}).then(function(doc) {
								return $q.when($scope.options.gspcTargets())
									.then(function(data) {
										gspcTargets = data;
										if (!doc.gspcNationalContribution) {
												doc.gspcNationalContribution = {}
												for (var i = 1; i <= 16; i++) {
													doc.gspcNationalContribution['gspcTarget' + i] = {
														identifier: 'GSPC-TARGET-' + (i < 10 ? '0' + i : i)
													};
												}
										}
										return doc;
									});
								return doc;
							}).then(function(doc) {
								$scope.document = doc;
								$q.all([loadABSNationaReport(), loadResourceMobilasationReport()])
									.then(function() {
										$scope.status = "ready";
									});

								if (!qs.uid) {
									$q.when(loadReferenceRecords({ 
											"fl"    : 'identifier_s, title_s, _workflow_s, _state_s',
											schema: 'nationalReport6'
										}))
										.then(function(nationalReport) {
											if (nationalReport && nationalReport.length > 0) {
												ngDialog.open({
													template: 'recordExistsTemplate.html',													
													closeByDocument: false,
													closeByEscape: false,
													showClose: false,
													closeByNavigation: false,
													controller: ['$scope', '$timeout', function($scope, $timeout) {
														$scope.alertSeconds = 10;
														time();

														function time(){
															$timeout(function(){
																if($scope.alertSeconds == 1){																	
																	$scope.openExisting();
																}
																else{
																	$scope.alertSeconds--;																
																	time()
																}
															}, 1000)
														}
														$scope.openExisting = function() {
															ngDialog.close();
															var nr6 = _.head(nationalReport);
															if(nr6._workflow_s)
																$location.path('/management/requests/' + nr6['_workflow_s'].replace('workflow-','')+'/publishRequest');
															else
																$location.path('/submit/nationalReport6/' + nr6['identifier_s']);
														}
													}]
												});
											}
										});
								}

							}).catch(function(err) {

								$scope.onError(err.data, err.status);
								throw err;

							});

						};

						//==================================
						//
						//==================================
						$scope.getCleanDocument = function(document) {
							document = document || $scope.document;

							if (!document)
								return;

							document = angular.fromJson(angular.toJson(document));

							if (!document)
								return $q.when(true);
							
							if(!document.targetPursued || (document.nationalTargets && document.nationalTargets.length == 0))
								document.nationalTargets = undefined;
							
							if (_.isEmpty(document.progressAssessments))
								document.progressAssessments = undefined;

							if (document.implementationMeasures && document.implementationMeasures.length === 0)
								document.implementationMeasures = undefined;
							else {
								_.each(document.implementationMeasures, function(measure) {
									if (document.targetPursued)
										measure.aichiTargets = undefined;
									else
										measure.nationalTargets = undefined;
								});
							}
							if (document.gspcNationalContribution && !document.gspcNationalContribution.hasGSPCTargets) {
								if (document.gspcNationalContribution.gspcTargetDescription)
									document.gspcNationalContribution.gspcTargetDescription = undefined;
							}

							if (_.isEmpty(document.biodiversityCountryProfile))
								document.biodiversityCountryProfile = undefined;

							return document;
						};

						//======================================================================
						//======================================================================
						//======================================================================
						//======================================================================
						//======================================================================

						//==================================
						//
						//==================================
						var nextTab; var prevTab;
						$scope.$watch('tab', function(tab) {
							if (tab == 'review')
								$scope.validate();
							
							switch (tab) {
								case 'general':{
									nextTab = 'implementation';
									prevTab = '';
									break;
								}
								case 'implementation':{
									nextTab = 'progress';
									prevTab = 'general';
									break;
								}
								case 'progress':{
									nextTab = 'nationalContribution';
									prevTab = 'implementation';
									break;
								}
								case 'nationalContribution':{
									nextTab = 'gspcContribution';
									prevTab = 'progress';
									break;
								}
								case 'gspcContribution':{
									nextTab = 'iplcContribution';
									prevTab = 'nationalContribution';
									break;
								}
								case 'iplcContribution':{
									nextTab = 'countryProfile';
									prevTab = 'gspcContribution';
									break;
								}
								case 'countryProfile':{
									nextTab = 'review';
									prevTab = 'iplcContribution';
									break;
								}
								case 'review':{
									nextTab = '';
									prevTab = 'countryProfile';
									break;
								}
								default:
									break;
							}
							// if(tab == 'implementation')$scope.closeall('.implementationMeasure');
							// if(tab == 'progress')$scope.closeall('.progressAssessment');
							// if(tab == 'nationalContribution')$scope.closeall('.aichiTarget');
							// if(tab == 'gspcContribution')$scope.closeall('.gspcTarget');
							// smoothScroll($element.find(nextTab))
						});
						$scope.switchTab = function(type){
							if(type=='next' && nextTab!='')
								$scope.tab = nextTab;
							else if(type=='prev' && prevTab!='')
								$scope.tab = prevTab;

						}
						//==================================
						//
						//==================================
						$scope.validate = function() {

							$scope.validationReport = null;

							var oDocument = $scope.reviewDocument = $scope.getCleanDocument();

							return storage.documents.validate(oDocument).then(function(success) {

								$scope.validationReport = success.data;
								return !!(success.data && success.data.errors && success.data.errors.length);

							}).catch(function(error) {

								$scope.onError(error.data);
								return true;

							});
						};

						//==================================
						//
						//==================================
						$scope.isLoading = function() {
							return $scope.status == "loading";
						};

						//==================================
						//
						//==================================
						$scope.hasError = function() {
							return !!$scope.error;
						};

						//==================================
						//
						//==================================
						$scope.userGovernment = function() {
							return authentication.user().government;
						};

						//==================================
						//
						//==================================
						$scope.defaultGovernment = function() {

							var qsGovernment = $location.search().government;

							if (qsGovernment)
								qsGovernment = qsGovernment.toLowerCase();

							return $scope.userGovernment() || qsGovernment;
						};


						//==================================
						//
						//==================================
						$scope.onPreSaveDraft = function() {};

						//==================================
						//
						//==================================
						$scope.onPrePublish = function() {
							return $scope.validate().then(function(hasError) {
								if (hasError)
									$scope.tab = "review";
								return hasError;
							});
						};

						//==================================
						//
						//==================================
						$scope.onPostWorkflow = function() {
							$rootScope.$broadcast("onPostWorkflow", messages.onPostWorkflow);
							$location.url("/submit/nationalReport6");
						};

						//==================================
						//
						//==================================
						$scope.onPostPublish = function() {
							$scope.$root.showAcknowledgement = true;
							$rootScope.$broadcast("onPostPublish", messages.onPostPublish);
							$location.url("/submit/nationalReport6");
						};

						//==================================
						//
						//==================================
						$scope.onPostSaveDraft = function() {
							$rootScope.$broadcast("onSaveDraft", messages.onPostSaveDraft);
						};

						//==================================
						//
						//==================================
						$scope.onPostClose = function() {
							$rootScope.$broadcast("onPostClose", messages.onPostClose);
							$location.url("/submit/nationalReport6");
						};



						//==================================
						//
						//==================================
						$scope.onError = function(error, status) {
							$scope.status = "error";

							if (status == "notAuthorized") {
								$scope.status = "hidden";
								$scope.error = messages.unAuthorizedError;
							} else if (status == 404) {
								$scope.status = "hidden";
								$scope.error = messages.recordNotFoundError;
							} else if (status == "badSchema") {
								$scope.status = "hidden";
								$scope.error = messages.badSchemaError;
							} else if (error && error.Message)
								$scope.error = error.Message;
							else
								$scope.error = error;
						};

						$scope.init();

						//============================================================
						//
						//============================================================
						$scope.addImplementationMeasure = function() {
							if (!$scope.document.implementationMeasures) {
								$scope.document.implementationMeasures = [];
							}
							$scope.document.implementationMeasures.push({});
						};

						//============================================================
						//
						//============================================================
						$scope.removeImplementationMeasure = function(measure) {
							if (measure && $scope.document.implementationMeasures) {
								$scope.document.implementationMeasures.splice($scope.document.implementationMeasures.indexOf(measure), 1);
							}
						};

						$scope.$watch('document', function(newVal, old) {

							if (!$scope.document || newVal === undefined)
								return;
							if (newVal && newVal.targetPursued) {
								loadNationalTargets();
							}
						});

						$scope.$watch('document.targetPursued', function(newVal, old) {

							if (!$scope.document || newVal === undefined)
								return;

							if (newVal === false) { //if target not pursued by country than the country has to assess againts all AICHI targets
								$scope.document.progressAssessments = [];
								//nationalContributions contains preloaded aichiTargets just use instead of reloading
								var aichiTargets = _.pluck($scope.document.nationalContribution, 'identifier');
								_.map(aichiTargets, function(target) {
									$scope.document.progressAssessments.push({
										aichiTarget: {
											identifier: target
										}
									});
									loadProgressAssessment();
								});
							} else {
								$q.when(loadNationalTargets())
									.then(function() {
										loadProgressAssessment();
									});
							}
						});

						//============================================================
						//
						//============================================================
						$scope.getNationalTargetTitle = function(identifier) {

							if ($scope.nationalTargets) {
								var nationalTarget = _.find($scope.nationalTargets, function(target) {
									return target && target.identifier_s == identifier;
								});
								if (nationalTarget)
									return nationalTarget.title_t;
							}
						};

						$scope.getAssessmentInfo = function(assessment, field) {
							var existingAssessment = _.find(targetAssessments, function(progress) {
								return progress.identifier_s == assessment.identifier;
							});
							if (existingAssessment){
								if(field)
									return existingAssessment[field];
								
								return existingAssessment;
							}

						};

						//============================================================
						//
						//============================================================
						$scope.addAssessment = function() {
							openDialog('directives/formats/forms/national-assessment', 'edit-national-assessment', {})
						};

						//============================================================
						//
						//============================================================
						$scope.refreshNationaTargets = function() {
							loadNationalTargets();
						};

						//============================================================
						//
						//============================================================
						$scope.refreshAssessment = function() {
							loadProgressAssessment();
						};

						//============================================================
						//
						//============================================================
						function loadReferenceRecords(options, appRealm) {

							if($scope.document && $scope.document.government){
								if (!options.skipLatest && options.latest === undefined)
									options.latest = true;
								
								options = _.assign({
									schema: options.schema,
									target: options.nationalTargetId,
									rows: 500,
									government: $scope.document.government.identifier
								}, options || {});

								var query = [];

								// Add Schema
								query.push("schema_s:" + solr.escape(options.schema));

								if (options.target)
									query.push("nationalTarget_s:(" + solr.escape(options.target)+')');

								if (options.government)
									query.push("government_s:" + solr.escape(options.government));

								if (options.identifier)
									query.push("identifier_s:" + solr.escape(options.identifier));

								if (options.state)
									query.push("_state_s:" + solr.escape(options.state));

								query.push(["realm_ss:" + (appRealm || realm).toLowerCase(), "(*:* NOT realm_ss:*)"]);

								// Apply ownership
								// query.push(_.map(($rootScope.user||{}).userGroups, function(v){
								// 	return "_ownership_s:"+solr.escape(v);
								// }));

								if (options.latest !== undefined) {
									query.push("_latest_s:" + (options.latest ? "true" : "false"));
								}

								// AND / OR everything

								var query = solr.andOr(query);
								var qsParams = {
									"q": query,
									"fl": "id, identifier_s, uniqueIdentifier_s, schema_t, createdDate_dt, title_t, summary_t, description_t, reportType_EN_t, " +
										"url_ss, _revision_i, _state_s, version_s, _latest_s, _workflow_s, isAichiTarget_b,nationalTarget_s, aichiTargets_*, otherAichiTargets_*, date_dt, progress_s",
									"sort": "createdDate_dt asc",
									"start": 0,
									"rows": options.rows,
								};

								return $http.get("/api/v2013/index", {
									params: qsParams
								}).then(function(res) {

									return _.map(res.data.response.docs, function(v) {
										return _.defaults(v, {
											schemaName: solr.lstring(v, "schema_*_t", "schema_EN_t", "schema_s"),
											title: solr.lstring(v, "title_*_t", "title_EN_t", "title_t"),
											summary: solr.lstring(v, "summary_*_t", "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t"),
											url    : toLocalUrl(v.url_ss)
										});
									});

								});
							}
						}

						function toLocalUrl(urls) {

							var url = navigation.toLocalUrl(_.first(urls));
				
							if(_(url).startsWith('/') && (_(url).endsWith('=null') || _(url).endsWith('=undefined')))
								return null;
				
							return url;
						}

						//============================================================
						//
						//============================================================
						function loadNationalTargets() {

							// $scope.document.nationalTargets = [];
							$scope.loadingNationalTargets = true;
							var query = loadReferenceRecords({
								schema: 'nationalTarget',
								skipLatest: true
							});
							return $q.when(query)
								.then(function(data) {
									// $scope.nationalTargets = undefined;
									if(data){
										var indexNationalTargets = [];

										data = $filter('orderBy')(data, ['createdDate_dt']);	
										//get all draft records
										indexNationalTargets = _.filter(data, function(nationalTarget) {return nationalTarget.version_s == 'draft'});
										
										//public records
										_.each(data, function(nationalTarget) {
											var existingTarget = _.find(indexNationalTargets,function(target){return target.identifier_s ==  nationalTarget.identifier_s})
											if(nationalTarget._state_s == 'public' && !existingTarget){					
												indexNationalTargets.push(nationalTarget);
											}
											else if(existingTarget && nationalTarget._state_s == 'public'){
												//keep copy of public record in existingTarget useful when user is trying to delete
												//show both draft and public record 
												existingTarget.publicRecord =nationalTarget;												
											}									
										});

										//remove any targets that have been deleted
										if($scope.document.nationalTargets){
											for(var i=$scope.document.nationalTargets.length-1; i>=0; --i){
												var target = $scope.document.nationalTargets[i];
												$scope.document.nationalTargets.splice(target, i)
												// return _.find(indexNationalTargets, {identifier_s : target.identifier});
											}
										}
										//add any new targets
										_.each(indexNationalTargets, function(target){

											//check for record workflow status
											if($scope.waitForWorkflow && $scope.waitForWorkflow.nationalTarget){
												var workflowDetails = $scope.waitForWorkflow.nationalTarget;
												if(workflowDetails.identifier == target.identifier_s 
													&& ((target._state_s== 'workflow' && workflowDetails.workflowId == $scope.getWorkflowId(target))
													   || target._state_s== 'public')
												){
													$scope.waitForWorkflow.nationalTarget = undefined;
												}
											}
											
											var targetExists = _.find($scope.document.nationalTargets, {identifier : target.identifier});
											if(!targetExists){	
												if(!$scope.document.nationalTargets)
													$scope.document.nationalTargets = [];
												$scope.document.nationalTargets.push({identifier:target.identifier_s});
											}
										})
										$scope.nationalTargets = indexNationalTargets;
									}
									else
										$scope.document.nationalTargets = undefined;
								})
								.finally(function() {
									$scope.loadingNationalTargets = false;
								});
						}

						//============================================================
						//
						//============================================================
						function loadProgressAssessment() {
							$scope.loadingAssessments = true;
							var targets = $filter('orderBy')($scope.nationalTargets, ['createdDate_dt']);;
							if($scope.document && $scope.document.targetPursued===false)
								targets = $scope.document.nationalContribution;

							var targetAssessmentIdentifiers = [];
							var targetIdentifiers = _.map(targets, function(target) {
								var assessment = {};
								if($scope.document.targetPursued===false){
									assessment.aichiTarget =  { identifier: target.identifier };
								}
								else{
									assessment.nationalTarget =  { identifier: target.identifier_s };
								}
								targetAssessmentIdentifiers.push(assessment);
								return target.identifier_s||target.identifier
							});
							$q.when(loadReferenceRecords({
								schema: 'nationalAssessment',
								nationalTargetId:targetIdentifiers.join(' '),
								rows: 100,
								skipLatest: true
							}))
							.then(function(result) {
								
								targetAssessments = [];
								//get all draft records
								targetAssessments = _.filter(result, function(rec) {return rec.version_s == 'draft'});
										
								//public records
								_.each(result, function(targetAssessment) {
									var existingAssessment = _.find(targetAssessments,function(rec){return rec.identifier_s ==  targetAssessment.identifier_s})
									if(targetAssessment._state_s == 'public' && !existingAssessment){					
										targetAssessments.push(targetAssessment);
									}
									else if(existingAssessment && targetAssessment._state_s == 'public'){
										//keep copy of public record in existingAssessment useful when user is trying to delete
										//show both draft and public record 
										existingAssessment.publicRecord =targetAssessment;												
									}									
								});

								_.map(targetAssessments, function(assessment){
									
									//check for record workflow status
									if($scope.waitForWorkflow && $scope.waitForWorkflow.nationalAssessment){
										var workflowDetails = $scope.waitForWorkflow.nationalAssessment;
										if(workflowDetails.identifier == assessment.identifier_s 
											&& ((assessment._state_s== 'workflow' && workflowDetails.workflowId == $scope.getWorkflowId(assessment))
											   || assessment._state_s== 'public')
										){
												$scope.waitForWorkflow.nationalAssessment = undefined;
											}
									}

									var record = _.find(targetAssessmentIdentifiers, function(rec){return (rec.aichiTarget||rec.nationalTarget).identifier == assessment.nationalTarget_s});
									if(record)
										record.assessment = {identifier : assessment.identifier_s};
								});
								$scope.document.progressAssessments = targetAssessmentIdentifiers
							})
							.finally(function(){$scope.loadingAssessments = false;});

						}

						//============================================================
						//
						//============================================================
						function removeRevisonNumber(identifier) {
							if (identifier && identifier.indexOf('@') > 0)
								return identifier.substr(0, identifier.indexOf('@'));

							return identifier;
						}

						var evtServerPushNotification = $rootScope.$on('event:server-pushNotification', function(evt, data) {
							
							if ($scope.document &&  
								data.data && data.data.identifier && (data.data.schema == 'nationalTarget' || data.data.schema == "nationalAssessment")
								&& data.data.government && data.data.government.identifier == $scope.document.government.identifier) {

									$timeout(function() {
										if (data.data.schema == 'nationalTarget') {
											$q.when(loadNationalTargets())
											.then(function() {
												loadProgressAssessment();
											});
										}
										else if (data.data.schema == 'nationalAssessment') {
											loadProgressAssessment();
										}
									}, 1000);

							}
						});


						$scope.$on('$destroy', function() {
							evtServerPushNotification();
							dialogOnPostWorkflowEvt();
						});

						$scope.closeall = function(section) {

							$(section).parent().find('.openall').css('display', 'block');
							$(section).parent().find('.closeall').css('display', 'none');
							$(section + ' .panel-body.collapse.in')
								.collapse('hide');
						};
						$scope.openall = function(section) {
							$(section).parent().find('.openall').css('display', 'none');
							$(section).parent().find('.closeall').css('display', 'block');
							$(section + ' .panel-body.collapse:not(".in")')
								.collapse('show');
						};

						$scope.setIncludeLinkedRecords = function() {
							$scope.includeLinkedRecords = true;
						}

						function loadABSNationaReport() {
							var target16;
							if ($scope.document && $scope.document.nationalContribution) {
								target16 = _.findWhere($scope.document.nationalContribution, {
									identifier: 'AICHI-TARGET-16'
								});
								// if(target16 && target16.nationalReport)
								// 	return;
							}

							var realmConfig;
							if (realm == "CHM-DEV")
								realmConfig = 'abs-dev';
							else if (realm == "CHM-TRG")
								realmConfig = 'abs-trg';
							else
								realmConfig = 'abs';

							return $q.when(loadReferenceRecords({
									schema: 'absNationalReport',
									state: 'public'
								}, realmConfig))
								.then(function(result) {
									if (result && result.length > 0) {
										var absNR = _.head(result);

										if (!target16.nationalReport && !target16.nationalReportDescription && target16.linkedRecords) {
											if (!$scope.warningsReport)
												$scope.warningsReport = {
													warnings: []
												};
											$scope.warningsReport.warnings.push({
												code: 'National contribution for AICHI Target 16',
												property: 'nationalContributions-AICHI-TARGET-16-nationalReportDescription'
											})
										}
										if (target16) {
											target16.nationalReport = {
												identifier: absNR.identifier_s + '@' + absNR._revision_i
											};
										}
										$scope.getNationalReportDetails = function(field) {
											if (angular.isArray(absNR[field]))
												return _.head(absNR[field]);
											return absNR[field];
										}
									}
								})
						}

						function loadResourceMobilasationReport() {
							var target20;
							if ($scope.document && $scope.document.nationalContribution) {
								target20 = _.findWhere($scope.document.nationalContribution, {
									identifier: 'AICHI-TARGET-20'
								});
							}

							return $q.when(loadReferenceRecords({
									schema: 'resourceMobilisation',
									latest: true,
									state: 'public'
								}))
								.then(function(result) {
									if (result && result.length > 0) {
										var resourceMobilisation = _.head(result);
										if (target20 && !target20.resourceMobilisationReport) {
											target20.resourceMobilisationReport = {
												identifier: resourceMobilisation.identifier_s
											};
										}
										$scope.getResourceMobilisationDetails = function(field) {
											if (angular.isArray(resourceMobilisation[field]))
												return _.head(resourceMobilisation[field]);
											return resourceMobilisation[field];
										}
									}
								})
						}

						//===========================
						//
						//===========================
						$scope.openDialog = function(data, name, directiveName, options) {

							options = options || {};
							$scope.isDialogOpen = true;
							$scope.isDialogLoading = true;
							return $q(function(resolve, reject) {

								require([name], function(controller) {

									$scope.isDialogLoading = false;
									var params = {};
									if(directiveName == 'edit-national-assessment-dialog'){
										if(data.assessment)
											params.uid = data.assessment.identifier; 
										if(!data.assessment && data.aichiTarget)
											params.aichiTarget = data.aichiTarget.identifier;
										if(!data.assessment && data.nationalTarget)
											params.nationalTarget = data.nationalTarget.identifier;

										params.type='nationalAssessment';
									}
									else if(directiveName == 'edit-national-target-dialog'){
										if(data)
											params.uid = data.identifier_s; 
									}

									var directiveHtml = '<span DIRECTIVE qs="qs" close-dialog="closeDialog()"></span>'.replace(/DIRECTIVE/g, directiveName)
									
									$scope.$apply(function(){
										options.template = directiveHtml;
									});
									options.controller = ['$scope', function($scope){
										$scope.qs = params;
										$scope.closeDialog = function(){
											ngDialog.close();
										}
									}]
									options.plain = true;
									options.closeByDocument = false;
									options.closeByEscape = options.closeByNavigation = false
									options.showClose = false;
									options.className='ngdialog-theme-default ngdialog-custom';
									var dialogWindow = ngDialog.open(options);

									dialogWindow.closePromise.then(function(res){

										if(res.value=="$escape")      delete res.value;
										if(res.value=="$document")    delete res.value;
										if(res.value=="$closeButton") delete res.value;
										$scope.isDialogOpen = false;
										return res;
									});

									resolve(dialogWindow);

								}, reject);
							});
						}

						$scope.print = function(){
							$scope.printing = true;
							require(['printThis', 'text!../views/print-header.html', 'text!../views/print-footer.html'], function(printObj, header, footer){						
								var el = $element.find('#schemaPrintView');
								el.printThis({
									debug:false,
									printContainer:true,
									importCSS:true,
									importStyle : true,
									pageTitle : $('title').text(),
									loadCSS : '/app/css/print-friendly.css',
									header : header,
									footer : footer
								});	
								$timeout(function(){$scope.printing = false;},500);
							});
							
						}

						$scope.getWorkflowId = function(item){
							return (item._workflow_s||'').replace(/workflow-/,'')
						}

						$scope.getAichiTargetTitle = function(aichiTarget, locale){
							if(aichiTarget){
								var target = _.find(aichiTargets, {identifier : aichiTarget.identifier});
								if(target)
									return target.title[locale];
							}

						}

						$scope.getGspcTargetTitle = function(gspcTarget, locale){
							if(gspcTarget){
								var target = _.find(gspcTargets, {identifier : gspcTarget.identifier});
								if(target)
									return target.title[locale];
							}

						}
						
						//======================================================
						//
						//
						//======================================================
						$scope.delete = function(record, type, ev)
						{
							var repo = null;
							var identifier = record.identifier_s;
							var hasAssessment = false;
							if(type == 'nationalTarget'){
								hasAssessment = _.some($scope.document.progressAssessments, function(assessment){ return assessment.assessment && assessment.nationalTarget.identifier == identifier})
								
							}
							ngDialog.open({
								template: 'deleteRecordModal', 
								controller : ['$scope', '$q', 'IStorage', function($scope, $q, storage){
									$scope.deletingRecord = true;
									if(record._state_s == 'draft'){
										$scope.draftRecordToDelete = record;
										$scope.publicRecordToDelete = record.publicRecord;
									}
									if(record._state_s == 'public'){
										$scope.publicRecordToDelete = record;
									}

									$q.when(storage.documents.security.canDelete(identifier, type))
									.then(function (allowed){
										$scope.security = {canDelete : allowed };
										$scope.deletingRecord = false;
									})
									$scope.hasAssessment = hasAssessment;

									$scope.deleteDraft = function(recordToDelete){
										$scope.deletingRecord = true;
										storage.drafts.delete(identifier)
										.then(function(result){
											$scope.draftRecordToDelete = undefined;
											if(type=='nationalTarget'){
												removeNationalTargets(identifier, recordToDelete);
											}
											else if(type=='nationalAssessment'){
												removeTargetAssessments(identifier, recordToDelete)
											}
											if(!recordToDelete.publicRecord)
												$scope.closeDialog();
										})
										.finally(function(){$scope.deletingRecord = false;})
									}
									$scope.deletePublic = function(recordToDelete){
										$scope.deletingRecord = true;
										storage.documents.get(identifier, {info:true})
										.then(function(document){

											editFormUtility.deleteDocument(document.data)
											.then(function(info){
												updateWorkflowStatus(type, info)
												$scope.draftRecordToDelete = undefined;
												$scope.recordToDelete = undefined;
												if(type=='nationalTarget'){
													removeNationalTargets(identifier, recordToDelete, $scope.security.canDelete);
												}
												else if(type=='nationalAssessment'){
													removeTargetAssessments(identifier, recordToDelete, $scope.security.canDelete)
												}
												$scope.closeDialog();
											})
											.finally(function(){$scope.deletingRecord = false;})
										
										})
									}

									$scope.closeDialog = function(){
										ngDialog.close();
									}
								}]
							});

						}

						function removeNationalTargets(identifier, record, canDelete){
							//public record exist with a draft
							if(record._state_s == 'draft' && record.publicRecord){
								var target = _.find($scope.nationalTargets, {identifier_s:identifier})
								if(target)
									target = record.publicRecord
							}
							else if(record._state_s == 'draft' || (record._state_s == 'public' && canDelete)){
								$timeout(function(){
									var target = _.find($scope.document.nationalTargets, {identifier:identifier})
									if(target)
										$scope.document.nationalTargets.splice(target, 1);
									target = _.find($scope.nationalTargets, {identifier_s:identifier})
									if(target)
										$scope.nationalTargets.splice(target, 1);
								}, 100)
							}
							else{
								record._state_s = 'workflow'
							}
						}
						function removeTargetAssessments(identifier, record, canDelete){
							//public record exist with a draft
							if(record._state_s == 'draft' && record.publicRecord){
								record = record.publicRecord
							}
							else if(record._state_s == 'draft' || (record._state_s == 'public' && canDelete)){
								$timeout(function(){
									var assessment = _.find($scope.document.targetAssessments, function(record){ return (record.assessment||record.aichiTarget).identifier == identifier});
									if(assessment)
										$scope.document.targetAssessments.splice(assessment, 1);
								}, 100)
							}
							else{
								record._state_s = 'workflow'
							}
						}
						var dialogOnPostWorkflowEvt = $rootScope.$on("evt:dialog-onPostWorkflow", function(evt, info){
							
							if(info.data && info.data.metadata)
								updateWorkflowStatus(info.data.metadata.schema, info)
						});

						function updateWorkflowStatus(type, info){
							$scope.waitForWorkflow[type] = {
								workflowId : info._id,
								identifier : info.data.identifier
							};
						}

						function hexToInteger(hex) {
							if (hex && hex.length >= 24)
								return parseInt(hex.substr(15, 9), 16);
		
							return hex;
						}
						
						if($rootScope.deviceSize == 'lg'){
							$element.find('#nav').affix({
								offset: {
									top: $('header').height()-$('#nav').height()+200
								}
							});	
							$('body').scrollspy({ target: '#nav' })
						}

					}
				};
			}
		]);

	});
