angular.module('kmApp').compileProvider // lazy
.directive('editCaseStudy', ['authHttp', "URI", "$filter", "$q", "underscore", "Thesaurus", "guid", function ($http, URI, $filter, $q, _, Thesaurus, guid) {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-case-study.partial.html',
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
            	aichiTargets				: $http.get("/api/v2013/index", { params: { q:"schema_s:aichiTarget", fl:"identifier_s,title_t,number_d",  sort:"number_d ASC", rows:999999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.number_d  +" - "+ o.title_t } })}).then(null, $scope.onError),
				cbdSubjects					: function () { return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",									{ cache: true }).then(function(o){ return Thesaurus.buildTree(o.data); }); },
				docLanguages				: function () { return $http.get("/api/v2013/thesaurus/domains/ISO639-2/terms",										{ cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				scale						: function () { return $http.get("/api/v2013/thesaurus/domains/96FCD864-D388-4148-94DB-28B484047BA5/terms",         { cache: true }).then(function(o){ return o.data; }); },
				status						: function () { return $http.get("/api/v2013/thesaurus/domains/Capacity%20Building%20Project%20Status/terms",       { cache: true }).then(function(o){ return o.data; }); },
				regions				        : function () { 
					var qCountries = $http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); });
					var qRegions   = $http.get("/api/v2013/thesaurus/domains/regions/terms",   { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); });

					return $q.all(qCountries, qRegions).then(function(res){
						return _.concat(res[0], res[1]);
					});
				}
			};


			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if (tab == 'review')
					$scope.validate();

				var qBody = $element.parents("body:last");

				if(qBody.scrollTop() > $element.offset().top) {
					$timeout(function()	{
						if (!qBody.is(":animated"))
							qBody.stop().animate({ scrollTop:  $element.offset().top-100 }, 300);
					}, 100);
				}
			});

			$scope.init();
		},
		controller : ['$scope', "$q", "$location", 'IStorage', "Enumerable", "editFormUtility", "authentication", "ngProgress", "managementUrls", function ($scope, $q, $location, storage, Enumerable, editFormUtility, authentication, ngProgress, managementUrls) 
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

				var promise = null;
				var schema  = "caseStudy";
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
						
					$scope.cleanUp(doc);
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

			//==================================
			//
			//==================================
			$scope.validate = function(clone) {

				$scope.validationReport = null;

				var oDocument = $scope.document;

				if (clone !== false)
					oDocument = angular.fromJson(angular.toJson(oDocument));

				$scope.reviewDocument = oDocument

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
				$location.url("/management");
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
				$location.url("/management");
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				$location.url("/management");
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