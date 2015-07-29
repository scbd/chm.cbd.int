define(['text!./lw-campaign.html', 'app', 'angular', 'authentication', '../views/lw-campaign', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls',
 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation'], function(template, app, angular) { 'use strict';

app.directive('editLwCampaign', ['$http', '$filter', '$q', 'guid', '$location', 'IStorage', 'Enumerable', 'editFormUtility', 'authentication', 'siteMapUrls', '$route', function ($http, $filter, $q, guid, $location, storage, Enumerable, editFormUtility, authentication, siteMapUrls, $route) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };
			// $scope.options  = {
			// 	sensitivity:			function () { return $http.get("/api/v2013/thesaurus/domains/9BDB8DAD-C87E-4D4D-BA0B-B405EBB4F51D/terms", { cache: true }).then(function (o) { return o.data; }); },
			// 	scales:					function () { return $http.get("/api/v2013/thesaurus/domains/AC5C283E-6D16-46A0-B7F5-4DB2973BC45F/terms", { cache: true }).then(function (o) { return o.data; }); },
			// 	scientificValidity:		function () { return $http.get("/api/v2013/thesaurus/domains/9BDB8DAD-C87E-4D4D-BA0B-B405EBB4F51D/terms", { cache: true }).then(function (o) { return o.data; }); },
			// 	easyCommunicated:		function () { return $http.get("/api/v2013/thesaurus/domains/9BDB8DAD-C87E-4D4D-BA0B-B405EBB4F51D/terms", { cache: true }).then(function (o) { return o.data; }); },
		//	};

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if (tab == 'review')
					$scope.validate();
			});


			//==================================
			//
			//==================================
			$scope.isLoading = function() {
				return $scope.status=="loading";
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
			$scope.init = function() {
//alert("here");
        if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = $route.current.params.uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "lwCampaign");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema: "lwCampaign",
							languages: ["en"]
						}
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
			$scope.validate = function(clone) {

				$scope.validationReport = null;

				var oDocument = $scope.document;

				if (clone !== false)
					oDocument = angular.fromJson(angular.toJson(oDocument));

				$scope.reviewDocument = oDocument;
console.log(oDocument);	
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
					return !Enumerable.From($scope.validationReport.errors).Any(function(x){return x.property==field;});

				return true;
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
				$location.url(siteMapUrls.management.workflows);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$location.url('management/list/strategicPlanIndicator');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				$location.url('management/list/strategicPlanIndicator');
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('management/list/strategicPlanIndicator');
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

			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record
					var deferred = $q.defer();

					storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							return r.data;
						}, function(e) {
							if (e.status == 404) {
								storage.drafts.get(identifier, { info: "" })
									.then(function(r) { deferred.resolve(r.data);},
										  function(e) { deferred.reject (e);});
							}
							else {
								deferred.reject (e);
							}
						});
					return deferred.promise;
				}

				//Load all record of specified schema;

				var sQuery = "type eq '" + encodeURI(schema) + "'";

				return $q.all([storage.documents.query(sQuery, null, { cache: true }),
							   storage.drafts   .query(sQuery, null, { cache: true })])
					.then(function(results) {
						var qResult = Enumerable.From (results[0].data.Items)
												.Union(results[1].data.Items, "$.identifier");
						return qResult.ToArray();
					});
			};

			$scope.init();

        }
    };
}]);
});
