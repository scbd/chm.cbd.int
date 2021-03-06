define(['text!./national-support-tool.html', 'app', 'angular', 'lodash', 'authentication', '../views/national-support-tool', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation'], function(template, app, angular, _) { 'use strict';

app.directive("editNationalSupportTool", ["$http","$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", function ($http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls, thesaurus, guid, $route) {
    return {
        restrict: 'E',
        template: template,
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

				var promise = null;
				var schema  = "nationalSupportTool";
				var qs = $route.current.params;

				if(qs.uid) { // Load
					promise = editFormUtility.load(qs.uid, schema);
				}
				else { // Create

					promise = $q.when(guid()).then(function(identifier) {
						return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {

							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							return identifier;
						});
					}).then(function(identifier) {

						return {
							header: {
								identifier: identifier,
								schema   : schema,
								languages: ["en"]
							},
							government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined,
						};
					});
				}


				promise.then(function(doc) { //process

					if(!$scope.options) {

			            $scope.options = {
			                countries:		 $http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'title|lstring'); }),
			                status:			 $http.get("/api/v2013/thesaurus/domains/B91693BB-648B-4601-9C4E-5B6ABE160D35/terms", { cache: true }).then(function (o) { return o.data; }),
			            	jurisdictions:	 $http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms", { cache: true }).then(function (o) { return o.data; }),
							thematicAreas:	 $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",						  { cache: true }).then(function (o) { return thesaurus.buildTree(o.data); }),
							//supportTools:	 function() { return $http.get("/api/v2013/thesaurus/domains/B63B9640-1CB8-4868-89DA-3D0571638870/terms", { cache: true }).then(function (o) { return thesaurus.buildTree(o.data); }) },
							supportTools:	 $http.get("/api/v2013/thesaurus/domains/B63B9640-1CB8-4868-89DA-3D0571638870/terms", { cache: true }).then(function (o) { return thesaurus.buildTree(o.data); }),
			            	aichiTargets:	 $http.get("/api/v2013/index", { params: { q:"schema_s:aichiTarget", fl:"identifier_s,title_t,number_d",		sort:"number_d ASC", rows : 999999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.number_d  +" - "+ o.title_t }; });}).then(null, $scope.onError),
			            	nationalTargets: []
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
            $scope.$watch("document.government", function(term) {

				if (!$scope.options)
					return;

            	$scope.options.nationalTargets = [];

            	if (!term)
            		return;


        		var query = {
    				q: "schema_s:nationalTarget AND government_s:" + term.identifier,
    				fl: "identifier_s,title_t",
    				sort: "title_s ASC",
					rows:99999999
    			};

        		$scope.options.nationalTargets = $http.get("/api/v2013/index", { params: query }).then(function(res) {
        			return _.map(res.data.response.docs, function(o) {
        				return {
        					identifier: o.identifier_s,
        					title: o.title_t
        				};
        			});
        		}).catch($scope.onError);
            });

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

				if (!$scope.isJurisdictionSubNational(document))
					document.jurisdictionInfo = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

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
                $rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
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
                $rootScope.$broadcast("onPostClose", "Record closed.");
                gotoManager();
            };
			//==================================
			//
			//==================================
			function gotoManager() {
				$location.url("/submit/online-reporting/nationalSupportTool");
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
