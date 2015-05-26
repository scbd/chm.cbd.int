define(['text!./progress-assessment.html', 'app', 'angular', 'lodash', 'authentication', '../views/progress-assessment', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation'], function(template, app, angular, _) { 'use strict';

app.directive("editProgressAssessment", ['$http',"$rootScope", "$filter", "$q", 'IStorage', "authentication", "editFormUtility", "guid", "$location", "navigation", 'siteMapUrls', '$route', function ($http, $rootScope, $filter, $q, storage, authentication, editFormUtility, guid, $location, navigation, siteMapUrls, $route) {
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
			$scope.tab      = 'general';
            $scope.review = { locale: "en" };
            $scope.options = {
                countries:               $http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'title|lstring'); }),
            	jurisdictions:           $http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms", { cache: true }).then(function (o) { return o.data; }),
            	progresses:              $http.get("/api/v2013/thesaurus/domains/EF99BEFD-5070-41C4-91F0-C051B338EEA6/terms", { cache: true }).then(function (o) { return o.data; }),
            	confidences:             $http.get("/api/v2013/thesaurus/domains/B40C65BE-CFBF-4AA2-B2AA-C65F358C1D8D/terms", { cache: true }).then(function (o) { return o.data; }),
            	aichiTargets:            $http.get("/api/v2013/index", { params: { q:"schema_s:aichiTarget", fl:"identifier_s,title_t,number_d",  sort:"number_d ASC", rows : 999999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.number_d  +" - "+ o.title_t }; });}).then(null, $scope.onError),
            	strategicPlanIndicators: $http.get("/api/v2013/index", { params: { q:"schema_s:strategicPlanIndicator", fl:"identifier_s,title_t", sort:"title_s ASC", rows : 999999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.title_t }; });}).then(null, $scope.onError),
            	implementationActivities: [],
            	nationalIndicators: [],
                nationalTargets:    []
            };

            $scope.$watch("document.government", function(term) {

            	$scope.options.nationalIndicators = [];
            	$scope.options.nationalTargets = [];
            	$scope.options.implementationActivities = [];

            	if (term) {

            		var buidQueryFn = function(schema) {
            			return {
            				q: "schema_s:" + schema + " AND government_s:" + term.identifier,
            				fl: "identifier_s,title_t",
            				sort: "title_s ASC",
							rows:99999999
            			};
            		};

            		var mapResultFn = function(res) {
            			return _.map(res.data.response.docs, function(o) {
            				return {
            					identifier: o.identifier_s,
            					title: o.title_t
            				};
            			});
            		};

            		$scope.options.nationalIndicators       = $http.get("/api/v2013/index", { params: buidQueryFn("nationalIndicator")      }).then(mapResultFn).then(null, $scope.onError);
            		$scope.options.nationalTargets          = $http.get("/api/v2013/index", { params: buidQueryFn("nationalTarget")         }).then(mapResultFn).then(null, $scope.onError);
            		$scope.options.implementationActivities = $http.get("/api/v2013/index", { params: buidQueryFn("implementationActivity") }).then(mapResultFn).then(null, $scope.onError);
            	}
            });

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
				var qs = $route.current.params;
				var identifier  = qs.uid;
				var year        = qs.year;
				var aichiTarget = qs.aichiTarget;
				var nationalTarget = qs.nationalTarget;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "progressAssessment");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "progressAssessment",
							languages: ["en"]
						},
						government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined,
						startDate : year ? year + "-01-01" : undefined,
						endDate   : year ? year + "-12-31" : undefined,
						aichiTarget    : aichiTarget    ? { identifier: aichiTarget } : undefined,
						nationalTarget : nationalTarget ? { identifier: nationalTarget } : undefined
					});


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
			$scope.isJurisdictionSubNational = function(document) {

				document = document || $scope.document;

				return !!document && !!document.jurisdiction && document.jurisdiction.identifier == "DEBB019D-8647-40EC-8AE5-10CA88572F6E";
			};

			//==================================
			//
			//==================================
			$scope.isBasedOnComprehensiveIndicators = function(document) {

				document = document || $scope.document;

				return !!document && !!document.confidence && document.confidence.identifier == "DB41B07F-04ED-4446-82D4-6D1449D9527B";
			};

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {

				document = document || $scope.document;

				if (!document)
					return $q.when(true);

				if (!$scope.isJurisdictionSubNational(document))
					document.jurisdictionInfo = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return $q.when(false);
			};

			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record

					return storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							return r.data;
						})
						//otherwise
						.then(null, function(e) {
							if (e.status != 404)
								throw e;

							return storage.drafts.get(identifier, { info: "" })
								.then(function(r) {
									return r.data;
								});
						});
				}
				else { //Load all record of specified schema;

					var sQuery = "type eq '" + encodeURI(schema) + "'";

					return $q.all([storage.documents.query(sQuery, null, { cache: true }),
								   storage.drafts.query(sQuery, null, { cache: true })])
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
					return !_.findWhere($scope.validationReport.errors, { property: field });

				return true;
			};

			//==================================
            //
            //==================================
            $scope.isLoading = function () {
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
                gotoManager();
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$scope.$root.showAcknowledgement = true;
                $rootScope.$broadcast("onPostPublish", "Record is being published, please note the pubishing process could take up to 1 minute before your record appears.");
                gotoManager();
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
                $rootScope.$broadcast("onPostClose", "Record closed without saving.");
				gotoManager();
			};


			//==================================
			//
			//==================================
			function gotoManager() {
				$location.url("/management/online-reporting/aichiTarget");
			}

			//==================================
			//
			//==================================
			$scope.onError = function(error, status)
			{
				$scope.status = "error";

				if (status == "notAuthorized") {
					$scope.status = "hidden";
					$scope.error  = "You are not authorized to modify this record";
				}
				else if (status == 404) {
					$scope.status = "hidden";
					$scope.error  = "Record not found.";
				}
				else if (status == "badSchema") {
					$scope.status = "hidden";
					$scope.error  = "Record type is invalid.";
				}
				else if (error.Message)
					$scope.error = error.Message;
				else
					$scope.error = error;
			};

            $scope.init();

        }
    };
}]);
});
