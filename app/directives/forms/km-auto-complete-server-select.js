/* Todo - change font to match other km controls, ad caption/label, truncate name/title, account for name/title properties in some entries, allow whole obejects

*/
define(['app', 'text!./km-auto-complete-server-select.html','angular','jquery','lodash'],
 function(app,   template) { 'use strict';

	app.directive('kmAutoCompleteServerSelect', ['$rootScope','$http','$log','$q','$filter', function ($rootScope,$http,$log,$q,$filter)
	{
		return {
			
			template: template,
			replace: true,
			transclude: false,

			 scope: {
				// isolate binding to the parent/model/controler with =
				binding      : '=?ngModel',
				//ngDisabledFn : '&ngDisabled',
				//isDisabled   : '=?',

				placeholder  : '@',
				itemsFn :'&items',

			},
			
			link:  function ($scope, $element, $attrs)	
			{
				$scope.attr       = $attrs;
				$scope.multiple   = $attrs.multiple   !== undefined && $attrs.multiple   !== null;
				$scope.cachable   = $attrs.cache   !== undefined && $attrs.cache   !== null; // turn on for small lists
				
				$scope.kmType   = $attrs.kmType; // return km type formated object- only looks for etrm now
				
			},//kmAutoCompleteServerSelect:link

			controller: function ($scope, $q)
			{
					
				$scope.prevSearchText = ""; // stores prev text for comparison
				$scope.prevSelectedItemsLength = 0; // stores prev  for comparison
				$scope.cache =null;				// to turn on non 
				$scope.selectedItems = [];
				//
			//==================================
			// loads up from model after an edit view
			//==================================			
			
			$scope.$watch("binding", function (tab){	
//console.log('binding in watch ',tab)	
//console.log('$scope.selectedItems in binding  ',$scope.selectedItems)	;	
			
					if((_.isEmpty($scope.selectedItems)  && $scope.binding)  ){
//console.log('---------------------- ',$scope.selectedItems)	;
						if(!_.isArray($scope.binding)) { // clean non arrays
							var tArray =[];
							tArray.push($scope.binding);
							$scope.binding=tArray;
						}	
						if(_.isArray($scope.binding) && ((_.contains(_.pluck($scope.binding,'identifier'),undefined)) || $scope.binding==undefined) ) return ; //erronus data
							
//console.log('---------------------- $scope.selectedItems',$scope.selectedItems)	;
//console.log('---------------------- $scope.binding',$scope.binding)	;					
						if(( ((_.contains(_.pluck($scope.binding,'title'),undefined) && _.contains(_.pluck($scope.binding,'name'),undefined)))) ){

							loadSelectedIdentifiers  ($scope.binding);
							return;
						}   //match id's to objects
	//console.log('---------------------- $scope.selectedItems1',$scope.selectedItems)	;
//console.log('---------------------- $scope.binding1',$scope.binding)	;						
						
						if(!_.isEmpty($scope.binding)){
							
							
						
							if(!_.isArray($scope.binding)){
	//console.log('---------------------- $scope.selectedItems2',$scope.selectedItems)	;
//console.log('---------------------- $scope.binding2',$scope.binding)	;	
								if(!$scope.binding.hasOwnProperty('title'))return;
							
								$scope.selectedItems=[];
								$scope.selectedItems.push(JSON.parse(JSON.stringify($scope.binding)));
								$scope.placeholder=$scope.selectedItems[0].title;
								$scope.searchText='__'+$scope.selectedItems[0].title;
								$scope.selectedItems[0].selected=1;
							} else{
//	console.log('---------------------- $scope.selectedItems3',$scope.selectedItems)	;
//console.log('---------------------- $scope.binding3',$scope.binding)	;									
								
								$scope.selectedItems = JSON.parse(JSON.stringify($scope.binding));
								
								if($scope.selectedItems.length==1 && !$scope.multiple){
									$scope.placeholder=$scope.selectedItems[0].title;
									$scope.searchText='__'+$scope.selectedItems[0].title;
								}else 
									placeholderUpdate(); 
										
								_.each($scope.selectedItems,function (item){
										item.selected=1;
								})	
								//else						
							} //else

						} else return;
					}//if((_.isEmpty($scope.selectedItems)  && $scope.binding)  ){
else return;
			});//$scope.$watch("binding", 

						/******************************************************
						* load selected items based on ID only
						*********************************************************/
						function  loadSelectedIdentifiers  (selecteditems) {
									var tempData =[];
	//console.log('selecteditems in loadSelectedIdentifiers ',selecteditems);								
									if(!_.isArray(selecteditems)) return;
									// if(!_.isArray(selecteditems) && selecteditems){
										 
									// 		selecteditems=new Array(selecteditems);	
									// }else if (!selecteditems) return;
								
									if(!$scope.cache){ // should always be empty when loading screen form db or blank
//console.log('binding2 loadSelectedIdentifiers ',$scope.binding);
										_.each(selecteditems,function (searchItem){ 
													$scope.itemsFn({query:searchItem.identifier}).then(function (data) {
	//console.log('data loadSelectedIdentifiers ',data);															
																data=processData(data);
																//$scope.cache=data;
																$scope.selectedItems=[];
																_.each(selecteditems, function (item, key){
																	_.each(data, function (dataItem, key2){
			
					
																			if(item.identifier === dataItem.identifier ){
																					dataItem.selected=1;
																					if(!_.isArray($scope.selectedItems)) $scope.selectedItems=[];
																					$scope.selectedItems.push(dataItem);
																					
																			}
																	})//_.each(selecteditems
																})//_.each(selecteditems
//console.log('$scope.selectedItems',$scope.selectedItems);	
																if(!$scope.selectedItems || $scope.selectedItems.length==0) return;
																
																if($scope.selectedItems.length==1 && !$scope.multiple) {
																	if($scope.selectedItems[0].title)
																		$scope.searchText='__'+$scope.selectedItems[0].title;
																	else
																		$scope.searchText='__'+$scope.selectedItems[0].name;
																}else  
																	placeholderUpdate(); 
																	
																updateModel(true);	
																//$scope.selectedItems=null;
	//console.log('$scope.selectedItems after model update',$scope.selectedItems);													
																return;
													});
											}); 
													
											//deleteSelectedItemsFromQuerry(tempData,$scope.selectedItems);
											return ;//makePromise(adSelectedItemsToQuery(tempData));	
									}
							
						} //quer				
						/******************************************************
						* Query tot he api
						*********************************************************/
						$scope.querySearch = function (query) {
									var tempData = '';
									if(isEmptyQuery(query)) return emptyPromise(); // empty or duplicate
									
									if($scope.cache && $scope.cachable){
	
											tempData=filterBySearchText($scope.cache,query);
											deleteSelectedItemsFromQuerry(tempData,$scope.selectedItems);
											return makePromise(adSelectedItemsToQuery(tempData));	
									}else
										return $scope.itemsFn({query:$scope.searchText}).then(function (data) {
													
													data=processData(data);
													$scope.cache=data;
													deleteSelectedItemsFromQuerry(data,$scope.selectedItems);
													data=adSelectedItemsToQuery(data);
													if($scope.searchText.substring(0, 2)=='__'){
														 data=[];	
														// $scope.searchText=$scope.searchText.substring(2);
													}														
													return 	data;
										}); 									
						} //query
				
						//============================================================
						// filter result by query on title
						//============================================================
						function filterBySearchText(data,query) {					
									return $filter('filter')(data, query,false);
						};// getEventTypes	
						
						//============================================================
						// updateModel
						//============================================================
						function updateModel(fromBinding) {	
							var selectedItemsClone = JSON.parse(JSON.stringify($scope.selectedItems));
//console.log('$scope.selectedItemsin update dodel' ,$scope.selectedItems );	
									if(!$scope.selectedItems)return;
									if (_.isEmpty($scope.selectedItems) && fromBinding){
											$scope.binding=[]; 
											$scope.searchText='';
											return;}
									else if(_.isEmpty($scope.selectedItems) && !$scope.multiple){ 
										var tempBinding = JSON.parse(JSON.stringify($scope.binding));
										delete tempBinding .selected;
//console.log('tempBinding  update dodel' ,tempBinding  );	
										$scope.selectedItems =tempBinding[0];//{identifier:tempBinding[0].identifier} ;
										$scope.binding=$scope.binding[0];
										return;
										
									}
									
									

																	
									switch($scope.kmType) {
										case 'ETerm':
											_.each(selectedItemsClone, function (item) {
													delete item.selected;
											})//_.forEach
											break;
											
	
										default:									
											_.each(selectedItemsClone, function (item) {
													delete item.selected;
													delete item.title;
											})//angular.forEach
											break;
	
									}// switch
									
											if($scope.multiple)		
												$scope.binding = selectedItemsClone; //$scope.selectedItems;
											else 
												$scope.binding = selectedItemsClone[0];
											//break;
	//console.log('model update binding', $scope.binding);
						};// getEventTypes	
						
															
						//============================================================
						// preps and orders data for
						//============================================================									

						function isObject(val) {
							if (val === null) { return false;}
							return ( (typeof val === 'function') || (typeof val === 'object') );
						}									
									
								
										

		
		
						//============================================================
						// preps and orders data for list inclusion
						//============================================================
						function processData(data) {
									if(data.data)
									data=data.data;
									var records = [];
										_.each(data, function (item) {
												if(item.name)item.name=item.name.substring(0,170);
												if(item.title_s) item.title_s=item.title_s.substring(0,170);
												if(isObject(item.title)) item.title = item.title['en'];
												
												records.push({ identifier: item.id || item.identifier || item.identifier_s, title:   item.title || item.name || item.title_s || item.name_s});
										});	
//console.log(records);		
									return $filter('orderBy')(records, 'title'); 
						};// getEventTypes					
				
				
						/*****************************************************************
						* returns promise
						*******************************************************************/							
						function makePromise(data){
							var defer = $q.defer();		
							defer.resolve(data);
							return defer.promise;		
						} // 				
				
				
				
						/*****************************************************************
						* filters null and empty searches and stores prev search to prevent duplicate searches
						*******************************************************************/							
						function isEmptyQuery(query){
							
								if(( query === null || query === 'null'  || query === $scope.prevSearchText) ) {
									return true;
								}
								else
								{
									$scope.prevSearchText = query;
									return false
								}
						}//isEmptyQuery	
						
						
							
						/*****************************************************************
						* returns empty promise as parent directive wants one on 0 result query
						*******************************************************************/							
						function emptyPromise(){
							
							var defer = $q.defer();		
							defer.resolve('')
							return defer;
									
						} // emptyPromise
		
		
														
							/*****************************************************************
							* puts selected items and new query into display list
							*******************************************************************/							
							function adSelectedItemsToQuery(queryData){
											var selectedItemsHolder= [];
											if(_.isArray($scope.selectedItems)){
											 selectedItemsHolder = $scope.selectedItems.slice(0); // makes clone
											selectedItemsHolder=selectedItemsHolder.concat(queryData);
											}
											return selectedItemsHolder;		
							
							} // adSelectedItemsToQuery
								

							
							/*****************************************************************
							* changes placeholder to read the amount of selected items
							*******************************************************************/							
							function placeholderUpdate(){
									
									if($scope.selectedItems.length > 0)
										$scope.placeholder= $scope.selectedItems.length + " selected, type to search for more records";
									else
										$scope.placeholder="0 selected, type to search for more records";
										
							}//placeholderUpdate
							
							/*****************************************************************
							* when search string changes do this
							*******************************************************************/						
							$scope.searchTextChange = function (text) {
								    $scope.searchT=text;
									if(!$scope.multiple && _.isArray($scope.selectedItems)){
										_.each($scope.selectedItems, function (item) {
											if(text !== item.title){
												item.selected=0;
												$scope.selectedItems=[];
												updateModel();
											}
										});
										
									}
										
							} //searchTextChange(text)
							

												
							/*****************************************************************
							* when the selected item changes do this
							*******************************************************************/						
							$scope.selectedItemChange = function (item,$event) {
									//item=JSON.parse(JSON.stringify(item));
								    if(!inArray($scope.selectedItems,item) && $scope.multiple ){

										$scope.prevSelectedItemsLength=$scope.selectedItems.length;
										item.selected=1;  // makes visible in UI
										$scope.selectedItems.push(item); 
										placeholderUpdate(); // shows users how many selected
										$scope.searchText = "";
										updateModel();
										$event.stopPropagation();
									} else if (!$scope.multiple){

										item.selected=1;
										$scope.selectedItems.push(item); 
										//$scope.singleSelectedItem=item;
										//placeholderUpdate(); // shows users how many selected
										$scope.searchText = item.title;
										
										$event.stopPropagation();
										updateModel();
									 }
									 else if (inArray($scope.selectedItems,item)){
										item.selected=0;
										$scope.deleteSelectedItem (item);
										$scope.selectedItems = $scope.selectedItems.filter(function(e){return e}); // removes nulls if any exist but shoul dnot anymore
										placeholderUpdate(); 
										$scope.searchText = "";
										
								
										$event.stopPropagation();
										updateModel();
									}
									
							} //selectedItemChange

							/*****************************************************************
							* is an item already in the array
							*******************************************************************/
							function inArray(array,item) {
								var present = false;
								_.each(array, function (testItem) {
												if(item.identifier===testItem.identifier){
													present = 1;
												}//function
								})//angular.forEach
								return present;
							}//inArray
							
							/*****************************************************************
							* search and delete item from array
							*******************************************************************/
							$scope.deleteSelectedItem = function(selectedItem) {
								selectedItem.selected=false;
								var item = _.where($scope.selectedItems, {'identifier':selectedItem.identifier});
								if(item && item.length>0){

									if($scope.selectedItems.length===1)
										$scope.selectedItems=[];
									else
										$scope.selectedItems.splice(_.indexOf($scope.selectedItems,selectedItem),1);
									placeholderUpdate(); 		
								}

								updateModel();
							}//deleteSelectedItem 
							
							/*****************************************************************
							* delete all selected items from array to remove duplicates
							*******************************************************************/
							function deleteSelectedItemsFromQuerry(array,itemArray) {
								
								if(_.isArray(array) && _.isArray(itemArray))
									if(array.length > 0 && itemArray.length > 0){								
										angular.forEach(itemArray, function (selectedItem) {
											angular.forEach(array, function (queryItem,key) {
														if(selectedItem.identifier && queryItem.identifier)
														if(selectedItem.identifier===queryItem.identifier)
															delete array.splice(key,1);;
											})//angular.forEach
										})//angular.forEach
										updateModel();
									}
							}//deleteSelectedItemsFromQuerry							
							
							

			
			}//kmAutoCompleteServerSelect:controller
		} // return
	}]);//kmAutoCompleteServerSelect

}); // define function
