define(['text!./lw-event.html', 'app', 'angular', 'authentication', '../views/lw-event',  'services/editFormUtility', 'directives/forms/form-controls',
 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation','services/lifeWebServices'], function(template, app, angular) { 'use strict';

app.directive('editLwEvent', ['$http', '$filter', '$q', 'guid', '$location', 'IStorage', 'Enumerable', 'editFormUtility', 'authentication', 
	'siteMapUrls', '$route','$log','lifeWebServices',  function ($http, $filter, $q, guid, $location, storage, Enumerable, editFormUtility, authentication, siteMapUrls, $route,$log,lifeWebServices) {
	return {
	
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope)
		{
			var coverImageHolder={};
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = {};
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };
			$scope.options  = {};
			
			

			$scope.lifeWebServices = lifeWebServices;
			

			
			// ==================================
			//    makes cover image conform to the Elink definition
			// ==================================
			$scope.eLinkCoverImage = function () {

				if($scope.document.coverImage){
					var temp = _.find($scope.options.images(), function (image){		
						return image.identifier == $scope.document.coverImage.identifier;
					});

					if(temp){
						$scope.document.coverImage=JSON.parse(JSON.stringify(temp));
						delete  $scope.document.coverImage.identifier;
						$scope.document.coverImage.tags=$scope.document.coverImage.tag; // validation bug gives tag in km control but only accepts tags
						delete	$scope.document.coverImage.tag;		 	
					}
				}	
			};

			// //==================================
			
			// //==================================
			// $scope.options.project = function () { 
			// 	return $http.get('/api/v2013/index/select?cb=1418322176016&q=((schema_s:lwProject))&rows=155&sort=createdDate_dt+desc,+title_t+asc&start=0&wt=json&fl=identifier_s,title_s', { cache: true }).then(function (o) { 
			// 			 angular.forEach(o.data.response.docs,function (element, index ){
			// 			 	element.identifier=element.identifier_s;
			// 			 	element.title=element.title_s;
			// 			 });
			// 			return o.data.response.docs;
			// 	});	
			// };


			//==================================
			  // activadtes the validate functio
			//==================================
			$scope.$watch('tab', function(tab) {
				if(!tab)
					return;

				if (tab == 'review'){
					
					$scope.eLinkCoverImage();
					$scope.validate();
				}else{
					if($scope.document.coverImage)
						loadCoverImage($scope.document);
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

		        // if ($scope.document)
				// 			return;

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
						
						 loadCoverImage(doc);
						// loadType (doc);
						// loadProject (doc);
						// var temp = doc.location;
						// delete doc.location;					
						$scope.document = doc;	
									
					
console.log(' loading doc ',doc);	
						
					}).then(null,
					function(err) {
						$scope.onError(err.data, err.status);
						throw err;
					})
					
				//$scope.document=$scope.document;	
			};
			  //==================================
			//
			//==================================
			function loadCoverImage(doc) {
			
					if(doc.coverImage){

						if(!_.isArray(doc.images))
							doc.images=[];
						if(!lifeWebServices.inArray(doc.images,{url:doc.coverImage.url,name: doc.coverImage.url, identifier:doc.coverImage.url}))
							doc.images.push({url:doc.coverImage.url,name: doc.coverImage.url, identifier:doc.coverImage.url});
						if(!doc.coverImage.identifier)	
							doc.coverImage.identifier= doc.coverImage.url;
					}
			
			  }// formatInstitutionalContext
			  
			  //==================================
			//
			//==================================
			function loadCoverImage(doc) {
			
					if(doc.coverImage){

						if(!_.isArray(doc.images))
							doc.images=[];
						if(!lifeWebServices.inArray(doc.images,{url:doc.coverImage.url,name: doc.coverImage.url, identifier:doc.coverImage.url}))
							doc.images.push({url:doc.coverImage.url,name: doc.coverImage.url, identifier:doc.coverImage.url});
						if(!doc.coverImage.identifier)	
							doc.coverImage.identifier= doc.coverImage.url;
					}
			
			  }// formatInstitutionalContext


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
			function formatProject (document) {
				
				if(document.project){
					document.project = {identifier:document.project.identifier}
				}
			}// load type

			//==================================
			//
			//==================================
			function claenOrgs (document) {
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
			}// load type


					
			// }// load type

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;
		
				cleanCoverImage(document);
				claenOrgs (document);
				formatProject (document);
				if (!document)
					return $q.when(true);


				// if (/^\s*$/g.test(document.notes))
				// 	document.notes = undefined;

				return $q.when(false);
			};

			//==================================
			//
			//==================================
			function cleanCoverImage(document) {	
					
					if(document.coverImage)	{
						coverImageHolder=angular.copy(document.coverImage);
						if( _.isArray(document.coverImage)){
							document.coverImage=document.coverImage[0];
							delete document.coverImage.identifier;
						}else if ( _.isObject(document.coverImage)){

							delete document.coverImage.identifier;							
						}
						if( document.coverImage.tags)
							delete  document.coverImage.tags;
					}
							
			  }// formatInstitutionalContext


			//==================================
			//
			//==================================
			$scope.validate = function(clone) {

				$scope.validationReport = null;

				var oDocument = $scope.document;

				if (clone !== false)
					oDocument = angular.fromJson(angular.toJson(oDocument));
              
			//clean address
			if(oDocument.addressBlock && oDocument.location){

			 	oDocument.location.address = oDocument.addressBlock.street.replace(/,/g, '')+", " + oDocument.addressBlock.city+ ", " + oDocument.addressBlock.state +", "+oDocument.addressBlock.country.title+", "+oDocument.addressBlock.postalCode; 
				oDocument.location.country = +oDocument.addressBlock.country.identifier;		
				delete oDocument.addressBlock;
			}

				$scope.reviewDocument = oDocument;
				
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


			$scope.init();
			

        }
    };
}]);
});
