/* Todo - change font to match other km controls, ad caption/label, truncate name/title, account for name/title properties in some entries

*/
define(['app', 'text!./km-auto-complete-server-select.html','angular','jquery'],
 function(app,   template) { 'use strict';

	app.directive('kmAutoCompleteServerSelect', ['$rootScope','$http','$log', function ($rootScope,$http,$log)
	{
		return {
			
			template: template,
			replace: true,
			transclude: false,

			scope: {
				// isolate binding to the parent/model/controler with =
				binding      : '=?ngModel',
				ngDisabledFn : '&ngDisabled',
				isDisabled   : '=?',
				querySearch  : '&',
				selectedItemChange: '&',
				searchTextChange:'&',
				//searchText: '=',
				//selectedItem: '='
			},
			
			link:  function ($scope, $element, $attrs)	
			{
				$scope.attr       = $attrs;
				$scope.multiple   = $attrs.multiple   !== undefined && $attrs.multiple   !== null;
				$scope.watchItems = $attrs.watchItems !== undefined && $attrs.watchItems !== null;
				$scope.list       = $scope.multiple && !($attrs.list==="false");
				$scope.selectedItems = [];
				$scope.prevSearchText = ""; // stores prev text for comparison
				$scope.prevSelectedItemsLength = 0; // stores prev  for comparison
				// captures and set placeholder
				if($scope.attr.placeholder){
					$scope.placeholder = $scope.attr.placeholder;
				}			
			},//kmAutoCompleteServerSelect:link

			controller: function ($scope, $q)
			{
					
						    /******************************************************
							* Query tot he api
							*********************************************************/
							
							
							$scope.querySearch = function (query) {
										//filter 
										if((query=='' || query === null || query === 'null'  || query === $scope.prevSearchText) && $scope.prevSelectedItemsLength != $scope.selectedItems.length) {
											return emptyPromise();
										}
										$scope.prevSearchText = query;
										var  queryParameters = {
														'q': 'title_t:*' + query + '*',
														'fl': 'title_t,id, identifier_s',
														'wt': 'json',
														'start': 0,
														'rows': 5,
														//'cb': new Date().getTime()
										};
										

										//return defer;
										return $q.when($http.get('https://api.cbd.int/api/v2013/index/select', { params: queryParameters }))
											.then(function (data) {

												var records = [];
													angular.forEach(data.data.response.docs, function (item) {
														if (!item.id) console.log('item.id', item.id);
														records.push({ id: item.id, title: item.title_t });
						
													});

													deleteSelectedItemsFromQuerry(records,$scope.selectedItems);
													return adSelectedItemsToQuery(records);
												
											});  
										   
							} //query
							
							
							/*****************************************************************
							* puts selected items and new query into display list
							*******************************************************************/							
							function adSelectedItemsToQuery(queryData){

										var selectedItemsHolder = $scope.selectedItems.slice(0); // makes clone
										selectedItemsHolder=selectedItemsHolder.concat(queryData);
										return selectedItemsHolder;		
							} // adSelectedItemsToQuery
								
							/*****************************************************************
							* returns empty promise as parent directive wants one on 0 result query
							*******************************************************************/							
							function emptyPromise(){
								
								var defer = $q.defer();		
								defer.resolve('')
								return defer;
										
							} // emptyPromise
							
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
									$log.info('Text changed to ' + text);
							} //searchTextChange(text)
												
							/*****************************************************************
							* when the selected item changes do this
							*******************************************************************/						
							$scope.selectedItemChange = function (item,$event) {
								    if(!inArray($scope.selectedItems,item)){
										$scope.prevSelectedItemsLength=$scope.selectedItems.length;
										item.selected=1;  // makes visible in UI
										$scope.selectedItems.push(item); 
										placeholderUpdate(); // shows users how many selected
										$scope.searchText = "";
										$event.stopPropagation();
									}else{
										$scope.deleteSelectedItem (item);
										$scope.selectedItems = $scope.selectedItems.filter(function(e){return e}); // removes nulls if any exist but shoul dnot anymore
										placeholderUpdate(); 
										$scope.searchText = "";
										$event.stopPropagation();
									}
							} //selectedItemChange

							/*****************************************************************
							* is an item already in the array
							*******************************************************************/
							function inArray(array,item) {
								var present = false;
								angular.forEach(array, function (testItem) {
												if(item.id===testItem.id){
													present = 1;
												}//function
								})//angular.forEach
								return present;
							}//inArray
							
							/*****************************************************************
							* search and delete item from array
							*******************************************************************/
							$scope.deleteSelectedItem = function(item) {
								item.selected=false;
								angular.forEach($scope.selectedItems, function (itemI,key) {
									
												if(item.id===itemI.id){
													 $scope.selectedItems.splice(key,1);
												}
										placeholderUpdate(); 		
								})//angular.forEach
							}//inArray
							
							/*****************************************************************
							* delete all selected items from array to remove duplicates
							*******************************************************************/
							function deleteSelectedItemsFromQuerry(array,itemArray) {
								angular.forEach(itemArray, function (selectedItem) {
									angular.forEach(array, function (queryItem,key) {
												if(selectedItem.id===queryItem.id)
													delete array.splice(key,1);;
									})//angular.forEach
								})//angular.forEach
							}//inArray							
							
			
			}//kmAutoCompleteServerSelect:controller
		} // return
	}]);//kmAutoCompleteServerSelect

}); // define function
