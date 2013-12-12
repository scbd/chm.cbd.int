angular.module('kmApp').compileProvider // lazy
.directive('editOrganization', ['authHttp', "guid", "$filter", "Thesaurus", "guid", "$timeout", function ($http, guid, $filter, Thesaurus, guid, $timeout) {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-organization.partial.html',
		replace    : true,
		transclude : false,
		scope: {
			cmsParams : "&"
		},
		link : function($scope, $element)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };
			$scope.options  = {
				countries					: function() { return $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				organizationTypes			: function() { return $http.get("/api/v2013/thesaurus/domains/Organization%20Types/terms", { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				cbdSubjects					: function() { return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",         { cache: true }).then(function(o){ return Thesaurus.buildTree(o.data); }); },
				absThematicAreas			: function() { return $http.get("/api/v2013/thesaurus/domains/ABS-SUBJECTS/terms",         { cache: true }).then(function(o){ return Thesaurus.buildTree(o.data); }); },
				libraries					: function() { return $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms",         { cache: true }).then(function(o){ return Enumerable.From(o.data).Where("$.identifier!='cbdLibrary:bch'").ToArray();})},
				typeOfGeneticResources		: function () { return $http.get("/api/v2013/thesaurus/domains/20945FA8-C24C-4AF6-B3D9-367592AFDF48/terms", { cache: true }).then(function (o) { return Thesaurus.buildTree(o.data); }); },
				originOfGeneticResources	: function () { return $http.get("/api/v2013/thesaurus/domains/545CD54C-CFF3-41E8-A003-FDD278426A3A/terms", { cache: true }).then(function (o) { return Thesaurus.buildTree(o.data); }); },
				userOfGeneticResources      : function () { return $http.get("/api/v2013/thesaurus/domains/034C8D3F-EF8B-4144-8CA4-3839C466F96E/terms", { cache: true }).then(function (o) { return Thesaurus.buildTree(o.data); }); },
					
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
		controller : ['$scope', "$q", "$location", 'IStorage', "Enumerable", "underscore", "editFormUtility", "authentication", "siteMapUrls", function ($scope, $q, $location, storage, Enumerable, _, editFormUtility, authentication, siteMapUrls) 
		{
			//==================================
			//
			//==================================
			$scope.isInLibrary = function (name, document) {
				document = document || $scope.document;

				if (!document || !document.libraries)
					return false;

				var qLibraries = Enumerable.From(document.libraries);

				if (name == "chm") return qLibraries.Any(function (o) { return o.identifier == "cbdLibrary:chm" });
				if (name == "absch") return qLibraries.Any(function (o) { return o.identifier == "cbdLibrary:abs-ch" });
				if (name == "bch") return qLibraries.Any(function (o) { return o.identifier == "cbdLibrary:bch" });
				if (name == "ebsa") return qLibraries.Any(function (o) { return o.identifier == "cbdLibrary:ebsa" });

				return false;
			}

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
				if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = $location.search().uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "organization");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "organization",
							languages: ["en"]
						}
					}).then(function(doc){
						if ($scope.cmsParams() && $scope.cmsParams().defaultLibrary)
							doc.libraries = [{ identifier: $scope.cmsParams().defaultLibrary }];
						return doc;
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