angular.module('kmApp').compileProvider // lazy
.directive('editDatabase', ['authHttp', "URI", "guid", "$filter", function ($http, URI, guid, $filter) {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-database.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };
			$scope.options  = {
				countries         : function() { return $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				libraries         : function() { return $http.get("/api/v2013/thesaurus/domains/cbdClearingHouses/terms",    { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); }
			};

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {
				if (tab == 'review')
					$scope.validate();
			});

			$scope.init();
		},
		controller : ['$scope', "$q", "$location", 'IStorage', "Enumerable", "underscore", "editFormUtility", "authentication", "managementUrls", function ($scope, $q, $location, storage, Enumerable, _, editFormUtility, authentication, managementUrls) 
		{
			//==================================
			//
			//==================================
			$scope.isLoading = function() {
				return $scope.status=="loading";
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
			$scope.init = function() {
				if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = URI().search(true).uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "database");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "database",
							languages: ["en"]
						},
						government: $scope.userGovernment() ? { identifier: $scope.userGovernment() } : undefined,
						libraries : [{ identifier : "cbdLibrary:abs-ch" }] //Force to ABS
					});


				promise.then(
					function(doc) {
						$scope.status = "ready";
						$scope.document = doc;
					}).then(null, 
					function(err) {
						$scope.onError(err.data, err.status)
						throw err;
					});
			}

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
					return !Enumerable.From($scope.validationReport.errors).Any(function(x){return x.property==field})
				return true;
			}

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
					return $q.when(true);


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

				return $q.when(false);
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
				$location.url("/database/record?documentID=" + data.documentID);
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				$location.url(managementUrls.drafts);
			};


			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);	
				else
					$location.url(managementUrls.root);
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