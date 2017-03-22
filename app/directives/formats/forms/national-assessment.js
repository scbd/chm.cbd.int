define(['text!./national-assessment.html', 'app', 'angular', 'lodash', 'authentication', '../views/national-assessment', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', './national-indicator', './inline-editor',
'scbd-angularjs-services/locale'], function(template, app, angular, _) {
	'use strict';

	app.directive("editNationalAssessment", ['$http', "$rootScope", "$filter", "$q", 'IStorage', "authentication", "editFormUtility", "guid", "$location", "navigation", 'siteMapUrls', '$route', 'inlineEditor', 'locale', function($http, $rootScope, $filter, $q, storage, authentication, editFormUtility, guid, $location, navigation, siteMapUrls, $route, inlineEditor, locale) {
		return {
			restrict: 'EA',
			template: template,
			replace: false,
			transclude: false,
			scope: {
				query:'&?',
				closeDialog: '&?'
			},
			link: function($scope) {
				$scope.status = "";
				$scope.error = null;
				$scope.document = null;
				$scope.tab = 'general';
				$scope.review = {
					locale: locale
				};
				
				var qs = $route.current.params;
				var openInDialog = false;
				if($scope.query){//when its open in dialog
					qs = $scope.query();
					$scope.container = '.ngdialog-theme-default';
					openInDialog = true;
				}
				

				$scope.checkbox = {

					confidences: function(){
							return $http.get("/api/v2013/thesaurus/domains/B40C65BE-CFBF-4AA2-B2AA-C65F358C1D8D/terms", {cache: true})
									.then(function(o) {
										return o.data;
									});
					},
				}
				$scope.options = {
					countries: $http.get("/api/v2013/thesaurus/domains/countries/terms", {
						cache: true
					}).then(function(o) {
						return $filter('orderBy')(o.data, 'title|lstring');
					}),
					progresses: function(){
						return $http.get("/api/v2013/thesaurus/domains/EF99BEFD-5070-41C4-91F0-C051B338EEA6/terms", {
						cache: true
					}).then(function(o) {
						return o.data;
					})},
					confidences: function(){
						return $http.get("/api/v2013/thesaurus/domains/B40C65BE-CFBF-4AA2-B2AA-C65F358C1D8D/terms", {
						cache: true
					}).then(function(o) {
						return o.data;
					})},
					strategicPlanIndicators: $http.get("/api/v2013/index", {
						params: {
							q: "schema_s:strategicPlanIndicator",
							fl: "identifier_s,title_t",
							sort: "title_s ASC",
							rows: 999999
						}
					}).then(function(o) {
						return _.map(o.data.response.docs, function(o) {
							return {
								identifier: o.identifier_s,
								title: o.title_t
							};
						});
					}).then(null, $scope.onError),
					implementationActivities: [],
					nationalIndicators: [],
					nationalTargets: [],
					aichiTargets: function() {
						return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms", {
							cache: true
						}).then(function(o) {
							return o.data;
						});
					},
					adequacyMonitoring: function() {
						return $http.get("/api/v2013/thesaurus/domains/23643DAC-74BB-47BC-A603-123D20EAB824/terms", {
							cache: true
						}).then(function(o) {
							return o.data;
						});
					},

				};

				$scope.$watch("document.government", function(term) {

					$scope.options.nationalIndicators = [];
					$scope.options.nationalTargets = [];
					$scope.options.implementationActivities = [];

					if (term) {
						$http.get("/api/v2013/index", {
							params: buidQuery({
								schema_s: "nationalIndicator",
								government_s: term.identifier,
								_latest_s: true,
								_state_s: 'public'
							})
						}).then(mapResult).then(function(records) {
							$scope.options.nationalIndicators = records;
						}, $scope.onError);
						$http.get("/api/v2013/index", {
							params: buidQuery({
								schema_s: "nationalTarget",
								government_s: term.identifier,
								_latest_s: true
							})
						}).then(mapResult).then(function(records) {
							$scope.options.nationalTargets = records;
						}, $scope.onError);
						$http.get("/api/v2013/index", {
							params: buidQuery({
								schema_s: "implementationActivity",
								government_s: term.identifier,
								_latest_s: true
							})
						}).then(mapResult).then(function(records) {
							$scope.options.implementationActivities = records;
						}, $scope.onError);
					}
				});


				//==================================
				//
				//==================================
				function buidQuery(options) {

					return {
						fl: "identifier_s,title_t,description_t",
						sort: "title_s ASC",
						rows: 99999999,
						q: _.reduce(options, function(acc, value, key) {
							if (acc)
								acc += " AND ";

							return acc + key + ":" + value;
						}, "")
					};
				}


				//==================================
				//
				//==================================
				function mapResult(res) {
					return _.map(res.data.response.docs, function(o) {
						return {
							identifier: o.identifier_s,
							title: o.title_t,
							description: o.description_t
						};
					});
				}

				//==================================
				//
				//==================================
				$scope.$watch('tab', function(tab) {
					if (tab == 'review')
						$scope.validate();
				});


				//==================================
				//
				//==================================
				$scope.init = function() {

					//navigation.securize();

					if ($scope.document)
						return;

					$scope.status = "loading";
					
					var identifier = qs.uid;
					var promise = null;

					if (identifier) {
						promise = editFormUtility.load(identifier, "nationalAssessment");
					} else {

						var year = qs.year;
						var nationalTarget = qs.nationalTarget;
						var aichiTarget = qs.aichiTarget;

						var dates = [new Date()];

						if (year)
							dates.push(new Date(year + "-12-31"));

						promise = $q.when(guid()).then(function(identifier) {

							return storage.drafts.security.canCreate(identifier, "nationalAssessment").then(function(isAllowed) {
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

							var nationalAssessment = {
								header: {
									identifier: guid(),
									schema: "nationalAssessment",
									languages: [locale]
								},
								government: $scope.defaultGovernment() ? {
									identifier: $scope.defaultGovernment()
								} : undefined,
								date: _.min(dates).toISOString().substr(0, 10),
								nationalTarget: nationalTarget ? {
									identifier: nationalTarget
								} : undefined,
								aichiTarget: aichiTarget ? {
									identifier: aichiTarget
								} : undefined
							};
							return nationalAssessment;
						});
					}

					promise.then(
						function(doc) {
							$scope.status = "ready";
							$scope.document = doc;
						}).then(null,
						function(err) {
							$scope.onError(err.data, err.status);
							throw err;
						});
				};

				//==================================
				//
				//==================================
				$scope.isBasedOnComprehensiveIndicators = function(document) {

					document = document || $scope.document;

					return !!document && !!document.confidence && document.confidence.identifier == "DB41B07F-04ED-4446-82D4-6D1449D9527B";
				};

				//============================================================
				//
				//============================================================
				$scope.isMonitoringNotRequired = function(document) {

					document = document || $scope.document;

					return !!document && !!document.adequacy &&
						_.contains(["6108E892-CCF2-4870-B455-F8B887D7EEA0", "423CA4CE-23D4-4468-AE45-3A4AF503B1E8"], document.adequacy.identifier);
				};

				//==================================
				//
				//==================================
				$scope.cleanUp = function(document) {

					document = document || $scope.document;

					if (!document)
						return $q.when(true);

					if (/^\s*$/g.test(document.notes))
						document.notes = undefined;

					return $q.when(false);
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

					if (!document.assessmentType)
						document.assessmentType = qs.aichiTarget ? 1 : 0

					//if assessment is for aichi target deleted national target
					if (document.assessmentType == 1)
						document.nationalTarget = undefined;
					else
						document.aichiTarget = undefined;

					if (!document.nationalIndicatorsUsed == 1)
						document.nationalIndicators = undefined;

					if ($scope.isMonitoringNotRequired())
						document.adequacyDescription = undefined;

					if (/^\s*$/g.test(document.notes))
						document.notes = undefined;

					return document;
				};


				//==================================
				//
				//==================================
				$scope.loadRecords = function(identifier, schema) {

					if (identifier) { //lookup single record

						return storage.documents.get(identifier, {
								info: ""
							})
							.then(function(r) {
								return r.data;
							})
							//otherwise
							.then(null, function(e) {
								if (e.status != 404)
									throw e;

								return storage.drafts.get(identifier, {
										info: ""
									})
									.then(function(r) {
										return r.data;
									});
							});
					} else { //Load all record of specified schema;

						var sQuery = "type eq '" + encodeURI(schema) + "'";

						return $q.all([storage.documents.query(sQuery, null, {
									cache: true
								}),
								storage.drafts.query(sQuery, null, {
									cache: true
								})
							])
							.then(function(results) {
								var qDocs = results[0].data.Items;
								var qDrafts = results[1].data.Items;
								var qUids = _.pluck(qDocs, "identifier");

								return _.union(qDocs, _.filter(qDrafts, function(draft) {
									return qUids.indexOf(draft.identifier);
								}));
							});
					}
				};

				//==================================
				//
				//==================================
				// $scope.createIndicator = function (evt) {
				//
				//     inlineEditor.edit({
				//         targetEvent : evt,
				//         document : {
				//             header : {
				//                 identifier: guid(),
				// 				schema   : "nationalIndicator",
				// 				languages: _.clone($scope.document.header.languages)
				//             },
				//             government : _.clone($scope.document.government)
				//         }
				//
				//     }).then(function (doc){
				//         $scope.options.nationalIndicators.push({ identifier : doc.header.identifier, title : doc.title, description : doc.description });
				//         $scope.addIndicator({ identifier : doc.header.identifier });
				//     });
				// };

				//==================================
				//
				//==================================
				$scope.addIndicator = function(item) {
					$scope.document.nationalIndicators = $scope.document.nationalIndicators || [];
					$scope.document.nationalIndicators.push({
						identifier: item.identifier
					});
				};

				//==================================
				//
				//==================================
				$scope.removeIndicator = function(item) {
					$scope.document.nationalIndicators = _.reject($scope.document.nationalIndicators || [], function(ind) {
						return ind === item;
					});

					if (_.isEmpty($scope.document.nationalIndicators))
						delete $scope.document.nationalIndicators;
				};

				//==================================
				//
				//==================================
				$scope.filterUnselectedIndicator = function(item) {
					return !$scope.document.nationalIndicators ||
						_.findWhere($scope.document.nationalIndicators, {
							identifier: item.identifier
						}) === undefined;
				};

				//==================================
				//
				//==================================
				var docCache = {};

				$scope.docInfo = function(item) {

					if (docCache[item.identifier])
						return docCache[item.identifier];

					docCache[item.identifier] = _.findWhere($scope.options.nationalIndicators, {
						identifier: item.identifier
					});

					if (docCache[item.identifier])
						return docCache[item.identifier];

					docCache[item.identifier] = item;

					var params = buidQuery({
						schema_s: "nationalIndicator",
						identifier_s: item.identifier,
						_latest_s: true
					});

					return $http.get("/api/v2013/index", {
						params: params
					}).then(mapResult).then(function(records) {
						docCache[item.identifier] = _.first(records) || item;
					});
				};


				//======================================================================
				//======================================================================
				//======================================================================
				//======================================================================
				//======================================================================

				//==================================
				//
				//==================================
				$scope.validate = function(clone) {

					$scope.validationReport = null;

					var oDocument = $scope.document;

					if (clone !== false)
						oDocument = angular.fromJson(angular.toJson(oDocument));

					return $scope.cleanUp(oDocument).then(function(cleanUpError) {
						return storage.documents.validate(oDocument).then(
							function(success) {
								$scope.validationReport = success.data;
								return cleanUpError || !!(success.data && success.data.errors && success.data.errors.length);
							},
							function(error) {
								$scope.onError(error.data);
								return true;
							}
						);
					});
				};

				//==================================
				//
				//==================================
				$scope.isFieldValid = function(field) {
					if (field && $scope.validationReport && $scope.validationReport.errors)
						return !_.findWhere($scope.validationReport.errors, {
							property: field
						});

					return true;
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
				$scope.onPreSaveDraft = function() {
					return $scope.cleanUp();
				};

				//==================================
				//
				//==================================
				$scope.onPrePublish = function() {
					return $scope.validate(false).then(function(hasError) {
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
					if(!openInDialog)
						gotoManager();
					else{
						$scope.closeDialog();
					}
				};

				//==================================
				//
				//==================================
				$scope.onPostPublish = function() {
					$scope.$root.showAcknowledgement = true;
					$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
					if(!openInDialog)
						gotoManager();
					else{
						$scope.closeDialog();
					}
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
					if(!openInDialog)
						gotoManager();
					else{
						$scope.closeDialog();
					}
				};


				//==================================
				//
				//==================================
				function gotoManager() {

					//if($scope.qs.nationalTarget)
					$location.url("/submit/online-reporting");
					//else
					//	$location.url("/submit/online-reporting/nationalAssessment");
				}

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
					} else if (error.Message)
						$scope.error = error.Message;
					else
						$scope.error = error;
				};

				$scope.init();

			}
		};
	}]);
});