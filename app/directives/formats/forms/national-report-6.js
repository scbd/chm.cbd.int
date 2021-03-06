define(['require', 'text!./national-report-6.html', 'app', 'angular', 'lodash', 
'json!app-data/edit-form-messages.json', 'authentication', 'services/editFormUtility',  
'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 
'services/navigation', "utilities/solr", 'ngDialog', 'scbd-angularjs-services/locale',
'directives/forms/form-controls',"./reference-selector", 'directives/forms/km-rich-textbox', 'directives/forms/km-value-ml',
'directives/formats/views/national-target', 'directives/formats/views/national-assessment'
	],
	function(require, template, app, angular, _, messages) {
		'use strict';
		
		app.directive("editNationalReport6", ["$http", "$rootScope", "$q", "$location", "$filter", 'IStorage', 
		"editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", "solr", 
		"realm", '$compile', "$timeout", 'ngDialog', 'locale', 
			function($http, $rootScope, $q, $location, $filter, storage, editFormUtility, 
				navigation, authentication, siteMapUrls,thesaurus, guid, $route, solr, 
				realm, $compile, $timeout, ngDialog, locale) {
				return {
					restrict: 'E',
					template: template,
					replace: true,
					transclude: false,
					scope: {},
					link: function($scope, $element) {
						

						var reviewFormLoaded = false;
						$scope.targetAssessments = {};
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

						if (!$scope.options) {

							$scope.options = {
								countries			: $http.get("/api/v2013/thesaurus/domains/countries/terms", {cache: true}).then(function(o) {return $filter('orderBy')(o.data, 'name');}),
								jurisdictions		: $http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms", {cache: true}).then(function(o) {return o.data;}),
								aichiTargets		: function() {return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms", {cache: true}).then(function(o) {return o.data;});},
								gspcTargets			: function() {return $http.get("/api/v2013/thesaurus/domains/8D405050-50AF-45EA-95F7-A31A11196424/terms", {cache: true}).then(function(o) {return o.data;});},
								assessment			: function() {return $http.get("/api/v2013/thesaurus/domains/8D3DFD9C-EE6D-483D-A586-A0DDAD9A99E0/terms", {cache: true}).then(function(o) {return o.data;});},
								categoryProgress	: function() {return $http.get("/api/v2013/thesaurus/domains/EF99BEFD-5070-41C4-91F0-C051B338EEA6/terms", {cache: true}).then(function(o) {return o.data;});},
								confidenceLevel		: function() {return $http.get("/api/v2013/thesaurus/domains/B40C65BE-CFBF-4AA2-B2AA-C65F358C1D8D/terms", {cache: true}).then(function(o) {return o.data;});},
								gspcCategoryProgress: function() {return $http.get("/api/v2013/thesaurus/domains/254B8AE2-05F2-43C7-8DB1-ADC702AE14A8/terms", {cache: true}).then(function(o) {return o.data;});},
								nationalTargets		: function() {
									$scope.options.targets = $scope.nationalTargets||$scope.options.targets;
									if (!$scope.options.targets)
										$scope.options.targets = loadNationalTargets();
									return $q.when($scope.options.targets).then(function() {return _.map($scope.nationalTargets, function(item) {return {title: item.title_t,identifier: item.identifier_s};});});
								},
								targets: undefined
							};
						}

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

							$q.when(loadReferenceRecords({ 
									"fl"    : 'identifier_s, title_s, _workflow_s, _state_s, versionID_s', 
									schema: 'nationalReport6'
								}))
								.then(function(nationalReport) {
									if(nationalReport && nationalReport.length > 0)
										$scope.documentShare = { workingDocumentId : nationalReport[0].versionID_s };										
									if (!qs.uid && nationalReport && nationalReport.length > 0) {
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
									else
										pendingPromise();
								});
							
							
							// .then(function(doc) {
							// 	return doc;
							// });

							function pendingPromise(){
								promise.then(function(doc){
									return $q.when(authentication.user()).then(function(user){
										$scope.user = user;
										$scope.document = doc;
										$scope.status = "ready";
										return doc
									})
								}).then(function(doc) {
									$timeout(function(){
										 $q.when($scope.options.aichiTargets())
												.then(function(data) {
													$scope.aichiTargets = {};
													_.each(data, function(target){
														$scope.aichiTargets[target.identifier] = target
													})
													if (!doc.nationalContribution) {
														doc.nationalContribution = {};
														for (var i = 1; i <= 20; i++) {
															doc.nationalContribution['aichiTarget' + i] = {
																identifier: 'AICHI-TARGET-' + (i < 10 ? '0' + i : i)
															};
														}
													}
													return doc;
											}).then(function(doc) {
												return $q.when($scope.options.gspcTargets())
													.then(function(data) {
														$scope.gspcTargets={};
														_.each(data, function(target){
															$scope.gspcTargets[target.identifier] = target
														})
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
												loadAbsAndResourceMobilizationReport();																		
												$element.find('[data-toggle="tooltip"]').tooltip();
												
											});
									}, 3000)
									return doc;
								}).catch(function(err) {

									$scope.onError(err.data, err.status);
									throw err;
	
								})
							}
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
							
							if(document.targetPursued!==undefined){
								if(!document.targetPursued || (document.nationalTargets && document.nationalTargets.length == 0))
									document.nationalTargets = undefined;

								document.notReportingOnNationalTargets       = undefined;
								document.notReportingOnNationalTargetsReason = undefined;
							}
							else{
								document.targetPursued = undefined;
							}

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

							// clean any languages previously selected, this is required 
							// because the tab may have not been loaded.
							document = updateLocaleChanges(document);

							if (_.isEmpty(document.relevantInformation)) delete document.relevantInformation;
							if (_.isEmpty(document.relevantDocuments))   delete document.relevantDocuments;

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
						var tabDirectiveStatus = {};
						$scope.$watch('tab', function(tab) {
						
							// $('html,body').animate({scrollTop: $('.portal-header').offset().top -120}, "slow");
							if (tab == 'review')
								$scope.validate();
							
							switch (tab) {
								case 'general':{
									nextTab = 'implementation';
									prevTab = '';
									$scope.colorSubRecordError();
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
									if(_.isEmpty($scope.targetAssessments||{}))
										loadProgressAssessment();
									$scope.colorSubRecordError();
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
									if(!reviewFormLoaded){
										$scope.loadingReviewTab = true;
										require(['../views/national-report-6'], function(){
											reviewFormLoaded = true;
											var formHolder = $element.find('#reviewSchemaView')
											var directiveHtml = formHolder.html();

											$scope.loadingReviewTab = false;
											$scope.$apply(function(){
												formHolder.children().replaceWith($compile(directiveHtml)($scope));
											});
										})
									}
									break;
								}
								default:
									break;
							}
							if(tab && tab!='general' && tab!='review' && !tabDirectiveStatus[tab]){
								$scope['loading' + tab + 'Tab'] = true;
								$('html,body').animate({scrollTop: $('.portal-header').offset().top }, "slow");
								require(['./nr6-directives/' + tab], function(){
									var tabName = snake_case(tab);
									var directiveHtml = '<DIRECTIVE ></DIRECTIVE>'.replace(/DIRECTIVE/g, 'nr6-' + tabName + '-tab');

									$scope.$apply(function(){
										var formHolder = $element.find('#' + tab + 'Tab')
										formHolder.empty().append($compile(directiveHtml)($scope));
										tabDirectiveStatus[tab] = true;
										$scope['loading' + tab + 'Tab'] = false;

									});
								})
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
							$scope.subRecordErrors = undefined;
							$scope.colorSubRecordError();
							return $scope.validate()
							.then(function(hasError) {
								if (hasError)
									$scope.tab = "review";
								return $scope.validateSubRecords();								
							});
						};
						$scope.validateSubRecords = function(){
							var document = $scope.document;
							var nationalTargets = $scope.nationalTargets
							var stopProcess = false;
							var subRecordErrors = []
							var subRecordsDialog = ngDialog.open({
								template: 'subRecordsValidation.html',	
								className: 'ngdialog-theme-default ngdialog-custom',
								closeByDocument: false,
								closeByEscape: false,
								showClose: false,
								closeByNavigation: false,
								controller : ['$scope', function($scope){
									var validationRequests = [];
									if(document.targetPursued){
										validationRequests = _.map(document.nationalTargets||[], "identifier");
									}

									if(document.progressAssessments && document.progressAssessments.length>0){
										_.each(document.progressAssessments, function(a){
											if(a.assessment){
												validationRequests.push(a.assessment.identifier);
											}
										});
									}
									if(validationRequests.length > 0){
										$scope.loadingRecords = true;
										var filter = "(type eq 'nationalTarget' or type eq 'nationalAssessment')"
										$http.get('/api/v2013/documents', {params : {$filter:filter, collection:'mydraft', body:true}})
												.then(function(results){
													$scope.loadingRecords = false;
													$scope.recordsToValidate = _.filter(results.data.Items, function(item){return ~validationRequests.indexOf(item.identifier)});
													$scope.hasErrors = false;
													$scope.validatingRecords = true;
													var validations = _.map($scope.recordsToValidate, function(record){
													return $http.put('/api/v2013/documents/x/validate', record.workingDocumentBody||record.body, 
																{params:{schema: record.type}})
															.then(function(result){
																if(result.data.errors && result.data.errors.length>0){
																	$scope.hasErrors = true;
																	record.status = 1;
																	record.errors = result.data.errors
																}
																else
																	record.status = 2
															})
													})
													$q.all(validations)
													.catch(function(err){
														console.log(err)
														$scope.hasErrors = true;
														$scope.fetchError = "Error processing this request";
													})
													.finally(function(){
														$scope.validatingRecords = false;
														if($scope.hasErrors && $scope.hasErrors)
															subRecordErrors = $scope.recordsToValidate;
													})
												})
												.catch(function(err){
													console.log(err)
													$scope.hasErrors = true;
													$scope.fetchError = "Error processing this request";
												})
												.finally(function(){
													$scope.loadingRecords = false;
												});
									}
									$scope.close = function(){
										stopProcess = true;
										ngDialog.close();
									}
									$scope.continue = function(){
										stopProcess = false;
										ngDialog.close();
									}
								}]
							});

							return subRecordsDialog.closePromise .then(function(){ 
								$scope.subRecordErrors = subRecordErrors;
								$scope.colorSubRecordError();
								return stopProcess;
							});
						}
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
							if(!$scope.documentShare || !$scope.documentShare.workingDocumentId){//load draft working id for sharing.
								loadReferenceRecords({ 
									"fl"    : 'identifier_s, title_s, _workflow_s, _state_s, versionID_s', 
									schema: 'nationalReport6'
								})
								.then(function(nationalReport) {
									if(nationalReport && nationalReport.length > 0)
										$scope.documentShare = { workingDocumentId : nationalReport[0].versionID_s };
								});
							}
						};

						//==================================
						//
						//==================================
						$scope.onPostClose = function() {
							$rootScope.$broadcast("onPostClose", messages.onPostClose);
							$location.url("/submit/nationalReport6");
						};

						$scope.onPreSaveDraftVersion = function(){

							return $scope.document;
						}

						//==================================
						//
						//==================================
						$scope.onError = function(error, status) {

							if(error.data)
								error = error.data;
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
							} else if (error && (error.Message||error.message))
								$scope.error = error.Message||error.message;
							else
								$scope.error = error;

							$('html,body').animate({scrollTop: $('.portal-header').offset().top }, "slow");
						};

						$scope.init();

						//============================================================
						//
						//============================================================
						$scope.addImplementationMeasure = function() {
							if (!$scope.document.implementationMeasures) {
								$scope.document.implementationMeasures = [];
							}
							var newMeasure = {}
							$scope.document.implementationMeasures.push(newMeasure);
							$scope.editInDialog(newMeasure, 'implementationMeasure', 'editImplementationRecordModal');
						};

						//============================================================
						//
						//============================================================
						$scope.removeImplementationMeasure = function(measure) {
							if(confirm)

							var record = measure;
							ngDialog.open({
								template: 'deleteImplementationRecordModal', 
								controller : ['$scope', function($scope){									
									$scope.draftRecordToDelete = record;
									$scope.deleteImplementation = function(recordToDelete){										
										confirmDelete(recordToDelete);
										ngDialog.close();
									}

									$scope.closeDialog = function(){
										ngDialog.close();
									}
								}]
							});
							function confirmDelete(measure){
								if (measure && $scope.document.implementationMeasures) {
									$scope.document.implementationMeasures.splice($scope.document.implementationMeasures.indexOf(measure), 1);
								}
							}
						};

						$scope.editInDialog = function(record, name, template){
							// var record 		= target;
							
							ngDialog.open({
								className: 'ngdialog-theme-default ngdialog-custom white-background',
								template: template, 
								scope 	: $scope,
								controller : ['$scope', function($scope){									
									$scope[name] 		= record;
									
									$scope.closeDialog 	= function(){
										record = $scope[name];
										ngDialog.close();
									}
								}]
							});
						}

						$scope.$watch('::document', function(newVal, old) {

							if (!$scope.document || newVal === undefined)
								return;
							if (newVal && newVal.targetPursued) {
								loadNationalTargets();
							}
						});

						$scope.$watch('document.targetPursued', function(newVal, old) {

							if (!$scope.document || newVal === undefined && !(newVal===undefined && $scope.document.notReportingOnNationalTargets))
								return;

							if(newVal !== undefined){
								$scope.document.notReportingOnNationalTargets = undefined;
							}
							if (newVal === false || (newVal===undefined && $scope.document.notReportingOnNationalTargets)) { //if target not pursued by country than the country has to assess againts all AICHI targets
								$scope.document.progressAssessments = [];
								//nationalContributions contains preloaded aichiTargets just use instead of reloading
								var aichiTargets = _.compact(_.pluck($scope.document.nationalContribution, 'identifier'));
								_.map(aichiTargets, function(target) {
									$scope.document.progressAssessments.push({
										aichiTarget: {
											identifier: target
										}
									});
								});
								loadProgressAssessment();
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
						$scope.getNationalTargetTitle = function(identifier, locale) {

							if ($scope.nationalTargets) {
								var nationalTarget = _.find($scope.nationalTargets, function(target) {
									return target && target.identifier_s == identifier;
								});
								if (nationalTarget)
									return nationalTarget.title[locale];
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

								var government;
								if($scope.document && $scope.document.government){
									government = $scope.document.government.identifier
								}
								else
									government = $scope.defaultGovernment();

								if (!options.skipLatest && options.latest === undefined)
									options.latest = true;
								
								government = (government||'UNKNONW');
								
								options = _.assign({
									schema: options.schema,
									target: options.nationalTargetId,
									rows: 500,
									government: government
								}, options || {});

								var query = [];
								var fq = [];
								// Add Schema
								fq.push("schema_s:" + solr.escape(options.schema));

								if (options.target)
									query.push("nationalTarget_s:(" + solr.escape(options.target)+')');

								if (options.government)
									fq.push("government_s:" + solr.escape(options.government));

								if (options.identifier)
									query.push("identifier_s:" + solr.escape(options.identifier));

								if (options.state)
									fq.push("_state_s:" + solr.escape(options.state));

								fq.push("realm_ss:" + (appRealm || realm).toLowerCase());

								// Apply ownership
								// query.push(_.map(($rootScope.user||{}).userGroups, function(v){
								// 	return "_ownership_s:"+solr.escape(v);
								// }));

								if (options.latest !== undefined) {
									fq.push("_latest_s:" + (options.latest ? "true" : "false"));
								}

								// AND / OR everything

								if(query.length==0)
									query = '*:*'
								else 
									query = solr.andOr(query);
									
								return querySolr(fq, query, options.rows, options.fl, options)
						}

						function querySolr(fq, query, rows, fields, options){
							var qsParams = {
								"fl"	: 	"id, identifier_s, uniqueIdentifier_s, schema_t, schema_s, createdDate_dt, title_*, summary_*, description_*, reportType_EN_t, " +
										  	"url_ss, _revision_i, _state_s, version_s, _latest_s, _workflow_s, isAichiTarget:isAichiTarget_b,nationalTarget_s, aichiTargets:aichiTargets_EN_ss, otherAichiTargets:otherAichiTargets_EN_ss, date_dt, progress_s",
								"sort"	: 	(options||{}).sort||"createdDate_dt asc",
								"start"	: 	0,
								"rows"	: 	rows,
							};

							if (options && options.group){
								qsParams.group = options.group;
								qsParams['group.field'] = options['group.field']
								qsParams['group.limit'] = options['group.limit']
							}

							if(fields)
								qsParams.fl = fields;

							if(fq)
								qsParams.fq = fq
							if(query)
								qsParams.q = query;
							
							if(locale != 'en')
								qsParams.fl = qsParams.fl.replace(/_EN_/g, '_'+locale.toUpperCase()+'_')

							return $http.get("/api/v2013/index", {params: qsParams}).then(function(res) {

								if(options && options.group){
									var fieldGroups = res.data.grouped[options['group.field']];
									if(fieldGroups){
										_.each(fieldGroups.groups, function(o){
											_.each(o.doclist.docs, defaultLstring);
										});
									}
									return res.data.grouped;
								}
								
								return _.map(res.data.response.docs, defaultLstring);

							});
						}
						function defaultLstring(v){
							return _.defaults(v, {
								schemaName: solr.lstring(v, "schema_*_t", "schema_EN_t", "schema_s"),
								title: solr.lstring(v, "title_*_t", "title_EN_t", "title_t"),
								summary: solr.lstring(v, "summary_*_t", "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t"),
								url    : toLocalUrl(v.url_ss)
							});
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

							$scope.loadingNationalTargets = true;
							var query = loadReferenceRecords({
								schema			: 'nationalTarget',
								skipLatest		: true,
								group			: true,
								'group.field'	: 'identifier_s',
								'group.limit'	: 2,
								sort			: 'title_s asc'
							});
							return $q.when(query)
								.then(function(data) {
									if(data){

										var solrIdentifiers = _.map(data.identifier_s.groups, 'groupValue')
										//remove any targets that have been deleted
										if($scope.document.nationalTargets){
											for(var i=$scope.document.nationalTargets.length-1; i>=0; --i){
												if(!_.includes(solrIdentifiers,  $scope.document.nationalTargets[i].identifier))
													$scope.document.nationalTargets.splice(i, 1)
											}
										}
										data = data.identifier_s.groups;										
										var indexNationalTargets = {};//_.clone($scope.document.nationalTargets||[]);
										_.each(data, function(target){
											var existingTarget = _.find($scope.document.nationalTargets, function(item){return item.identifier ==  target.groupValue})
											if(!existingTarget){
												if(!$scope.document.nationalTargets)
													$scope.document.nationalTargets = [];
												$scope.document.nationalTargets.push({identifier:target.groupValue});
											}

											var draftRecord 	= _.find(target.doclist.docs, function(o){return o._state_s == 'draft' || o._state_s == 'workflow'});
											var publicRecord 	= _.find(target.doclist.docs, {_state_s : 'public'})
											indexNationalTargets[target.groupValue] = draftRecord || publicRecord;

											if(draftRecord && publicRecord)
												indexNationalTargets[target.groupValue].publicRecord = publicRecord;

											//check for record workflow status
											if($scope.waitForWorkflow && $scope.waitForWorkflow.nationalTarget){
												var workflowDetails = $scope.waitForWorkflow.nationalTarget;
												if(workflowDetails.identifier == target.groupValue){

													if((draftRecord._state_s == 'workflow' && workflowDetails.workflowId == $scope.getWorkflowId(draftRecord) 
														|| publicRecord._state_s== 'public')){

														$scope.waitForWorkflow.nationalTarget = undefined;
													}
												}
											}
										})
										$scope.nationalTargets = indexNationalTargets

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
							var targets = $scope.document.nationalTargets;
							
							if($scope.document && $scope.document.targetPursued===false ||
								($scope.document.targetPursued===undefined && $scope.document.notReportingOnNationalTargets)){
								targets = $scope.document.nationalContribution;//copy aichi targets
							}
							var targetAssessmentIdentifiers = sortAssessments(targets);
							var targetIdentifiers = _.map(targetAssessmentIdentifiers, function(assessment){
								return (assessment.nationalTarget||assessment.aichiTarget).identifier;});

								// nationalTargetId:targetIdentifiers.join(' '),
							$q.when(loadReferenceRecords({
								schema: 'nationalAssessment',
								rows: 100,
								skipLatest: true
							}))
							.then(function(result) {
								result = _.filter(result, function(item){
									return _.includes(targetIdentifiers, item.nationalTarget_s)
								})								
								// //get all draft records
								var targetAssessments = {};
								_.each(result, function(rec) {
									if(rec.version_s == 'draft'){
										targetAssessments[rec.identifier_s] = rec;
									}
								});	
								//public records
								_.each(result, function(targetAssessment) {
									var existingAssessment = targetAssessments[targetAssessment.identifier_s];
									if(targetAssessment._state_s == 'public' && !existingAssessment){					
										targetAssessments[targetAssessment.identifier_s] = targetAssessment;
									}
									else if(existingAssessment && targetAssessment._state_s == 'public'){
										//keep copy of public record in existingAssessment useful when user is trying to delete show both draft and public record 
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

									var record = targetAssessmentIdentifiers[assessment.nationalTarget_s];
									if(record)
										record.assessment = {identifier : assessment.identifier_s};
								});
								$scope.document.progressAssessments = _.values(targetAssessmentIdentifiers);
								$scope.targetAssessments = targetAssessments;
							})
							.finally(function(){$scope.loadingAssessments = false;});

						}
						function sortAssessments(targets){

							var targetAssessmentIdentifiers = {};
							
							_.each(targets, function(target) {
								var assessment = {};
								
								if($scope.document.targetPursued===false ||
									($scope.document.targetPursued===undefined && $scope.document.notReportingOnNationalTargets)){ 
									assessment.aichiTarget =  { identifier: target.identifier };
								}
								else {
									assessment.nationalTarget =  { identifier: target.identifier };
								}

								if($scope.targetAssessments){
									var existingAssessment = _.find($scope.targetAssessments, {nationalTarget_s:target.identifier})
									if(existingAssessment)
										assessment.assessment = { identifier: existingAssessment.identifier_s};
								}

								if(target.identifier)
									targetAssessmentIdentifiers[target.identifier] = assessment;
							});

							$scope.document.progressAssessments = _.values(targetAssessmentIdentifiers);

							return targetAssessmentIdentifiers;
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
						
						function loadAbsAndResourceMobilizationReport(){
							if(!($scope.document||{}).government)
								return;

							var government = $scope.document.government.identifier;
							var target16;
							var target16Query = '';

							var target20;
							var target20Query = '';
							if ($scope.document && $scope.document.nationalContribution) {
								target16 = _.find($scope.document.nationalContribution, {identifier: 'AICHI-TARGET-16'});
								target16Query = solr.andOr(["realm_ss:" + realm.toLowerCase().replace(/^chm/, 'abs'),
															"schema_s:absNationalReport",
															"_state_s:public", "government_s:"+government])
							}

							if ($scope.document && $scope.document.nationalContribution) {
								target20 = _.find($scope.document.nationalContribution, {identifier: 'AICHI-TARGET-20'});
								target20Query = solr.andOr(["realm_ss:" + realm.toLowerCase(),
															"schema_s:resourceMobilisation","_latest_s:true",
															"_state_s:public", "government_s:"+government])
							}
							var query = target16Query+' OR '+target20Query;
							$q.when(querySolr(undefined, query, 10))
							.then(function(results){
								$scope.absNationalReport = _.find(results, function(record){return record.schema_s=='absNationalReport'});
								if($scope.absNationalReport){
									if (!target16.nationalReport && !target16.nationalReportDescription && target16.linkedRecords) {
										if (!$scope.warningsReport)
											$scope.warningsReport = {warnings: []};
										$scope.warningsReport.warnings.push({
											code: 'National contribution for AICHI Target 16',
											property: 'nationalContributions-AICHI-TARGET-16-nationalReportDescription'
										})
									}
									if (target16) {
										target16.nationalReport = {identifier: $scope.absNationalReport.identifier_s + '@' + $scope.absNationalReport._revision_i};
									}
								}
								$scope.resourceMobilisation = _.find(results, function(record){return record.schema_s=='resourceMobilisation'});;
								if($scope.resourceMobilisation){
									if (target20 && !target20.resourceMobilisationReport) {
										target20.resourceMobilisationReport = {
											identifier: $scope.resourceMobilisation.identifier_s
										};
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
									params.documentLanguages = $scope.document.header.languages;
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
									})
									.finally(function(){$scope.deletingRecord = false;});
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

						$scope.showRecord = function(record, name){
							record.showRecord = !record.showRecord;

							if(!record.showRecord || (record.document && record.showRecord))
								return;
							record.showRecordLoading = true;
							var request;
							if(record._state_s == 'public')
								request = storage.documents.get(record.identifier_s)
							else
								request = storage.drafts.get(record.identifier_s);

							request.then(function(document){
								record.document = document.data;
							})
							.finally(function(){record.showRecordLoading=false;});
						}

						$scope.getLocale = function(){
							if($scope.review.locale=='*')
								return $scope.document.header.languages;

							return $scope.review.locale || locale;
						}

						function removeNationalTargets(identifier, record, canDelete){
							$timeout(function(){
								//public record exist with a draft
								if(record._state_s == 'draft' && record.publicRecord){
									$scope.nationalTargets[identifier] = record.publicRecord;
								}
								else if(record._state_s == 'draft' || (record._state_s == 'public' && canDelete)){
										var index = _.findIndex($scope.document.nationalTargets, {identifier:identifier})
										if(~index)
											$scope.document.nationalTargets.splice(index, 1);
										delete $scope.nationalTargets[identifier];
								}
								else{
									record._state_s = 'workflow'
								}
							}, 100)
						}
						function removeTargetAssessments(identifier, record, canDelete){
							//public record exist with a draft
							$timeout(function(){
								if(record._state_s == 'draft' && record.publicRecord){
									$scope.targetAssessments[record.identifier_s]  = record.publicRecord
								}
								else if(record._state_s == 'draft' || (record._state_s == 'public' && canDelete)){
									
										var assessment = _.find($scope.document.progressAssessments, function(record){ return (record.assessment||{}).identifier == identifier});
										if(~assessment)
											assessment.assessment = undefined;
								}
								else{
									$scope.targetAssessments[record.identifier_s]._state_s = 'workflow'
								}
							}, 100)
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
						
						// if($rootScope.deviceSize == 'lg'){
						// 	$element.find('#nav').affix({
						// 		offset: {
						// 			top: $('header').height()-$('#nav').height()+200
						// 		}
						// 	});	
						// 	$('body').scrollspy({ target: '#nav' })
						// }

						$scope.movePosition = function(collection, index, direction, collectionName){

							if(direction == 'up'){
								if (index === 0) {
									return;
								}
								[collection[index], collection[index-1]] = [collection[index-1], collection[index]];
							}
							else if(direction == 'down'){
								if (index === collection.length - 1) {
									return;
								}
								[collection[index], collection[index+1]] = [collection[index+1], collection[index]];
							}
							$element.find('[data-toggle="tooltip"]').tooltip();

							if(collectionName == 'nationalTarget')
								sortAssessments(collection);
						}

						$scope.onEditorFileUpload = function(data){
							if(!$scope.document.additionalDocuments)
								$scope.document.additionalDocuments = [];
							var editorImage = {
								url: data.url,
								name: data.filename,
								tag : 'editorImage'
							};
							$scope.document.additionalDocuments.push(editorImage);

						}

						$scope.onEditorPaste = function(html){

							if(html){
								var localeHtml = $('<div>'+html+'</div>')
								$(localeHtml).find('table').addClass('table');

								return localeHtml.html();

							}
							return html;
						}

						$scope.updateNotReportingOnNationalTargets = function(selection){
							if(selection){
								$scope.document.targetPursued = undefined;
							}
						}

						$scope.colorSubRecordError = function(){
							$element.find('.error-background').removeClass('error-background')
							$timeout(function(){
								_.each($scope.subRecordErrors, function(error){
									if(error.status == 1)//has errors
										$element.find('#pnl_'+error.identifier).addClass('error-background');
								});
							}, 500)
						};
						//==================================
						//
						//==================================
						function snake_case(name, separator) {
							separator = separator || '-';
							return name.replace(/[A-Z]|\d+/g, function(letter, pos) {
							return (pos ? separator : '') + letter.toLowerCase();
							});
						}

						function updateLocaleChanges(document){
							_.each(document, function(prop, key){

								if(isLstring(prop)){
									prop = _(prop).pick($scope.document.header.languages||[]).forEach(function(value, key, text){
										if(!value || $("<i>").html(text[key]).text().trim() == ""){
											delete text[key];
										}
										else{
											text[key] = value.replace(/\<pre/ig, '<div')
												 .replace(/<\/pre\>/ig, '</div>')
										}
									}).value();
									if(_.isEmpty(prop))
										prop = undefined;
									document[key] = prop;
								}
								else if(!angular.isString(prop))
									updateLocaleChanges(prop);
								
							})
							return document;
						}
						function isLstring(prop){
							return prop && (prop.ar || prop.en || prop.zh || prop.ru || prop.fr || prop.es); 
						}
					}
				};
			}
		]);
	});
