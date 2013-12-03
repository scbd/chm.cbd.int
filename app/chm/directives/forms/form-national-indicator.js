angular.module('kmApp').compileProvider // lazy
.directive("editNationalIndicator", [function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/forms/form-national-indicator.partial.html',
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope, $element) {
            $scope.init();
        },
		controller : ['$scope', "authHttp", "$q", "$location", "$filter", 'IStorage', "underscore",  "editFormUtility", "navigation", "ngProgress", "authentication", "siteMapUrls", "Thesaurus", "guid", function ($scope, $http, $q, $location, $filter, storage, _, editFormUtility, navigation, ngProgress, authentication, siteMapUrls, Thesaurus, guid) 
		{
            $scope.status = "";
            $scope.error = null;
            $scope.tab = 'general';
            $scope.document = null;
            $scope.review = { locale: "en" };

			// Ensure user as signed in
			navigation.securize();

			//==================================
			//
			//==================================
			$scope.init = function() {

				if ($scope.document)
					return;

				ngProgress.start();

				$scope.status = "loading";

				var promise = null;
				var schema  = "nationalIndicator";
				var qs = $location.search();


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
							government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined
						}
					});
				}

				promise.then(function(doc) {

					if(!$scope.options) {
			         
			            $scope.options = {
			                countries:               $http.get("/api/v2013/thesaurus/domains/countries/terms",  { cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'title|lstring'); }),
			            	strategicPlanIndicators: $http.get("/api/v2013/index", { params: { q:"schema_s:strategicPlanIndicator", fl:"identifier_s,title_t", sort:"title_s ASC", rows : 99999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.title_t } })}).then(null, $scope.onError)
			            };
			        }

			        return doc;

				}).then(function(doc) {

					$scope.status = "ready";
					$scope.document = doc;

				}).catch(function(err) {

					$scope.onError(err.data, err.status)
					throw err;

				}).finally(function() {

					ngProgress.complete();

				});
			}

			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return undefined

				document = angular.fromJson(angular.toJson(document));

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

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
			}

			//==================================
            //
            //==================================
            $scope.isLoading = function () {
                return $scope.status == "loading";
            }

			//==================================
			//
			//==================================
			$scope.hasError = function(field) {
				return $scope.error!=null;
			}

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

				var qsGovernment = new URI().search(true).government;

				if (qsGovernment)
					qsGovernment = qsGovernment.toLowerCase()

				return $scope.userGovernment() || qsGovernment;
			};

			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
			}

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate().then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			}

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function(data) {
				$location.url(siteMapUrls.management.workflows);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function(data) {
				$scope.$root.showAcknowledgement = true;
				$location.url("/database/record?documentID=" + data.documentID);
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				$location.url("/management/my-drafts"); //TMP
				//gotoManager();
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				gotoManager();
			};

			//==================================
			//
			//==================================
			function gotoManager() { 
				$location.url("/management/national-reporting" + ($scope.document.government ? "?country=" + $scope.document.government.identifier.toUpperCase() : ""));
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
					$scope.error = error.Message
				else
					$scope.error = error;
			}
        }]
    }
}])