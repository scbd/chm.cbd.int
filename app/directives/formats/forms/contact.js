define(['text!./contact.html', 'app', 'angular', 'authentication', '../views/contact', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage'], function(template, app, angular) { 'use strict';


angular.module('kmApp') // lazy
.directive('editContact', ["$http", "$q", "Enumerable", "$location", "$filter", 'IStorage', "editFormUtility", "navigation", "siteMapUrls", "Thesaurus", "guid", "$route", function ($http, $q, Enumerable, $location, $filter, storage, editFormUtility, navigation, siteMapUrls, Thesaurus, guid, $route) {
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
				var qs      = $route.current.params;

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
							organizationTypes : $http.get("/api/v2013/thesaurus/domains/Organization Types/terms", { cache: true }).then(function(o){ return o.data; })
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
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return;

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
			};

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
			$scope.onPostSaveDraft = function() {
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
					$scope.error = error.Message;
				else
					$scope.error = error;
			};

		
			  //============================================================
					//
					//============================================================          
			  function getSingleRecord(identifier){
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
			  };

		
			  //============================================================
					//
					//============================================================       
			  function getAllOrgs(){
				var params = {
				  q: "schema_s:contact AND type_s:organization",
				  rows:10
				};
				//console.log('queryyyyyyyyy:'+params);
				return $q.all([$http.get("/api/v2013/index", { params:params, cache: true })])
				  .then(function(results) {
		
					var qResult = Enumerable.From (normalizeSolrResult(results[0].data.response.docs))
								.Union(results[1].data.Items, "$.identifier");
					return qResult.ToArray();
				  });
			  };
			  function solrPropTolString(propertyName, solrDoc) {
				if (!solrDoc[propertyName + '_t']) return {}

				var langs = ['EN', 'AR', 'ES', 'FR', 'RU', 'ZH']
				var lString = {}

				for (var i = 0; i < langs.length; i++) {
					lString[langs[i].toLowerCase()] = solrDoc[propertyName + '_' + langs[i] + '_t']
				}
				return lString
				};
			  function normalizeSolrResult(data){
				var normalData=[]
				for (var i = 0; i < data.length; i++) {
				  normalData[i] ={}
				  normalData[i].identifier = data[i].identifier_s
				  normalData[i].title = solrPropTolString('title',data[i])
				}
				return normalData
			  };

			  


			  $scope.loadOrgs = function(identifier) {
		
				if (identifier) 
					return getSingleRecord(identifier)
				
					return getAllOrgs()
				};
			$scope.init();
		}
	};
}]);
});
