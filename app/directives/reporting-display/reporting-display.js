define(['text!./reporting-display.html',
      'app',
      'jquery',
      'lodash',
      './ammap3',
      './eumap',
      "utilities/km-utilities",
      "./results-list",
      "./filter-assessment",
      "./filter-report",
      "./filter-nbsap",
      "./filter-all",
      "./filter-indicator",
      "./filter-target",
      "./filter-resource-mobilisation",
    ], function(template, app, $, _) {
      'use strict';

	app.directive('reportingDisplay', ['$http', 'realm', '$q', '$timeout', '$location','$filter', function ($http, realm, $q, $timeout, $location,$filter) {
	    return {
	        restrict: 'E',
	        template: template,
	        replace: true,
	        scope: {},
        	require : 'reportingDisplay',
			link : function($scope, $element, $attr,reportingDisplay) {  // jshint ignore:line



	            $scope.loaded          = false;

	            $scope.zoomToMap   		 = [];
              $scope.showCountry     ='';
							$scope.subQueries = {};
              $scope.queriesStrings={};

							$http.get("/api/v2013/thesaurus/domains/countries/terms",{ cache: true }).then(function (o) {
											$scope.countries=$filter('orderBy')(o.data, 'title|lstring');
								 			return ;
							 });


									$element.find("#customHome").on('click',function(event){
							       $scope.$broadcast('customHome', 'show');
							    });
$scope.urlStrings = {
    'all': {
      'schema_s': [
        'nationalReport',
        'nationalAssessment',
        'resourceMobilisation',
        'nationalIndicator',
        'nationalTarget'
      ],
    '_latest_s':['true'],
    '_state_s':['public']
    }

};
              reportingDisplay.search();
             //=======================================================================
					   //
						 //=======================================================================
				     $scope.readFacets2 = function (solrArray) {

					        var facets = [];
										if(solrArray)
												for (var i = 0; i < solrArray.length; i += 2) {
														var facet = solrArray[i];
														facets.push({ symbol: facet, title: facet, count: solrArray[i + 1] });
												}
					          return facets;
				      };//$scope.readFacets2
							//======================================================================
						  //
							//======================================================================
							$scope.icon = function (schema) {

		              return iconMap[schema];
		          };//$scope.icon

							//======================================================================
						  //
							//======================================================================
							$scope.actionSetPage = function (pageNumber) {

			            $scope.currentPage = Math.min($scope.pageCount-1, Math.max(0, pageNumber));
									searchCtrl.search();
									$location.replace();
									$location.search("currentPage", $scope.currentPage);
			        };//$scope.actionSetPage

						  //=======================================================================
						  //
							//=======================================================================
			        $scope.fixUrl = function (url) {

		                if(url){
									     if(url.indexOf( "http://chm.cbd.int/")===0)
											 		url = url.substr("http://chm.cbd.int" .length); // jshint ignore:line
				               else if(url.indexOf("https://chm.cbd.int/")===0)
											 		url = url.substr("https://chm.cbd.int".length); // jshint ignore:line
										}
		                return url;
			         };//$scope.fixUrl

							 //============================================================
					 		// s
					 		//
					 		//============================================================
					 		function getCountries(query) {


					 					return $http.get('/api/v2013/thesaurus/domains/countries/terms', { cache: true }).then(function(data) {
					 							return data;
					 					});// return

					 		};// getCountries

								//=======================================================================
								//
								//=======================================================================
								$scope.buildQuery = function()
								{
										// NOT version_s:* remove non-public records from resultset
										var q = 'NOT version_s:* AND realm_ss:' + realm.toLowerCase() ;//+ ' AND schema_s:* '
                    var filters = ['all','rm','nt','ni','aa','ap','nr'];
//console.log('getFormatedSubQuery("nationalTarget_s")',getFormatedSubQuery('nationalTarget_s'));
                    var subQueries =[];
                    _.each(filters,function(filter){
//console.log('getFormatedSubQuery(filter,schema_s) ',getFormatedSubQuery(filter,'schema_s'));
                      subQueries.push(getFormatedSubQuery(filter,'schema_s'));
                      subQueries.push(getFormatedSubQuery(filter,'reportType_s'));
                      subQueries.push(getFormatedSubQuery(filter,'_latest_s'));
                      subQueries.push(getFormatedSubQuery(filter,'_state_s'));
                    });
                    // subQueries.concat(_.compact([
                    //                 getFormatedSubQuery(filter,'schema_s'),
                    //                 getFormatedSubQuery(filter,'reportType_s'),
                    //                 getFormatedSubQuery(filter,'_latest_s'),
                    //                 getFormatedSubQuery(filter,'_state_s'),
                    // ]));
subQueries=_.compact(subQueries);


                                                // getFormatedSubQuery('nationalTarget'),
																							  // getFormatedSubQuery('nbsaps'),
																							  // getFormatedSubQuery('all'),
																							  // getFormatedSubQuery('nationalReport'),
																								// getFormatedSubQuery('nationalAssessment'),
																							  // getFormatedSubQuery('nationalIndicator'),
																							  // getFormatedSubQuery('resourceMobilisation')


										if(subQueries.length)
											q += " AND " + subQueries.join(" AND ");
										return q;
								};//$scope.buildQuery





								//=======================================================================
								//
								//=======================================================================
								function getFormatedSubQuery (filter,name) {

										var subQ='';
                    if($scope.subQueries[filter])
										if($scope.subQueries[filter][name] && _.isArray($scope.subQueries[filter][name]) && $scope.subQueries[filter][name].length){
												// if(name==='all' && $scope.subQueries[name][0])
												// {
												// 			subQ +=  $scope.subQueries[name][0] ;
												// }


										  	// else 	if(name==='nationalReport' && $scope.subQueries[name][0])
												// {
												// 			subQ +=  $scope.subQueries[name][0] ;
												// }else 	if(name==='nbsaps' && $scope.subQueries[name][0])
												// {
												// 			subQ +=  $scope.subQueries[name][0] ;
												// }
												// else 	if(name==='all' && $scope.subQueries[name][0])
												// {
												// 			subQ +=  $scope.subQueries[name][0] ;
                        //
												// }
												// else 	if(name==='nationalIndicator' && $scope.subQueries[name][0])
												// {
												// 			subQ +=  $scope.subQueries[name][0] ;
                        //
												// }
												// else 	if(name==='nationalTarget' && $scope.subQueries[name][0])
												// {
												// 			subQ +=  $scope.subQueries[name][0] ;
                        //
												// }
                        // else 	if(name==='resourceMobilisation' && $scope.subQueries[name][0])
                        // {
                        //       subQ +=  $scope.subQueries[name][0] ;
                        //
                        // }
											//	else
													subQ +=  name+':'+$scope.subQueries[filter][name].join(" OR "+name+":");
	// console.log('subQ',subQ);
												subQ = '('+subQ+')';
										}
console.log('subQueries ',$scope.subQueries);
										return subQ;
								}//function getFormatedSubQuery (name)

	    }, //link

			//=======================================================================
			//
			//=======================================================================
			controller : ["$scope", function($scope) {
					var queryScheduled  = null;
					var canceler 				= null;

				//=======================================================================
				//
				//=======================================================================
				function query($scope) {
						readQueryString ();

						var queryParameters = {
								'q': $scope.buildQuery(),
								'sort': 'createdDate_dt desc, title_t asc',
								'fl': 'reportType_s,documentID,identifier_s,id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t,_latest_s,nationalTarget_EN_t,progress_EN_t,year_i,text_EN_txt,nationalTarget_EN_t,government_s',
								'wt': 'json',
								'start': 0,
								 'rows': 1000000,
						};

						if (canceler) {
								canceler.resolve(true);
						}

						canceler = $q.defer();
          //  $location.path().replace();
            updateQueryString();

						$http.get('/api/v2013/index/select', { params: queryParameters, timeout: canceler.promise, cache:true}).success(function (data) {
								canceler = null;
								$scope.count = data.response.numFound;
								$scope.count=data.response.docs.length;
								$scope.documents = groupByCountry(data.response.docs);

						});
				}// query


				//=======================================================================
				//
				//=======================================================================
				function groupByCountry (list) {
							var docsByCountry ={};
							$scope.euData = {};
							_.each(list,function(doc){
										if(!docsByCountry[doc.government_s]) // if country object not created created
										{
												docsByCountry[doc.government_s]=[];
												docsByCountry[doc.government_s]=getCountryById(doc.government_s); //insert country data
												docsByCountry[doc.government_s].docs={}; // initializes the countries docs
										}

										if(!docsByCountry[doc.government_s].docs[doc.schema_s]) //order docs by schema
											docsByCountry[doc.government_s].docs[doc.schema_s]=[];

										if(doc.reportType_s && doc.reportType_s=='B0EBAE91-9581-4BB2-9C02-52FCF9D82721'){
												if(!docsByCountry[doc.government_s].docs['nbsaps'])
														docsByCountry[doc.government_s].docs['nbsaps']=[];
												docsByCountry[doc.government_s].docs['nbsaps'].push(doc);
										}else
												docsByCountry[doc.government_s].docs[doc.schema_s].push(doc); // insert doc

									  docsByCountry[doc.government_s].expanded=false;
										docsByCountry[doc.government_s].hidden=false;

										if(docsByCountry[doc.government_s].docs[doc.schema_s].length > 1 && doc.schema_s==='nationalAssessment')
												docsByCountry[doc.government_s].docs[doc.schema_s].sort(
													function(a,b){
														if(b.date_dt && a.date_dt )return new Date(b.date_dt) - new Date(a.date_dt);
												}); // sort by date

										if(docsByCountry[doc.government_s].docs[doc.schema_s].length > 1 && doc.schema_s==='nationalAssessment')
												docsByCountry[doc.government_s].docs[doc.schema_s].sort(function(a,b){
													if(b.progress_EN_t && a.progress_EN_t)
														return progressToNum(b.progress_EN_t) - progressToNum(a.progress_EN_t);
												}); // sort sort by progress
										docsByCountry[doc.government_s].isEUR=false;
							});

							if(docsByCountry.eur)
								docsByCountry.eur.isEUR=true;

							setNumDocumentsInCountry();
							return docsByCountry;
				}//readQueryString

				//=======================================================================
				//
				//=======================================================================
				function getCountryById(id) {

					var index = _.findIndex($scope.countries, function(country) {
								 return country.identifier.toUpperCase() === id.toUpperCase();
					 });
					 return $scope.countries[index];
				}//getCountryById

				//=======================================================================
				//
				//=======================================================================
				function setNumDocumentsInCountry() {
						var totalDocs=0;
					_.each($scope.countries, function(country) {
							_.each(country.docs , function(schema) {
									totalDocs += schema.length;
							});
							country.numDocs=totalDocs;
							totalDocs=0;
					 });
				}//setNumDocumentsInCountry()


				//=======================================================================
				//
				//=======================================================================
				function progressToNum(progress) {

						switch(progress.trim())
						{
							 	case "On track to exceed target":
										return 5;
								case "On track to achieve target":
								  	return 4;
								case "Progress towards target but at an  insufficient rate":
										return 3;
								case "No significant change":
										return 2;
								case "Moving away from target":
										return 1;
						}

				}//readQueryString

				//=======================================================================
				//
				//=======================================================================
				function readQueryString () {

						var filter = _([$location.search().schema_s]).flatten().compact().value(); // takes query string into array
$scope.subQueries[filter]=_.cloneDeep($scope.queriesStrings[filter]);
  					// var qsReportType_s = _([$location.search().reportType_s]).flatten().compact().value(); // takes query string into array
            // var qs_latest_s= _([$location.search()._latest_s]).flatten().compact().value();
            // var qs_state_s = _([$location.search()._state_s]).flatten().compact().value();

					//	var qsArrByField = {'schema_s':qsSchema,'reportType_s':qsReportType_s,'_state_s':qs_state_s,'_latest_s':qs_latest_s};

						// _.each(qsArrByField,function (idArr,schemaKey){
						// 		_.each(idArr,function(id){
						// 				addSubQuery(schemaKey,id);
						// 		});//_.each
						// });//_.each
				}//readQueryString

				//=======================================================================
				//
				//=======================================================================
				function updateQueryString () {




//$location.search({});
console.log('111111$location.search',$location.absUrl());
console.log('11111111$scope.subQueries',$scope.subQueries);
console.log('---------------------------------');
	_.each($scope.subQueries,function(filter,filterName){
          	_.each(filter,function(itemIdArr,schemaKey){

                          $location.replace();
													$location.search('filter',filterName);
                          $scope.queriesStrings[filterName]=_.cloneDeep($scope.subQueries[filterName]);

						}); 	});
console.log('---------------------------------');
console.log('222222after -$location.search',$location.absUrl());
//deleteAllSubQuery();
console.log('2222222$scope.subQueries',$scope.subQueries);
				}//updateQueryString

				//=======================================================================
				//
				//=======================================================================
				function search () {

						if(queryScheduled)
								$timeout.cancel($scope.queryScheduled);
						queryScheduled = $timeout(function () {  query($scope); }, 100);
				}//search

				//=======================================================================
				//
				//=======================================================================
				function addSubQuery (filter,name, query,singleTon) {
						$scope.selectedSchema=name;
//console.log(' query', query);
						//if(!$scope.subQueries) // if called from controler without link ex4ecuting first
            if(!$scope.subQueries[filter]) // initialize
							$scope.subQueries[filter]={};
						if(!_.isArray($scope.subQueries[filter][name])) // initialize
							$scope.subQueries[filter][name]=[];
						if(singleTon){  // allows for only one of that type ie date or keyword
								$scope.subQueries[filter][name]=[];
								$scope.subQueries[filter][name].push(query);
						}
						else if($scope.subQueries[filter][name].indexOf(query)<0) // if not already there add
									$scope.subQueries[filter][name].push(query);


				}//addSubQuery

				//=======================================================================
				//
				//=======================================================================
				function deleteSubQuery(name, scope) {
						var item=null;

						if(scope.item === undefined)
							item = scope;
						else{
							item = scope.item;
							item.selected = !item.selected;
						}
						var i = $scope.subQueries[name].indexOf(item.identifier);
						if(i !==-1)
							$scope.subQueries[name].splice(i,1);
				}//deleteSubQuery

				//=======================================================================
				//
				//=======================================================================
				function deleteAllSubQuery(name) {

							$scope.subQueries=[];
				}//deleteSubQuery

				//=======================================================================
				//
				//@ data - raw country data taken from api call
				//@ terms -
				//@ qsSelection -
				//=======================================================================
				function updateTerms(terms,items,facet,data,debug) {

						var qsSelection = _([$location.search()[facet]]).flatten().compact().value(); // takes query string into array
						var termsx = {};

						if(!data)data=terms;
						terms =  _.map(data, function(t) {
									if(qsSelection && !_.isEmpty(qsSelection))
											t.selected = qsSelection.indexOf(t.identifier)>=0; // adds query string frmo url into query

									termsx[t.identifier] = t;
									return t;
						});//_.map

				//		if(debug){
								// console.log('terms',terms);
								// console.log('items',items);
								// console.log('facet',facet);
								// console.log('data',data);
			//			}
						insertCounts(items,termsx,debug);
						return termsx;
				}//updateTerms

				//=======================================================================
				// initiates all counts to 0 and then insert facit counts based on country
				//
				//=======================================================================
				function insertCounts(items,termsx,debug) {
						if(termsx)
								_.each(termsx,function (item) {
										item.count = 0;
								});//  _.each
						if(items)
								items.forEach(function (item) {
										if(_.has(termsx, item.symbol))
												termsx[item.symbol].count = item.count;
								});//items.forEach

								// if(debug){
								// 		console.log('termsx',termsx);
								// 		console.log('items',items);
								// }

				}//insertCounts

				//=======================================================================
				//
				//=======================================================================
				function buildChildQuery (terms,items,facet,data) {

						if(!_.isEmpty(terms) )
								_.each(terms,function (item) {
										if(item.selected)
												addSubQuery(facet,item.identifier);
						});

						search();
						updateTerms(terms,items,facet,data);
				}//buildQuery

				//=======================================================================
				//
				//=======================================================================
				function refresh (item,forceDelete,terms,items,facet,data) {
						if(item.selected  && !forceDelete)
								buildChildQuery(terms,items,facet,data);
						else{
								deleteSubQuery(facet,item);
								buildChildQuery(terms,items,facet,data);
						}
				}//buildQuery

				//=======================================================================
				//
				//=======================================================================
				function zoomToCountry(id) {
							$scope.zoomToMap=[];
							$scope.zoomToMap.push(id);
				}//buildQuery


				//=======================================================================
				//
				//=======================================================================
				function showCountryResultList(id){
							$scope.showCountry=id;
				}//showCountryResultList



				this.showCountryResultList=showCountryResultList;
				this.zoomToCountry=zoomToCountry;
				this.deleteAllSubQuery=deleteAllSubQuery;
				this.refresh =refresh;
				this.buildChildQuery =buildChildQuery;
				this.updateTerms =updateTerms;
				this.deleteSubQuery =deleteSubQuery;
				this.search = search;
				this.addSubQuery= addSubQuery;
			}]//controlerr
		};//return
	}]); //directive

	//============================================================
	//
	//
	//============================================================
	app.directive('bindIndeterminate', [function () {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            scope.$watch(attrs.bindIndeterminate, function (value) {
	                element[0].indeterminate = value;
	            });
	        }
	    };
	}]); //directive

	//============================================================
	//
	//
	//============================================================
	app.directive('toggle', [function () {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            if(attrs.toggle=='tooltip')
	                element.tooltip();
	        }
	    };
	}]); //directive
});//define
