define(['text!./national-report-6.html', 'app', 'angular', 'lodash', 'authentication', '../views/national-report-6',
'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities',
'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', './reference-selector', "utilities/solr", "./reference-selector", 'ngDialog', 'scbd-angularjs-services/locale'
	],
	function(template, app, angular, _) {
		'use strict';

		app.directive("editNationalReport6", ["$http", "$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", "solr", "realm", '$compile', "$timeout", 'ngDialog', 'locale',
			function($http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls,
				thesaurus, guid, $route, solr, realm, $compile, $timeout, ngDialog, locale) {
				return {
					restrict: 'E',
					template: template,
					replace: true,
					transclude: false,
					scope: {},
					link: function($scope) {

						var targetAssessments = [];
						$scope.status = "";
						$scope.error = null;
						$scope.tab = "general";
						$scope.document = null;
						$scope.review = {
							locale: locale
						};
						$scope.qs = $location.search();
						$scope.user
							// Ensure user as signed in
						navigation.securize();

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
									return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {

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
										targetPursued: undefined
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
								if (!doc.nationalContribution) {
									return $q.when($scope.options.aichiTargets())
										.then(function(data) {
											doc.nationalContribution = {};
											for (var i = 1; i <= 20; i++) {
												doc.nationalContribution['aichiTarget' + i] = {
													identifier: 'AICHI-TARGET-' + (i < 10 ? '0' + i : i)
												};
											}
											return doc;
										});
								}
								return doc;

							}).then(function(doc) {
								if (!doc.gspcNationalContribution) {
									return $q.when($scope.options.gspcTargets())
										.then(function(data) {
											doc.gspcNationalContribution = {}
											for (var i = 1; i <= 16; i++) {
												doc.gspcNationalContribution['gspcTarget' + i] = {
													identifier: 'GSPC-TARGET-' + (i < 10 ? '0' + i : i)
												};
											}
											return doc;
										});
								}
								return doc;
							}).then(function(doc) {
								$scope.document = doc;
								$q.all([loadABSNationaReport(), loadResourceMobilasationReport()])
									.then(function() {
										$scope.status = "ready";
									});

								if (!qs.uid) {
									$q.when(loadReferenceRecords({
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
															$location.path('/submit/nationalReport6/' + _.head(nationalReport)['identifier_s']);
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
						$scope.$watch('tab', function(tab) {
							if (tab == 'review')
								$scope.validate();

							// if(tab == 'implementation')$scope.closeall('.implementationMeasure');
							// if(tab == 'progress')$scope.closeall('.progressAssessment');
							// if(tab == 'nationalContribution')$scope.closeall('.aichiTarget');
							// if(tab == 'gspcContribution')$scope.closeall('.gspcTarget');
						});

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
							$rootScope.$broadcast("onPostWorkflow", "Publishing request sent successfully.");
							$location.url("/submit/nationalReport6");
						};

						//==================================
						//
						//==================================
						$scope.onPostPublish = function() {
							$scope.$root.showAcknowledgement = true;
							$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
							$location.url("/submit/nationalReport6");
						};

						//==================================
						//
						//==================================
						$scope.onPostSaveDraft = function() {
							$rootScope.$broadcast("onSaveDraft", "Draft record saved.");
						};

						//==================================
						//
						//==================================
						$scope.onPostClose = function() {
							$rootScope.$broadcast("onPostClose", "Record closed.");
							$location.url("/submit/nationalReport6");
						};



						//==================================
						//
						//==================================
						$scope.onError = function(error, status) {
							$scope.status = "error";

							if (status == "notAuthorized") {
								$scope.status = "hidden";
								$scope.error = "You are not authorized to modify this record";
							} else if (status == 404) {
								$scope.status = "hidden";
								$scope.error = "Record not found.";
							} else if (status == "badSchema") {
								$scope.status = "hidden";
								$scope.error = "Record type is invalid.";
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
							var existingAssesment = _.find(targetAssessments, function(progress) {
								return progress.identifier_s == assessment.identifier;
							});
							if (existingAssesment)
								return existingAssesment[field];

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
									query.push("nationalTarget_s:" + solr.escape(options.target));

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
									"fl": "identifier_s, uniqueIdentifier_s, schema_t, title_t, summary_t, description_t, reportType_EN_t, " +
										"url_ss, _revision_i, _state_s, version_s, _latest_s, _workflow_s, isAichiTarget_b, aichiTargets_*, otherAichiTargets_*, date_dt, progress_s",
									"sort": "updatedDate_dt desc",
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
											summary: solr.lstring(v, "summary_*_t", "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t")
										});
									});

								});
							}
						}

						//============================================================
						//
						//============================================================
						function loadNationalTargets() {

							var existingnationalTargets = angular.copy($scope.document.nationalTargets || []);
							$scope.document.nationalTargets = [];
							$scope.nationalTargets = undefined;
							$scope.loadingNationalTargets = true;
							var query = loadReferenceRecords({
								schema: 'nationalTarget',
								skipLatest: true
							});
							return $q.when(query)
								.then(function(data) {
									if(data){
										var indexNationalTargets = [];
										var nationalTargets = [];

										//sort index data so darft reocrds are at top
										data = $filter('orderBy')(data, ['identifier_s', '-_revision_i']);
										
										//get all draft records
										_.each(data, function(nationalTarget) {
											if(nationalTarget.version_s == 'draft'){
												nationalTargets.push({
													identifier: nationalTarget.identifier_s
												});
												indexNationalTargets.push(nationalTarget);
											}
										});

										_.each(data, function(nationalTarget) {
											if(nationalTarget._state_s == 'public' && !_.contains(nationalTargets, nationalTarget.identifier_s)){
												nationalTargets.push({
													identifier: nationalTarget.identifier_s
												}); 
												indexNationalTargets.push(nationalTarget);
											}										
										});

										$scope.document.nationalTargets = nationalTargets;
										$scope.nationalTargets = indexNationalTargets;
									}
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
							$scope.document.progressAssessments = []; 
							targetAssessments = [];
							var targets = $scope.nationalTargets;
							if($scope.document && $scope.document.targetPursued===false)
								targets = $scope.document.nationalContribution;

							var targetsQuery = _.map(targets, function(nationalTarget) {

							   var assessment = {};
							   if($scope.document && $scope.document.targetPursued===false){
									assessment.aichiTarget =  { identifier: nationalTarget.identifier };
							   }
							   else{
								   assessment.nationalTarget =  { identifier: nationalTarget.identifier_s };
								};

								return $q.when(loadReferenceRecords({
									schema: 'nationalAssessment',
									nationalTargetId: nationalTarget.identifier_s||nationalTarget.identifier,
									rows: 1,
									skipLatest: true
								}))
								.then(function(result) {
									if (result && result.length > 0) {											
										targetAssessments.push(result[0]);
										assessment.assessment = {identifier : result[0].identifier_s};
									}
									return assessment;
								});
							});
							$q.all(targetsQuery)
							.then(function(data){

								if($scope.document && $scope.document.targetPursued===false)
									data = _.sortBy(data,  function(assessment){ return Number(assessment.aichiTarget.identifier.replace('AICHI-TARGET-', '')); });
								
								$scope.document.progressAssessments = data;								
							})
							.finally(function(){$scope.loadingAssessments = false;})
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
							if ($scope.document && $scope.document.targetPursued && data.type == 'workflowActivityStatus' &&
								data.data && data.data.identifier && (data.data.schema == 'nationalTarget' || data.data.schema == "nationalAssessment")) {

								var options = {
									identifier: data.data.identifier,
									latest: true,
									schema: data.data.schema
								};

								if (data.data.workflowActivity == 'document-lock')
									options.latest = false;
								if (data.data.workflowActivity == 'document-deleted') {

								} else {
									if (data.data.schema == 'nationalTarget') {

										$timeout(function() {
											$q.when(loadReferenceRecords(options))
												.then(function(data) {
													if (data && data.length > 0) {
														var document = _.findWhere($scope.nationalTargets, {
															identifier_s: _.head(data).identifier_s
														});
														if (document) {
															_assign(document, _.head(data))
														} else {
															$scope.nationalTargets.push(_.head(data));
															if (!$scope.document.progressAssessments)
																$scope.document.progressAssessments = [];
															$scope.document.progressAssessments.push({
																nationalTarget: {
																	identifier: _.head(data).identifier_s
																}
															});
														}
													}
												});
										}, 1000);
									} else if (data.data.schema == 'nationalAssessment') {
										$timeout(function() {
											$q.when(loadReferenceRecords(options))
												.then(function(data) {
													if (data && data.length > 0) {
														var newDoc = _.head(data);
														var document = _.find($scope.document.progressAssessments, function(assessment) {
															return assessment.nationalTarget.identifier == newDoc.nationalTarget_s;
														});
														if (document) {
															document.assessment = {
																identifier: newDoc.identifier_s
															};
															var assessment = _.findWhere(targetAssessments, {
																identifier_s: newDoc.identifier_s
															});
															_assign(assessment, newDoc);
														} else {
															targetAssessments.push(newDoc);
															$scope.document.progressAssessments.push({
																nationalTarget: {
																	identifier: newDoc.nationalTarget_s
																},
																assessment: {
																	identifier: newDoc.identifier_s
																}
															});
														}
													}
												});
										}, 1000);
									}
								}

							}
						});


						$scope.$on('$destroy', function() {
							evtServerPushNotification();
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
									console.log(absNR);
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

					}
				};
			}
		]);

		//==================================
		//
		//==================================
		app.directive('nrPopover', function() {
			return {
				restrict: 'A',
				link: function(scope, elem, attrs) {
					elem.popover({
						trigger: 'click',
						placement: attrs.dataPlacement || 'auto',
						html: true,
						container: 'body'
					});
				}
			};
		});

	});





// //===========================
// //
// //===========================
// $scope.openDialog = function(data, name, directiveName, options) {

// 	options = options || {};

// 	return $q(function(resolve, reject) {

// 		require([name], function(controller) {

// 			var params = {};
// 			if(directiveName == 'edit-national-assessment-dialog'){
// 				if(data.assessment)
// 					params.uid = data.assessment.identifier; 
// 				if(!data.assessment && data.aichiTarget)
// 					params.aichiTarget = data.aichiTarget;
// 				if(!data.assessment && data.nationalTarget)
// 					params.nationalTarget = data.nationalTarget;
// 			}
// 			else if(directiveName == 'edit-national-target'){

// 			}

// 			var directiveHtml = '<span DIRECTIVE params qs="qs"></span>'.replace(/DIRECTIVE/g, directiveName)
// 			//.replace('params', 'qs=\'' + JSON.stringify(params) + '\'');
// 			console.log(directiveHtml);
// 			$scope.$apply(function(){
// 				options.template = directiveHtml;//$compile(directiveHtml)($scope);
// 			});
// 			options.controller = ['$scope', function($scope){
// 				$scope.qs = params;
// 			}]
// 			options.plain = true;
// 			options.closeByDocument = true;
// 			options.showClose = true;

// 			var dialogWindow = ngDialog.open(options);

// 			dialogWindow.closePromise.then(function(res){

// 				if(res.value=="$escape")      delete res.value;
// 				if(res.value=="$document")    delete res.value;
// 				if(res.value=="$closeButton") delete res.value;

// 				return res;
// 			});

// 			resolve(dialogWindow);

// 		}, reject);
// 	});
// }
// <button ng-if="!progressAssessment.assessment && progressAssessment.aichiTarget" target="_blank" class="btn btn-primary" ng-click="openDialog(progressAssessment,'directives/formats/forms/national-assessment-dialog','edit-national-assessment-dialog')">Add Assessment</button>