define(['text!./lw-project.html', 'app', 'angular', 'authentication', '../views/lw-event',  'services/editFormUtility', 'directives/forms/form-controls',
 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation','services/lifeWebServices'], function(template, app, angular) { 'use strict';

app.directive('editLwProject', ['$http', '$filter', '$q', 'guid', '$location', 'IStorage', 'Enumerable', 'editFormUtility', 'authentication', 
	'siteMapUrls', '$route','$log','lifeWebServices', '$rootScope', function ($http, $filter, $q, guid, $location, storage, Enumerable, editFormUtility, authentication, siteMapUrls, $route,$log,lifeWebServices,$rootScope) {
	return {
	
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		//scope      : {},
		link : function($scope)
		{
			
			
			$scope.status   = "";   
			$scope.error    = null; // error messsage
			$scope.document = {}; // document to be submitted to api
			// main tab set
			$scope.tab      = 'general';
			$scope.review   = { locale : "en" };

			// aichi Dynamic Taget tabs
			$scope.aichiTabs        	= [];
			$scope.aichiSelectedTab		= '';
			$scope.aichiFirstTab 		= '';
			$scope.aichiLastTab 		= '';
			$scope.prevAichiTab 		= '';
			$scope.nextAichiTab			= '';
			$scope.aichiComments		= [];

			// climateContribution Dynamic Taget tabs
			$scope.climateContributionTabs        	= [];
			$scope.climateContributionSelectedTab	= '';
			$scope.climateContributionFirstTab 		= '';
			$scope.climateContributionLastTab 		= '';
			$scope.prevclimateContributionTab 		= '';
			$scope.nextclimateContributionTab		= '';
			$scope.climateContributionComments		= [];
			$scope.selectedClimateContributions		= [];
			
			// 
			$scope.document.institutionalContext = [];//{partner:'',info:'',role:''};
			//$scope.document.budget			     = [];		
			//$scope.document.donations			 = [];
			//$scope.document.images			  	 = [];		
				
			//services
			$scope.lifeWebServices 		= lifeWebServices;

			// national alignment tabs
			$scope.natAliSelectedTab	='NBSAPs';
			$scope.natAliPrevTab		='NBSAPs';
			$scope.natAliNextTab		='climateChange';
			
             // should not need later
			$scope.options ={}; 




			//==================================
			//add a blank row to the institutionalContext array 
			// so user can insert new data
			//==================================
			$scope.addRowDonation = function () {
				    if(!$scope.document.donations)$scope.document.donations=[];
					if($scope.document.donations.length>0 && _.last($scope.document.donations).date)
						$scope.document.donations.push({date:undefined});
					else if($scope.document.donations.length===0)
						$scope.document.donations.push({date:undefined});
			};	


			//==================================
			// 
			//==================================			
			
			$scope.$watch("document.donation", function (tab){	
					if($scope.document.donations){
						if(  $scope.document.donations.length==0)
							$scope.addRowDonation();
					}else
						$scope.addRowDonation();
			});//$scope.$watch("climateContributionSelectedTab"

			//==================================
			//add a blank row to the institutionalContext array 
			// so user can insert new data
			//==================================
			$scope.addRowBudget = function () {
				if(!$scope.document.budget)$scope.document.budget=[];
					if($scope.document.budget.length>0 && _.last($scope.document.budget).activity)
						$scope.document.budget.push({activity:undefined});
					else if($scope.document.budget.length===0)
						$scope.document.budget.push({activity:undefined});
			};	


			//==================================
			// 
			//==================================			
			
			$scope.$watch("document.budget", function (tab){
					if($scope.document.budget){
						if($scope.document.budget.length==0)
							$scope.addRowBudget();
					}else
						$scope.addRowBudget();

			});//$scope.$watch("climateContributionSelectedTab"




			//==================================
			//add a blank row to the institutionalContext array 
			// so user can insert new data
			//==================================
			$scope.addRowInstitutionalContext = function () {
				if(!$scope.document.institutionalContext)$scope.document.institutionalContext=[];
					if($scope.document.institutionalContext.length>0 && _.last($scope.document.institutionalContext).partner)
						$scope.document.institutionalContext.push({partner:undefined,info:undefined});
					else if($scope.document.institutionalContext.length===0)
						$scope.document.institutionalContext.push({partner:undefined,info:undefined});
			};	


			//==================================
			// 
			//==================================			
			
			$scope.$watch("document.institutionalContext", function (tab){
					if($scope.document.institutionalContext){
						if($scope.document.institutionalContext.length==0)
							$scope.addRowInstitutionalContext();
					}else
						$scope.addRowInstitutionalContext();

			});//$scope.$watch("climateContributionSelectedTab"

			//==================================
			// dynamic climateContribution tabs
			//==================================			
			
			$scope.$watch("climateContributionSelectedTab", function (tab){
					 _.each($scope.climateContributionTabs, function(item,key){
						 if(item.identifier=== tab) {
			 	
							 if(key>=1)
							 	$scope.prevClimateContributionTab=$scope.climateContributionTabs[key-1].identifier;
							 if(key<$scope.climateContributionTabs.length-1)
							 	$scope.nextClimateContributionTab=$scope.climateContributionTabs[key+1].identifier;
							 	
						 } 
					 });
			});//$scope.$watch("climateContributionSelectedTab"
			
			//==================================
			// // needed this function as normal assignment was not triggering $watch or updating scope but working in dom
			//==================================
			$scope.setClimateContributionTab = function (tabName) {
					if(tabName){
						$scope.climateContributionSelectedTab = tabName;
					}
					$scope.document.climateContribution=$scope.document.climateContribution;
			};			
			//==================================
			// // climateContribution dynamic tabs
			//==================================
			$scope.$watch("document.climateContribution", function (tab){
					$scope.climateContributionTabs = $scope.document.climateContribution;

					
					if($scope.climateContributionTabs && $scope.climateContributionTabs.length > 0){
						$scope.climateContributionFirstTab =  $scope.climateContributionTabs[0].identifier;
						$scope.climateContributionLastTab  =  $scope.climateContributionTabs[$scope.climateContributionTabs.length-1].identifier;
						if($scope.climateContributionSelectedTab=='' )
							$scope.climateContributionSelectedTab=$scope.climateContributionFirstTab; 
					}

			});
			
			//==================================
			//
			//==================================
			$scope.showClimateContributionTab = function (thisTabName) {
					$scope.document.climateContribution=$scope.document.climateContribution;

					if(thisTabName === $scope.climateContributionSelectedTab)
						return true;
					else
						return false;
			};		

			//==================================
			//
			//==================================
			$scope.setNatAliSelectedTab = function (tabName) {
					if(tabName){
						$scope.natAliSelectedTab = tabName;
					}
				if(tabName == "NBSAPs"  ) 	 		{ $scope.natAliPrevTab = "NBSAPs"; 	   			$scope.natAliNextTab = "climateChange";}
				if(tabName == "climateChange")     	{ $scope.natAliPrevTab = "NBSAPs"; 	   			$scope.natAliNextTab = "o_n_s";}
				if(tabName == "o_n_s"  )    		{ $scope.natAliPrevTab = "climateChange";      	$scope.natAliNextTab = "o_n_s";}
			};			
						
			//==================================
			// // aichi dynamic tabs
			//==================================
			$scope.$watch("document.aichiTargets", function (tab){
					$scope.aichiTabs = $scope.document.aichiTargets;

					
					if($scope.aichiTabs && $scope.aichiTabs.length > 0){
						$scope.aichiFirstTab =  $scope.aichiTabs[0].identifier;
						$scope.aichiLastTab  =  $scope.aichiTabs[$scope.aichiTabs.length-1].identifier;
						if($scope.aichiSelectedTab=='' )
							$scope.aichiSelectedTab=$scope.aichiFirstTab; 
							

					}

			});
			
			//==================================
			// dynamic aichi tabs
			//==================================			
			
			$scope.$watch("aichiSelectedTab", function (tab){
					 _.each($scope.aichiTabs, function(item,key){
						 if(item.identifier=== tab) {
			 	
							 if(key>=1)
							 	$scope.prevAichiTab=$scope.aichiTabs[key-1].identifier;
							 if(key<$scope.aichiTabs.length-1)
							 	$scope.nextAichiTab=$scope.aichiTabs[key+1].identifier;
							 	
						 } 
					 });
			});//$scope.$watch("aichiSelectedTab"
			
			//==================================
			//
			//==================================
			$scope.setAichiTab = function (tabName) {
					if(tabName){
						$scope.aichiSelectedTab = tabName;
					}
					$scope.document.selectedAichiTargets=$scope.document.selectedAichiTargets;
			};

			//==================================
			//
			//==================================
			$scope.showAichiTab = function (thisTabName) {
					$scope.document.selectedAichiTargets=$scope.document.selectedAichiTargets;
					if(thisTabName === $scope.aichiSelectedTab)
						return true;
					else
						return false;
			};			
			
			
			//==================================
			   // makes cover image conform to the Elink definition
			//==================================
			$scope.eLinkCoverImage = function () {
				if($scope.document.thumbnail){
					var temp = _.find($scope.options.images(), function (image){		
						return image.identifier == $scope.document.thumbnail.identifier;
					});

					if(temp)
					$scope.document.thumbnail=JSON.parse(JSON.stringify(temp));
					delete  $scope.document.thumbnail.identifier;
					$scope.document.thumbnail.tags=$scope.document.thumbnail.tag; // validation bug gives tag in km control but only accepts tags
					delete  $scope.document.thumbnail.tag;							
				}	
			};




			//==================================
			  // activadtes the validate functio
			//==================================
			$scope.$watch('tab', function(tab) {
				if(!tab)
					return;

				if (tab == 'review'){
					
					$scope.eLinkCoverImage();
					$scope.validate();
				}
			});


			//==================================
			//
			//==================================

			$scope.options.images= function(){
				
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

		        if ($scope.document.header)
							return;

				$scope.status = "loading";

				var identifier = $route.current.params.uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "lwProject");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema: "lwProject",
							languages: ["en"]
						}
					});
				promise.then(
					function(doc) {
						$scope.status = "ready";

						loadAichiTargets(doc);
						loadClimateContribution(doc);
						loadThumbnail(doc);
						 loadConsitutional(doc);
						$scope.document = doc;
console.log($scope.document);
					}).then(null,
					function(err) {
						$scope.onError(err.data, err.status);
						throw err;
					});
			};
			
			//==================================
			//
			//==================================

			function loadConsitutional(document) {
							_.each(document.institutionalContext, function (type,key) {
									if(_.isObject(type)){

										if(_.isObject(type.role))
											type.role = {identifier:type.role,title:type.role};

									}
							});//	}
			  }// formatInstitutionalContext

			  //==================================
			//
			//==================================
			function loadThumbnail(doc) {
				
							if(doc.thumbnail)
								doc.thumbnail= {url:doc.thumbnail.url,name:doc.thumbnail.name, identifier:doc.thumbnail.url};
			
			  }// formatInstitutionalContext
			//==================================
			//
			//==================================

			function loadAichiTargets(document) {
				
							_.each(document.aichiTargets, function (type,key) {
									if(!_.isEmpty(type) && type.type){

										$scope.aichiComments[type.type.identifier]=type.comment;
										document.aichiTargets[key] = {identifier:type.type.identifier,title:type.type.title};
										
									}

							});	
			  }// formatInstitutionalContext

			//==================================
			//
			//==================================

			function loadClimateContribution(document) {
				
							_.each(document.climateContribution, function (type,key) {
									if(!_.isEmpty(type) && type.type){

										$scope.climateContributionComments[type.type.identifier]=type.comment;
										document.climateContribution[key] = {identifier:type.type.identifier,title:type.type.title};
										
									}
							});	
			  }// formatInstitutionalContext





			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
					return $q.when(true);


				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;
				
				$scope.eLinkCoverImage();	
								  // clean partners
			  if(document.institutionalContext)
			  	formatInstitutionalContext(document.institutionalContext);
  			
	
			  formatAichiTargets(document);

			  if(document.nationalAlignment){
				  document.nationalAlignment=_.toArray(document.nationalAlignment);
				formatNationalAlignment(document.nationalAlignment);	
			  }		
			  
	
				formatClimateContribution(document);	
			 if(document.donations)	
				formatDonations(document.donations)	
				
			if(document.budget){
				formatBudget(document.budget);
			}
			
				return $q.when(false);
			};

			//==================================
			//
			//==================================
			function formatBudget(budget) {	
						//budget.pop();
			  }// formatInstitutionalContext
			  
			//==================================
			//
			//==================================
			function formatInstitutionalContext(iContext) {
				
							_.each(iContext, function (item) {							
									if(_.isObject(item.role))
										item.role= item.role.identifier	;	

							});	

			  }// formatInstitutionalContext


			//==================================
			//
			//==================================
			function formatAichiTargets(document) {

							if(_.isEmpty(document.aichiTargets)){
								delete document.aichiTargets;
								//document.aichiTargets=undefined;
								return;
						
							}else
							_.each(document.aichiTargets, function (type,key) {
									if(!_.isEmpty(type) && !type.type)
										document.aichiTargets[key] = {type:type, comment:$scope.aichiComments[type.identifier]};

							});	
			  }// formatInstitutionalContext
			  
			 //==================================
			//
			//==================================
			function formatNationalAlignment(natAli) {
												
									natAli[0] = {type:{identifier:'NBSAP',customValue:{'en':'NBSAPs'}},comment:natAli[0].comment};
									natAli[1] = {type:{identifier:'CC',customValue:{'en':'National Climate'}},comment:natAli[1].comment};

			  }// formatInstitutionalContext

			 //==================================
			//
			//==================================
			function formatClimateContribution(document) {
							if(_.isEmpty(document.climateContribution)){
								delete document.climateContribution;
								return;
							}else
							_.each(document.climateContribution, function (type,key) {
									if(!_.isEmpty(type) && !type.type)	
										document.climateContribution[key] = {type:type, comment:$scope.climateContributionComments[type.identifier]};
							});	
			  }// formatInstitutionalContext
			  
			  //==================================
			//
			//==================================
			function formatDonations(dons) {
							_.each(dons, function (type,key) {
									if(!_.isEmpty(type))	
										if(!type.funding && type.date && type.donor)
											type.funding=1;
// need proper consistant error handeling
// I cannot find the way to inject a proper error and halt saving
										// 	$scope.onError("funding value cannot be 0");
										// 	return;
										// }else{
										// 	if($scope.error == "funding value cannot be 0")
										// 		$scope.error='';
										// }
							});	
							//dons.pop();
			  }// formatInstitutionalContext


			  
			  
			//==================================
			//
			//==================================
			$scope.validate = function(clone) {
 
				$scope.validationReport = null;

				var oDocument = $scope.document;

				if (clone !== false)
					oDocument = angular.fromJson(angular.toJson(oDocument));
              
	

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
			$scope.onPostSaveDraft = function() {
				$rootScope.$broadcast("onSaveDraft", "Draft record saved.");
			};
			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
				//return $scope.cleanUp();
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError ;
				});

			};

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError ;
				});
			};



			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				
				$location.url('/submit/lwProject');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				$location.url('/submit/lwProject');
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('/submit/lwProject');
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
