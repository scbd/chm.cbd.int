define(['text!./submission.html', 'app', 'angular', 'lodash', 'moment', 'authentication',
		'../views/submission', 'services/editFormUtility', 'directives/forms/form-controls',
		'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage'
	],
	function (template, app, angular, _, moment) {
		'use strict';

		app.directive('editSubmission', ["$http", "$rootScope", "Enumerable", "$filter", "$q", "guid", "$location", "authentication", "editFormUtility", "IStorage", "$route",
			function ($http, $rootScope, Enumerable, $filter, $q, guid, $location, authentication, editFormUtility, storage, $route) {
				return {
					restrict: 'E',
					template: template,
					replace: true,
					transclude: false,
					scope: {},
					link: function ($scope) {
						$scope.status = "";
						$scope.error = null;
						$scope.document = null;
						$scope.tab = 'general';
						$scope.review = {
							locale: "en"
						};
						$scope.options = {

							cbdThematicAreas: function () {
								return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms", {
									cache: true
								}).then(function (o) {
									return o.data;
								})
							},
							bchThematicAreas: function () {
								return $http.get("/api/v2013/thesaurus/domains/043C7F0D-2226-4E54-A56F-EE0B74CCC984/terms", {
									cache: true
								}).then(function (o) {
									return o.data;
								});
							},
							absThematicAreas: function () {
								return $http.get("/api/v2013/thesaurus/domains/CA9BBEA9-AAA7-4F2F-B3A3-7ED180DE1924/terms", {
									cache: true
								}).then(function (o) {
									return o.data;
								});
							},
							countries: $http.get("/api/v2013/thesaurus/domains/countries/terms", {
								cache: true
							}).then(function (o) {
								return $filter('orderBy')(o.data, 'title|lstring');
							}),
						};

						//============================================================
						//
						//============================================================
						$scope.$watch('tab', function (tab) {

							if (!tab)
								return;

							if (tab == 'review')
								$scope.validate();
						});

						//============================================================
						//
						//============================================================
						$scope.nextTab = function () {
							var next = 'review';

							if ($scope.tab == 'general') {
								next = 'chm';
							}
							if ($scope.tab == 'chm') {
								next = 'absch';
							}
							if ($scope.tab == 'absch') {
								next = 'bch';
							}
							if ($scope.tab == 'bch') {
								next = 'review';
							}

							$scope.tab = next;
						};

						//============================================================
						//
						//============================================================
						$scope.prevTab = function () {
							var prev;

							if ($scope.tab == 'review') {
								prev = 'bch';
							}
							if ($scope.tab == 'bch') {
								prev = 'absch';
							}
							if ($scope.tab == 'absch') {
								prev = 'chm';
							}
							if ($scope.tab == 'chm') {
								prev = 'general';
							}

							$scope.tab = prev;
						};

						//============================================================
						//
						//============================================================
						$scope.isLoading = function () {
							return $scope.status == "loading";
						};

						//============================================================
						//
						//============================================================
						$scope.hasError = function () {
							return !!$scope.error;
						};

						//============================================================
						//
						//============================================================
						$scope.userGovernment = function () {
							return authentication.user().government;
						};

						//============================================================
						//
						//============================================================
						$scope.init = function () {
							if ($scope.document)
								return;

							$scope.status = "loading";

							var identifier = $route.current.params.uid;
							var promise = null;

							if (identifier)
								promise = editFormUtility.load(identifier, "submission");
							else
								promise = $q.when({
									header: {
										identifier: guid(),
										schema: "submission",
										languages: ["en"]
									}
								});


							promise.then(
								function (doc) {
									$scope.status = "ready";
									$scope.document = doc;
								}).then(null,
								function (err) {
									$scope.onError(err.data, err.status);
									throw err;
								});
						};

						//============================================================
						//
						//============================================================
						$scope.onPreSaveDraft = function () {
							return $scope.cleanUp();
						};

						//============================================================
						//
						//============================================================
						$scope.onPrePublish = function () {
							return $scope.validate(false).then(function (hasError) {
								if (hasError)
									$scope.tab = "review";
								return hasError;
							});
						};

						//============================================================
						//
						//============================================================
						$scope.onPostWorkflow = function () {
							$rootScope.$broadcast("onPostWorkflow", "Publishing request sent successfully.");
							gotoManager();
						};

						//============================================================
						//
						//============================================================
						$scope.onPostPublish = function () {
							$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
							gotoManager();
						};

						//============================================================
						//
						//============================================================
						$scope.onPostSaveDraft = function () {
							$rootScope.$broadcast("onSaveDraft", "Draft record saved.");
						};

						//============================================================
						//
						//============================================================
						$scope.onPostClose = function () {
							$rootScope.$broadcast("onPostClose", "Record closed.");
							gotoManager();
						};

						//============================================================
						//
						//============================================================
						function gotoManager() {
							$location.url("/submit/submission");
						}

						//============================================================
						//
						//============================================================
						$scope.cleanUp = function (document) {
							document = document || $scope.document;

							if (!document)
								return $q.when(true);

							if (/^\s*$/g.test(document.notes))
								document.notes = undefined;

							return $q.when(false);
						};

						//============================================================
						//
						//============================================================
						$scope.validate = function (clone) {

							$scope.validationReport = null;

							var oDocument = $scope.document;

							if (clone !== false)
								oDocument = angular.fromJson(angular.toJson(oDocument));

							return $scope.cleanUp(oDocument).then(function (cleanUpError) {
								return storage.documents.validate(oDocument).then(
									function (success) {
										$scope.validationReport = success.data;
										return cleanUpError || !!(success.data && success.data.errors && success.data.errors.length);
									},
									function (error) {
										$scope.onError(error.data);
										return true;
									}
								);
							});
						};

						//============================================================
						//
						//============================================================
						$scope.isFieldValid = function (field) {
							if (field && $scope.validationReport && $scope.validationReport.errors)
								return !Enumerable.From($scope.validationReport.errors).Any(function (x) {
									return x.property == field;
								});

							return true;
						};

						//============================================================
						//
						//============================================================
						$scope.onError = function (error, status) {
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

						$scope.loadNotifications = function (identifier) {

							var params = {
								q: "schema_s:notification AND date_s:[ " + moment().subtract(3, "years").format() + " TO " + moment().format() + " ] ",
								fl: "identifier_s:symbol_s,title_*, reference_s, symbol_s",
								sort: "symbol_s DESC",
								rows: 99999999
							};
							if(identifier)
								params.q = 'symbol_s:' + identifier;
							return $http.get("/api/v2013/index", { params: params,cache: true})
								.then(function (results) {
									var qResult = _.map(normalizeSolrResult(results.data.response.docs), function(row){
										row.summary  = row.title;
										row.title 	 = (row.reference_s||'') + ' (' + (row.symbol_s||'') + ')';
										return row;
									});
									if(identifier)
										return qResult[0];
									return qResult;
								});
						}
						//============================================================
						//
						//============================================================      
						$scope.loadSchemaRecords = function (identifier, schema) {

							var sQuery;
							if (schema != '*')
								sQuery = "type eq '" + schema + "'";

							var params = {
								q: "schema_s:" + schema,
								fl: "identifier_s,title_*,summary:acronym_t",
								sort: "title_s ASC",
								rows: 99999999
							};

							if(identifier)//assume identifier, temp TODO: change logic
								params.q = 'identifier_s:' + identifier;
							return $http.get("/api/v2013/index", { params: params, cache: true })
							.then(function (results) {
								var qResult = normalizeSolrResult(results.data.response.docs);
								if(identifier)
									return qResult[0];
								return qResult;
							});
						};

						//============================================================
						//
						//============================================================       
						function normalizeSolrResult(data) {
							var normalData = []
							for (var i = 0; i < data.length; i++) {
								normalData[i] = data[i]
								normalData[i].identifier = data[i].identifier_s
								normalData[i].title = solrPropTolString('title', data[i]);								
							}
							return normalData
						}

						//============================================================
						//
						//============================================================       
						function solrPropTolString(propertyName, solrDoc) {
							if (!solrDoc[propertyName + '_t']) return {}

							var langs = ['EN', 'AR', 'ES', 'FR', 'RU', 'ZH']
							var lString = {}

							for (var i = 0; i < langs.length; i++) {
								lString[langs[i].toLowerCase()] = solrDoc[propertyName + '_' + langs[i] + '_t']
							}
							return lString
						}

						$scope.init();
					}
				};
			}
		]);
	});
