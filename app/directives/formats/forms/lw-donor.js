define(['text!./lw-donor.html', 'app', 'angular', 'authentication', '../views/lw-event', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls',
 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation','services/lifeWebServices'], function(template, app, angular) { 'use strict';

app.directive('editLwDonor', ['$http', '$filter', '$q', 'guid', '$location', 'IStorage', 'Enumerable', 'editFormUtility', 'authentication', 'siteMapUrls', '$route','lifeWebServices', function ($http, $filter, $q, guid, $location, storage, Enumerable, editFormUtility, authentication, siteMapUrls, $route,lifeWebServices) {
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

			$scope.lifeWebServices = lifeWebServices;

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

 				if ($scope.document)
							return;
				$scope.status = "loading";

				var identifier = $route.current.params.uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "lwDonor");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema: "lwDonor",
							languages: ["en"]
						}
					});


				promise.then(
					function(doc) {
						$scope.status = "ready";
						loadCountry(doc);
						loadLogo(doc);
						loadWebsite(doc);
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
			 function loadCountry(doc) {
				if(doc.country)
					doc.country={identifier:doc.country.identifier,title:doc.country.customValue.en};
				
			};
			
			//==================================
			//
			//==================================
			 function loadLogo(doc) {
				if(doc.logo){
					var tempLogo=[];
					if(doc.logo.hasOwnProperty('tags'))
						tempLogo[0]={url:doc.logo.url,name:doc.logo.name,tags:doc.logo.tags};
					else
						tempLogo[0]={url:doc.logo.url,name:doc.logo.name};
				
					doc.logo=tempLogo;
				}
				
			};// loadLogo(doc)
			
			//==================================
			//
			//==================================
			 function loadWebsite(doc) {
				if(doc.logo){
					var tempWebsite=[];
					
					tempWebsite.push({url:doc.website.url,name:doc.website.name});
				
					doc.website=tempWebsite;
				}
				
			};// loadLogo(doc)
			
			
			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if(document.website)
					if(document.website[0].hasOwnProperty('name'))		
						document.website={url:document.website[0].url,name:document.website[0].name};
					else
						document.website={url:document.website[0].url};	
				
				if(document.logo)
					if(document.logo[0].hasOwnProperty('tag'))		
						document.logo={url:document.logo[0].url,name:document.logo[0].name,tags:document.logo[0].tags};
					else
						document.logo={url:document.logo[0].url,name:document.logo[0].name};					
				
				if(document.country)
					document.country={identifier:document.country.identifier,customValue:{'en':document.country.title}};
			
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
console.log('saving doc',oDocument);	
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
			$scope.onPostPublish = function() {
				$location.url('/submit/lwDonor');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				$location.url('/submit/lwDonor');
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('/submit/lwDonor');
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

			// //==================================
			// //
			// //==================================
			// $scope.loadRecords = function(identifier, schema) {

			// 	if (identifier) { //lookup single record
			// 		var deferred = $q.defer();

			// 		storage.documents.get(identifier, { info: "" })
			// 			.then(function(r) {
			// 				return r.data;
			// 			}, function(e) {
			// 				if (e.status == 404) {
			// 					storage.drafts.get(identifier, { info: "" })
			// 						.then(function(r) { deferred.resolve(r.data);},
			// 							  function(e) { deferred.reject (e);});
			// 				}
			// 				else {
			// 					deferred.reject (e);
			// 				}
			// 			});
			// 		return deferred.promise;
			// 	}

			// 	//Load all record of specified schema;

			// 	var sQuery = "type eq '" + encodeURI(schema) + "'";

			// 	return $q.all([storage.documents.query(sQuery, null, { cache: true }),
			// 				   storage.drafts   .query(sQuery, null, { cache: true })])
			// 		.then(function(results) {
			// 			var qResult = Enumerable.From (results[0].data.Items)
			// 									.Union(results[1].data.Items, "$.identifier");
			// 			return qResult.ToArray();
			// 		});
			// };

			$scope.init();

        }
    };
}]);
});
