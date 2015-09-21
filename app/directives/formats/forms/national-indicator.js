define(['text!./national-indicator.html', 'app', 'angular', 'authentication', './national-indicator.form', '../views/national-indicator', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation'], function(template, app, angular) { 'use strict';

app.directive("editNationalIndicator", ["$http","$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", function ($http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls, Thesaurus, guid, $route) {
    return {
        restrict: 'E',
        template: template,
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope) {

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

				$scope.status = "loading";

				var promise = null;
				var schema  = "nationalIndicator";
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
						};
					});
				}

				promise.then(function(doc) {

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
			$scope.defaultGovernment = function() {

				var qsGovernment = $location.search().government;

				if (qsGovernment)
					qsGovernment = qsGovernment.toLowerCase();

				return authentication.user().government || qsGovernment;
			};

			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return;

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
                $rootScope.$broadcast("onPostClose", "Record closed.");
				gotoManager();
			};

			//==================================
			//
			//==================================
			function gotoManager() {
				$location.url("/submit/online-reporting/nationalIndicator");
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
