define(['text!./lw-event.html', 'app', 'angular', 'authentication', '../views/lw-event',  'services/editFormUtility', 'directives/forms/form-controls',
 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation','services/lifeWebServices'], function(template, app, angular) { 'use strict';

app.directive('editLwEvent', ['$http', '$filter', '$q', 'guid', '$location', 'IStorage', 'Enumerable', 'editFormUtility', 'authentication', 
	'siteMapUrls', '$route','$log','lifeWebServices',  function ($http, $filter, $q, guid, $location, storage, Enumerable, editFormUtility, authentication, siteMapUrls, $route,$log,lifeWebServices) {
	return {
	
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		//scope      : {},
		link : function($scope)
		{
			
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };
			$scope.options  = {};

			

			$scope.lifeWebServices = lifeWebServices;
			

			//$scope.searchT =''; //search text
			//$scope.placeholder  = 'Type to search Organizations';

			//==================================
			   // makes cover image conform to the Elink definition
			//==================================

// 			$scope.eventTypes = function (query) {
// console.log('query entering function',query);			
// 			return $http.get('/api/v2013/thesaurus/domains/ED902BF7-E9A8-42E8-958B-03B6899FCCA6/terms', { cache: true }).then(function(data) {
				
// 					for(var i = 0; i != data.data.length; ++i)
// 						data.data[i].id = data.data[i]['identifier'];
			
// 					data.data.sort(function(a, b) {
// 						return (a[name] < b[name]) ? -1 : 1;
// 					});
// console.log('data.data',data.data);
// console.log('query', query);
// console.log('filter',$filter('filter')(data.data, query));
// 					return $filter('filter')(data.data, query); 
// 					//return arr;
				
// 				});
// 		};
			
			
			// makes pointer to  function
			

			
			
			
			
			//==================================
			   // makes cover image conform to the Elink definition
			//==================================
			$scope.eLinkCoverImage = function () {
				if($scope.document.coverImageTemp){
					
					var temp = _.find($scope.options.images(), function (image){		
						return image.identifier == $scope.document.coverImageTemp.identifier;
					});
					if(temp)
					$scope.document.coverImage=JSON.parse(JSON.stringify(temp));
					delete  $scope.document.coverImage.identifier;
					$scope.document.coverImage.tags=$scope.document.coverImage.tag; // validation bug gives tag in km control but only accepts tags
					delete  $scope.document.coverImage.tag;
					delete $scope.document.coverImageTemp;					
					//$scope.document.coverImage =tempArr; 
				}	
			};

			//==================================
			
			//==================================
			$scope.options.project = function () { 
				return $http.get('/api/v2013/index/select?cb=1418322176016&q=((schema_s:lwProject))&rows=155&sort=createdDate_dt+desc,+title_t+asc&start=0&wt=json&fl=identifier_s,title_s', { cache: true }).then(function (o) { 
						 angular.forEach(o.data.response.docs,function (element, index ){
						 	element.identifier=element.identifier_s;
						 	element.title=element.title_s;
						 });
						return o.data.response.docs;
				});	
			};


			//==================================
			  // activadtes the validate functio
			//==================================
			$scope.$watch('tab', function(tab) {
				if(!tab)
					return;

				if (tab == 'review'){
					
					//$scope.eLinkCoverImage();
					$scope.validate();
				}
			});


			//==================================
			//
			//==================================

			$scope.options.images= function(){
				if($scope.document)
				if($scope.document.images) 
				{
					angular.forEach($scope.document.images,
						function (element, index ){
							
							$scope.document.images[index].identifier=element.url;
						}
					);
					return $scope.document.images; 
				}
				else 
					return null;
					
			}//$scope.options.images
			
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
					promise = editFormUtility.load(identifier, "lwEvent");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema: "lwEvent",
							languages: ["en"]
						}
					});
				promise.then(
					function(doc) {
						$scope.status = "ready";

						
						loadType (doc);
						loadProject (doc);
						$scope.document = doc;
//											
//console.log('loading doc',$scope.document);



					}).then(null,
					function(err) {
						$scope.onError(err.data, err.status);
						throw err;
					})
					
				$scope.document=$scope.document;	
			};

			//==================================
			//
			//==================================
			//==================================
			//
			//==================================
			function loadProject (document) {
				if(document.hasOwnProperty('project')){
					$scope.lifeWebServices.getProjects(document.project.identifier).then(function (data){
							if(data.data.length==1){
								document.project=[];
								document.project.push({identifier:data.data[0].identifier_s,title:data.data[0].title_s});
							}				
						
						
					});// services call
				}
			}// loadProject

			//==================================
			//
			//==================================
			//==================================
			//
			//==================================
			function loadType (document) {
				if(document)
				$http.get('/api/v2013/thesaurus/domains/ED902BF7-E9A8-42E8-958B-03B6899FCCA6/terms', {chache: true  }).then(function(data) {

						var newTypes =[];
						_.each(data.data,function(item){
							_.each(document.type,function(type){
								if(item.identifier===type.identifier){
									
									newTypes.push({identifier:item.identifier,title:item.name});
								}
							})
							
						})
						
						document.type=newTypes; // ar
						return; 
				});// return

			}// load type


			//==================================
			//
			//==================================
			//==================================
			//
			//==================================
			function formatProject (document) {
				
				if(document.project){
					document.project = {identifier:document.project.identifier}
				}
				

			}// load type



			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

			 if(document.organizations){
					var tempOrgs =[];
						_.each(document.organizations,function (item){
							if(item.hasOwnProperty('identifier'))
								tempOrgs.push(item.identifier);
						});
						if(tempOrgs.length>0)
							document.organizations=tempOrgs;
						if(document.organizations.length ===0) delete document.organizations;
			  }
			  if(document.coverImageTemp)
			  	delete document.coverImageTemp;
				  
				formatProject (document);
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
              
	



			  
			//clean address
			if(oDocument.addressBlock){
			 	oDocument.location.address = oDocument.addressBlock.street.replace(/,/g, '')+", " + oDocument.addressBlock.city+ ", " + oDocument.addressBlock.state +", "+oDocument.addressBlock.country.title+", "+oDocument.addressBlock.postalCode; 
				oDocument.location.country = +oDocument.addressBlock.country;		
				delete oDocument.addressBlock;
			}

				$scope.reviewDocument = oDocument;
console.log('saving odocument',oDocument);	
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
				$location.url('/submit/lwEvent');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				return $scope.validate(false).then(function(hasError) {
					if (!hasError)
						$location.url('/submit/lwEvent');
					else
						$scope.tab = "review";
				});
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('/submit/lwEvent');
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
