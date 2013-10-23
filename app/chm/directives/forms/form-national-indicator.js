angular.module('kmApp').compileProvider // lazy
.directive("editNationalIndicator", ['authHttp', "$q", "$filter", "URI", "IStorage", function ($http, $q, $filter, URI, storage) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/forms/form-national-indicator.partial.html',
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope, $element) {
            $scope.status = "";
            $scope.error = null;
            $scope.tab = 'general';
            $scope.document = null;
            $scope.review = { locale: "en" };

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {
				if (tab == 'review')
					$scope.validate();
			});


            $scope.init();
        },
		controller : ['$scope', "$q", 'IStorage', "authentication", "editFormUtility", "guid", "$location", 'ngProgress', function ($scope, $q, storage, authentication, editFormUtility, guid, $location, ngProgress) {


			//==================================
			//
			//==================================
			$scope.init = function() {

				if(!authentication.user().isAuthenticated) {
					$location.search({returnUrl : $location.url() });
					$location.path('/management/signin');
					return;
				}

				if ($scope.document)
					return;

				ngProgress.start();

				$scope.status = "loading";

				var identifier = URI().search(true).uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "nationalIndicator");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "nationalIndicator",
							languages: ["en"]
						},
						government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined
					});


				promise.then(function(doc) {

					if(!$scope.options) {
			         
			            $scope.options = {
			                countries:               $http.get("/api/v2013/thesaurus/domains/countries/terms",  { cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'title|lstring'); }),
			            	strategicPlanIndicators: $http.get("/api/v2013/index", { params: { q:"schema_s:strategicPlanIndicator", fl:"identifier_s,title_t", sort:"title_s ASC", rows : 99999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.title_t } })}).then(null, $scope.onError)
			            };

						return $q.all(_.values($scope.options)).then(function() {
			            	return doc;
			            });
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
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
					return $q.when(true);

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return $q.when(false);
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
			}

			//==================================
			//
			//==================================
			$scope.isFieldValid = function(field) {
				if (field && $scope.validationReport && $scope.validationReport.errors)
					return !_.findWhere($scope.validationReport.errors, { property: field });

				return true;
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
				return $scope.cleanUp();
			}

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			}

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function(data) {
				$location.url(managementUrls.workflows);
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
				gotoManager();
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