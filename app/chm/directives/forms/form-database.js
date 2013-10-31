angular.module('kmApp').compileProvider // lazy
.directive('editDatabase', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-database.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.init();
		},
		controller : ['$scope', "authHttp", "$q", "$location", "$filter", 'IStorage', "underscore",  "editFormUtility", "navigation", "ngProgress", "authentication", "siteMapUrls", "Thesaurus", "guid", function ($scope, $http, $q, $location, $filter, storage, _, editFormUtility, navigation, ngProgress, authentication, siteMapUrls, Thesaurus, guid) 
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

				ngProgress.start();

				$scope.status = "loading";

				var promise = null;
				var schema  = "database";
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
							government: $scope.userGovernment() ? { identifier: $scope.userGovernment() } : undefined,
							libraries : [{ identifier : "cbdLibrary:chm" }] //Force CHM
						};
					});
				}

				promise.then(function(doc) {

					if(!$scope.options) {
						$scope.options  = {
							countries : $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
							libraries : $http.get("/api/v2013/thesaurus/domains/cbdClearingHouses/terms",    { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); })
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
			$scope.userGovernment = function() {
				return authentication.user().government;
			};

			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return undefined

				document = angular.fromJson(angular.toJson(document));

				if (document.website) {

					var oWebSite = document.website;

					if ($.isEmptyObject(oWebSite)) oWebSite = undefined;
					if (oWebSite && !oWebSite.url) oWebSite = undefined;

					if (oWebSite)
						oWebSite = _.pick(oWebSite, "url", "name");

					document.website = oWebSite;
				}

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return document
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
			
			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record
					var deferred = $q.defer();

					storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							deferred.resolve(r.data);
						}, function(e) {
							if (e.status == 404) {
								storage.drafts.get(identifier, { info: "" })
									.then(function(r) { deferred.resolve(r.data)},
										  function(e) { deferred.reject (e)});
							}
							else {
								deferred.reject (e)
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
			}
		}]
	}
}]);