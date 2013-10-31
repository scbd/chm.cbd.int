angular.module('kmApp').compileProvider // lazy
.directive('editContact', [function ($http, URI, guid, $filter) {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-contact.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.init();
		},
		controller : ['$scope', "authHttp", "$q", "$location", "$filter", 'IStorage', "underscore",  "editFormUtility", "navigation", "ngProgress", "authentication", "siteMapUrls", "Thesaurus", "guid", function ($scope, $http, $q, $location, $filter, storage, _, editFormUtility, navigation, authentication, ngProgress, siteMapUrls, Thesaurus, guid) 
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };

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
				var schema  = "contact";
				var qs      = $location.search();

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
							}
						};
					});
				}

				promise.then(function(doc) {
				
					if(!$scope.options) {
						$scope.options  = {
							countries         : $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
							organizationTypes : $http.get("/api/v2013/thesaurus/domains/Organization%20Types/terms", { cache: true }).then(function(o){ return o.data; })
						};
					}

					return doc;

				}).then(function(doc) {
				
					$scope.status = "ready";
					$scope.document = doc;

				}).catch(function(err) {
					$scope.onError(err.data, err.status)
					throw err;
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

				if (/^\s*$/g.test(document.firstName )) document.firstName  = undefined;
				if (/^\s*$/g.test(document.middleName)) document.middleName = undefined;
				if (/^\s*$/g.test(document.lastName  )) document.lastName   = undefined;
				if (/^\s*$/g.test(document.notes     )) document.notes      = undefined;

				return document;
			};

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
			$scope.$watch('tab', function(tab) {
				if (tab == 'review')
					$scope.validate();
			});

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
				$location.url("/database/record?documentID=" + data.documentID);
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				$location.url(siteMapUrls.management.drafts);
			};


			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);	
				else
					$location.url(siteMapUrls.management.home);
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
					$scope.error = error.Message
				else
					$scope.error = error;
			}
		}]
	}
}]);
