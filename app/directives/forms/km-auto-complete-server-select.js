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
					if((_.isEmpty($scope.selectedItems)  && $scope.binding)  ){
						if((_.isArray($scope.binding) && ((_.contains(_.pluck($scope.binding,'title'),undefined) && _.contains(_.pluck($scope.binding,'name'),undefined))
							|| _.contains(_.pluck($scope.binding,'identifier'),undefined)
							)) || $scope.binding==undefined)return;  // filter corruptly formatted items. make them try again
						
						if(!_.isEmpty($scope.binding)){
						
							if(!_.isArray($scope.binding)){
								if(!$scope.binding.hasOwnProperty('title'))return;
							
								$scope.selectedItems=[];
								$scope.selectedItems.push(JSON.parse(JSON.stringify($scope.binding)));
								$scope.placeholder=$scope.selectedItems[0].title;
								$scope.searchText=$scope.selectedItems[0].title;
								$scope.selectedItems[0].selected=1;
							} else{
								$scope.selectedItems = JSON.parse(JSON.stringify($scope.binding));
								
								if($scope.selectedItems.length==1){
									$scope.placeholder=$scope.selectedItems[0].title;
									$scope.searchText=$scope.selectedItems[0].title;
								}else 
									placeholderUpdate(); 
										
								_.each($scope.selectedItems,function (item){
										item.selected=1;
								})	
								//else						
							} //else

						}

						 
						
					}

			});//$scope.$watch("binding", 
				
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
													return adSelectedItemsToQuery(data);	
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
						function updateModel() {	
									var selectedItemsClone = JSON.parse(JSON.stringify($scope.selectedItems));
									
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
								
											var selectedItemsHolder = $scope.selectedItems.slice(0); // makes clone
											selectedItemsHolder=selectedItemsHolder.concat(queryData);
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
									if(!$scope.multiple && $scope.selectedItems.length){
										angular.forEach($scope.selectedItems, function (item) {
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

									$scope.selectedItems.splice(_.indexOf($scope.selectedItems,selectedItem),1);
									placeholderUpdate(); 		
								}
								updateModel();
							}//deleteSelectedItem 
							
							/*****************************************************************
							* delete all selected items from array to remove duplicates
							*******************************************************************/
							function deleteSelectedItemsFromQuerry(array,itemArray) {
								if(array.length > 0 && itemArray.length > 0)								
								angular.forEach(itemArray, function (selectedItem) {
									angular.forEach(array, function (queryItem,key) {
												if(selectedItem.identifier && queryItem.identifier)
												if(selectedItem.identifier===queryItem.identifier)
													delete array.splice(key,1);;
									})//angular.forEach
								})//angular.forEach
								updateModel();
							}//deleteSelectedItemsFromQuerry							
							
							

			
			}//kmAutoCompleteServerSelect:controller
		} // return
	}]);//kmAutoCompleteServerSelect

}); // define function
