define(['text!./national-report.html', 'app', 'angular', 'lodash', 'authentication', '../views/national-report', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation'], function(template, app, angular, _) { 'use strict';

app.directive("editNationalReport", ["$http","$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", function ($http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls, thesaurus, guid, $route) {
    return {
        restrict: 'E',
        template : template,
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope) {

            $scope.status = "";
            $scope.error = null;
            $scope.tab = "general";
            $scope.document = null;
            $scope.review = { locale: "en" };
			$scope.qs = $location.search();

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
				var schema  = "nationalReport";
				var reportType  = qs.type;
				var promise = null;


				if(qs.uid) { // Load
					promise = editFormUtility.load(qs.uid, schema);
				}
				else { // Create

					promise = $q.when(guid()).then(function(identifier) {
						return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {

							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							return identifier;
						})
						;
					}).then(function(identifier) {

						return {
							header: {
								identifier: identifier,
								schema   : schema,
								languages: ["en"]
							},
							government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined,
							reportType: reportType ? { identifier: reportType } : undefined
						};
					});
				}

				promise.then(function(doc) {

					if(!$scope.options) {

			            $scope.options = {
			                countries:		$http.get("/api/v2013/thesaurus/domains/countries/terms",								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
			                jurisdictions:	$http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                approvedStatus:	$http.get("/api/v2013/thesaurus/domains/E27760AB-4F87-4FBB-A8EA-927BDE375B48/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                approvingBody:	$http.get("/api/v2013/thesaurus/domains/F1A5BFF1-F555-40D1-A24C-BBE1BE8E82BF/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                reportStatus:	$http.get("/api/v2013/thesaurus/domains/7F0D898A-6BF1-4CE6-AA77-7FEAED3429C6/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                reportTypes:	$http.get("/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms",	{ cache: true }).then(function (o) { return thesaurus.buildTree(o.data); })
			            };
			        }

			        return doc;

				}).then(function(doc) {

					$scope.status = "ready";
					$scope.document = doc;

				}).catch(function(err) {

					$scope.onError(err.data, err.status);
					throw err;

				});
			};

			//==================================
			//
			//==================================
			$scope.hasAdoptionDate = function (document) {

				document = document || $scope.document;

				return !!document && !!document.status && (
					document.status.identifier == "1C37E358-5295-46EB-816C-0A7EF2437EC9" ||
					document.status.identifier == "851B10ED-AE62-4F28-B178-6D40389CC8DB");
			};

			//==================================
			//
			//==================================
			$scope.hasApprovedStatus = function (document) {

				document = document || $scope.document;

				return !!document && !!document.status && document.status.identifier == "851B10ED-AE62-4F28-B178-6D40389CC8DB";
			};

			//==================================
			//
			//==================================
			$scope.hasApprovedStatusInfo = function (document) {

				document = document || $scope.document;

				return !!document && !!document.approvingBody && (
					document.approvingBody.identifier == "D3A4624E-21D9-4E49-953F-529734538E56" ||
					document.approvingBody.identifier == "E7398F2B-FA36-4F42-85C2-5D0044440476" ||
					document.approvingBody.identifier == "905C1F7F-C2F4-4DCE-A94E-BE6D6CE6E78F");
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
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return;

				document = angular.fromJson(angular.toJson(document));

				if (!document)
					return $q.when(true);

				if (!$scope.isJurisdictionSubNational(document))
					document.jurisdictionInfo  = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;
				if (!$scope.hasAdoptionDate(document)) {
					document.adoptionDate      = undefined;
				}
				if (!$scope.hasApprovedStatus(document)) {
					document.approvedStatus    = undefined;
					document.approvingBody     = undefined;
					document.approvingBodyInfo = undefined;
				}

				if (!$scope.hasApprovedStatusInfo(document)) {
					document.approvingBodyInfo = undefined;
				}

				return document;
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
			$scope.$watch('tab', function(tab) {
				if (tab == 'review')
					$scope.validate();
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
			};

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
                $location.url("/submit/online-reporting/nationalReport?type=" + $scope.qs.type);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$scope.$root.showAcknowledgement = true;
                $rootScope.$broadcast("onPostPublish", "Record is being published, please note the pubishing process could take up to 1 minute before your record appears.");
                $location.url("/submit/online-reporting/nationalReport?type=" + $scope.qs.type);
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
                $location.url("/submit/online-reporting/nationalReport?type=" + $scope.qs.type);
			};



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
