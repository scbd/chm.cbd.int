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
			//p
			// 
			//==================================
			$scope.options.getCampaigns = function () {
				  var options=[];
				  	options[0]={title:'Zero Extinction',identifier:'zeroextinction'};
					options[1]={title:'Island Resilience',identifier:'islandresilience'};

				  return options;
			}//$scope.options.availableFeaturePositions

			//==================================
			//populate select box with available feature positions 
			// 
			//==================================
			$scope.options.availableFeaturePositions = function () {
				  var featuredOptions=[];
				  	featuredOptions[1]={title:'1',identifier:1};
					featuredOptions[2]={title:'2',identifier:2};
					featuredOptions[3]={title:'3',identifier:3};
					featuredOptions[4]={title:'4',identifier:4};
					featuredOptions[5]={title:'5',identifier:5};
					featuredOptions[6]={title:'6',identifier:6};
					
				 return lifeWebServices.getFeaturedProjects().then(

					  function (projs){
					  
						  	_.each(projs.data, function (p,key){
								 
								 if($scope.document.featured){
										if(p.featured_d==1  && $scope.document.featured.identifier !=1)
											delete featuredOptions[1];
											//featuredOptions[1]=0;
										if(p.featured_d==2  && $scope.document.featured.identifier !=2)
											delete featuredOptions[2];
										if(p.featured_d==3  && $scope.document.featured.identifier !=3)
											delete featuredOptions[3];								  									
										if(p.featured_d==4  && $scope.document.featured.identifier !=4)
											delete featuredOptions[4];	
										if(p.featured_d==5 && $scope.document.featured.identifier != 5)
											delete featuredOptions[5];	
										if(p.featured_d==6 && $scope.document.featured.identifier !=6)
											delete featuredOptions[6];
								 }else{
									 	if(p.featured_d==1 )
											delete featuredOptions[1];
											//featuredOptions[1]=0;
										if(p.featured_d==2 )
											delete featuredOptions[2];
										if(p.featured_d==3 )
											delete featuredOptions[3];								  									
										if(p.featured_d==4  )
											delete featuredOptions[4];	
										if(p.featured_d==5)
											delete featuredOptions[5];	
										if(p.featured_d==6 )
											delete featuredOptions[6];
									 
									 
								 }										  									  
						
							  });

							//if($scope.document.featured)
							//	featuredOptions[$scope.document.featured.identifier]={title:$scope.document.featured.identifier,identifier:$scope.document.featured.identifier};

							if(featuredOptions.length==0)
								featuredOptions['EOF']={title:'Please deselect featured project to create a spot',identifier:''};
							return featuredOptions;  
					  });
					  
					
			}//$scope.options.availableFeaturePositions


			//==================================
			//add a blank row to the institutionalContext array 
			// so user can insert new data
			//==================================
			$scope.addRowDonation = function () {
				    if(!$scope.document.donations)$scope.document.donations=[];
					if($scope.document.donations.length>0 && _.last($scope.document.donations).date)
						$scope.document.donations.push({});
					else if($scope.document.donations.length===0)
						$scope.document.donations.push({});
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
						$scope.document.budget.push({});
					else if($scope.document.budget.length===0)
						$scope.document.budget.push({});
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
						$scope.document.institutionalContext.push({});
					else if($scope.document.institutionalContext.length===0)
						$scope.document.institutionalContext.push({});
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
			$scope.eLinkCoverImage = function (document) {
			    if(!document) document=$scope.document;
				if(document.thumbnail){
					var temp = _.find($scope.options.images(), function (image){		
						return image.identifier == document.thumbnail.identifier;
					});

					if(temp)
						document.thumbnail=JSON.parse(JSON.stringify(temp));
					delete  document.thumbnail.identifier;
					document.thumbnail.tags=document.thumbnail.tag; // validation bug gives tag in km control but only accepts tags
												
				}
//console.log('end of elink',$scope.document.thumbnail);	
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
				
				if($scope.document.images) 
				{
					angular.forEach($scope.document.images,
						function (element, index ){
							
							$scope.document.images[index].identifier=element.url;
							if(!$scope.document.images[index].name)
								$scope.document.images[index].name=element.url;
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
//console.log('$scope.document.header',$scope.document.header);
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
						loadDonations(doc);
						loadBudegt(doc);
						loadFeatured(doc);
						loadAttachments(doc);
	//					doc.countries=loadCountries(doc);
//console.log('doc.coutnries from funciton',doc.countries);
						$scope.document = doc;
//console.log('scope loading doc countries',$scope.document.countries);
					}).then(null,
					function(err) {
						$scope.onError(err.data, err.status);
						throw err;
					});
			};
			
			function loadFeatured(document) {
					if(document.featured)	{
						document.featured={title:document.featured,identifier:document.featured};
					}			
			  }// formatInstitutionalContext
			
			//==================================
			//
			//==================================

			function loadAttachments(document) {
	
					if(document.attachments)
						_.each(document.attachments,function (att){
							if(att.title)
								att.name=att.title;
							if(att.keywords)
								att.tag=att.keywords;												
						});
							
			  }// formatInstitutionalContext
			  			
			//==================================
			//
			//==================================

			function loadDonations(document) {
//console.log('document.donations',document.donations);	
							if(_.isArray(document.donations)){
									_.each(document.donations, function (donor,key) {
											if(!_.isEmpty(donor) && donor.donor){
											
												if(donor.donor)
												if(donor.donor.hasOwnProperty['0'])
												{
													donor.donor= {identifier:donor.donor[0].identifier};
												} else
													donor.donor= {identifier:donor.donor.identifier};

												if(_.isEmpty(donor.date) && !donor.date)
													donor.date = new Date('01/01/2008');
												
											}//if(!_.isEmpty(donor) && donor){		
									});	//_.each(document.donations
									document.donations.push({});
							}else{
								document.donations=[];
								document.donations.push({});
							}	
			  }// formatInstitutionalContext
			  
			  			//==================================
			//
			//==================================

			function loadBudegt(document) {
//console.log('document.donations',document.donations);	
							if(_.isArray(document.budget))
								document.budget.push({});
							else document.budget=[{}];				
			  }// formatInstitutionalContext	
			  		
			//==================================
			//
			//==================================
			function loadConsitutional(document) {
					var institutionalContext =[];
					if(_.isArray(document.institutionalContext)){
							_.each(document.institutionalContext, function (role,key) {	
									if(_.isObject(role))
										if(!_.isObject(role.role)){
													lifeWebServices.getRoles().then(function (data){
														_.each(data, function (dataRole,key) {

																if(dataRole.title === role.role || dataRole.identifier === role.role)
																	role.role = {identifier:dataRole.identifier,title:dataRole.title};
															});
													});//lifeWebServices.getRoles()
										}//if(_.isObject(type.role)){
							});//_.each(document.institutionalContext
					   document.institutionalContext.push({});		
					}//if(_.isArray(document.institutionalContext))
					else{
						document.institutionalContext=[];
						document.institutionalContext.push({});
					}
			  }// formatInstitutionalContext
			  
			  
			//   //==================================
			// //
			// //==================================
			// function loadCountries(doc) {
				
			// 		if(doc.countries)
			// 			if( (_.contains(_.pluck(doc.countries,'title'),undefined)))
			// 				_.each(doc.countries, function (country,key){
			// 						lifeWebServices.getCountries('query').then(function(data){
			// 							_.each(data.data, function (countryComplete,key){
			// 									if(country.identifier===countryComplete.identifier){
			// 										country.title=countryComplete.name;											
			// 									}	
			// 							});
										

			// 					  });
			// 				});
			// 	//console.log('doc.countries',doc.countries);			
			// 	console.log('doc.countries',doc.countries);
			// 							return doc.countries;		
			//   }// loadCountries
			  
			  
			  //==================================
			//
			//==================================
			function loadThumbnail(doc) {
			
					if(doc.thumbnail  && !_.isEmpty(doc.thumbnail)){

						if(!_.isArray(doc.images))
							doc.images=[];
						if(!lifeWebServices.inArray(doc.images,{url:doc.thumbnail.url,name:doc.thumbnail.name || doc.thumbnail.url, identifier:doc.thumbnail.url}))
							doc.images.push({url:doc.thumbnail.url,name: doc.thumbnail.url, identifier:doc.thumbnail.url});
						if(!doc.thumbnail.identifier)	
							doc.thumbnail.identifier= doc.thumbnail.url;
					}
			
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
			// preps data to meet schema requirements
			//==================================
			$scope.cleanUp = function(document) {
					document = document || $scope.document;
		
					if (!document)
						return $q.when(true);
		
		
					if (/^\s*$/g.test(document.notes))
						document.notes = undefined;
						
					$scope.eLinkCoverImage(document); // formats image 

					
					cleanThumbnail(document);
			
					cleanAichiTargets(document);
		
//console.log('before formatting document.nationalAlignment',document);
				    formatNationalAlignment(document);	
//console.log('after formatting document.nationalAlignment',document);						
					cleanCC(document);	
					
					// blank row table controls need to clean
					cleanIC(document);

					cleanDonations(document)	
					cleanBudget(document);
					cleanFatured(document);
				return $q.when(false);
			};


			//==================================
			//
			//==================================
			function cleanFatured(document) {	
					if(document.featured && _.isObject(document.featured))
					{
						document.featured = document.featured.identifier;
					}
							
			  }// formatInstitutionalContext
			//==================================
			//
			//==================================
			function cleanThumbnail(document) {	
//console.log('document.thumbnail',document.thumbnail);
					if(document.thumbnail)	{
						if( _.isArray(document.thumbnail)){
//console.log('document.thumbnail1',document.thumbnail);
							document.thumbnail=document.thumbnail[0];
							delete document.thumbnail.identifier;
						}else if ( _.isObject(document.thumbnail)){
//console.log('document.thumbnail2',document.thumbnail);
							delete document.thumbnail.identifier;							
						}
						if( document.thumbnail.tags)
							delete  document.thumbnail.tags;
					}
//console.log('document.thumbnail1 at end',document.thumbnail)
							
			  }// formatInstitutionalContext

			//==================================
			//
			//==================================
			function cleanBudget(doc) {		
					if(doc.budget  ){
						if(doc.budget.hasOwnProperty('0') && doc.budget.hasOwnProperty('length') && _.isEmpty(doc.budget[0])){
							delete doc.budget ;
							return;
						} 
						_.each(doc.budget, function (item,key) {
								if(_.isEmpty(doc.budget[key]) ) {
									
									delete doc.budget[key];
									doc.budget.length--;
								}
								else{	
									if(Object.keys(item).length===0){
										delete doc.budget[key];
										delete doc.budget.key;
										doc.budget.length--;
									}	
								}						

						});	
					}
			  }// formatInstitutionalContext
			  
			//==================================
			//clean InstitutionalContext
			//==================================
			function cleanIC(doc) {
					if(doc.institutionalContext){
					if(doc.institutionalContext.hasOwnProperty('0') && doc.institutionalContext.hasOwnProperty('length') && _.isEmpty(doc.institutionalContext[0])){

							delete doc.institutionalContext;
							return;
						} 
						_.each(doc.institutionalContext, function (item,key) {
								if(_.isEmpty(doc.institutionalContext[key]) ) {
									delete doc.institutionalContext[key];	
									doc.institutionalContext.length--;
								}else{					
									if(Object.keys(item).length===0){
										delete doc.institutionalContext[key];
										delete doc.institutionalContext.key
										doc.institutionalContext.length--;
									}	
									if(_.isObject(item.role))
										item.role= item.role.identifier	;
								}	
						});	
					}
			  }// formatInstitutionalContext


			//==================================
			//
			//==================================
			function cleanAichiTargets(document) {

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
			function formatNationalAlignment(doc) {
	//console.log('natAli1',doc.nationalAlignment);						
							var tempNatAli= new Array();
							
							if(doc.nationalAlignment){
								if(doc.nationalAlignment[0])		
									tempNatAli[0] = {type:{identifier:'NBSAP',customValue:{'en':'NBSAPs'}},comment:doc.nationalAlignment[0].comment};
								if(doc.nationalAlignment[1])
									tempNatAli[1] = {type:{identifier:'climateChange',customValue:{'en':'National Climate'}},comment:doc.nationalAlignment[1].comment};	
								if(doc.nationalAlignment[2])
									tempNatAli[2] = {type:{identifier:'o_n_s',customValue:{'en':'Other National Strategies'}},comment:doc.nationalAlignment[2].comment};	
		
								doc.nationalAlignment=tempNatAli;
							}
			  }// formatInstitutionalContext

			 //==================================
			//formatClimateContribution
			//==================================
			function cleanCC(document) {
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
			function cleanDonations(doc) {
	
					if(doc.donations){
				
					if(doc.donations.hasOwnProperty('0') && doc.donations.hasOwnProperty('length') && _.isEmpty(doc.donations[0])){

							delete doc.donations;
							return;
						} 
						
							_.each(doc.donations, function (type,key) {
								if(_.isEmpty(doc.donations[key]) ) {
									delete doc.donations[key];
									doc.donations.length--;
								}
								else{
									if((Object.keys(type).length===0 || _.isEmpty(type))){
										delete doc.donations[key];
										delete doc.donations.key
										doc.donations.length--;
									}	
								}
								if(!_.isEmpty(type))	
									if(!type.funding && type.date && type.donor)
										type.funding=1;
								
											

							});	
					
			  }
			}  // cleanDonations
			  			  



			  
			  
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
//console.log('validating',oDocument );	
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
