define(['text!./search.html',
		'app',
		'jquery',
		'lodash',
		"utilities/km-utilities",
		"./search-result",
		"./search-filter-keywords",
		"./search-filter-schemas",
		"./search-filter-countries",
		"./search-filter-regions",
		"./search-filter-aichi",
		"./search-filter-themes",
		"./search-filter-dates",
		"./row-aichi-target",
		"./row-announcement",
		"./row-meeting",
		"./row-notification",
		"./row-press-release",
		"./row-national-assessment",
		"./row-statement"

	], function(template, app, $, _) { 'use strict';

	app.directive('search', ['$http', 'realm', '$q', '$timeout', '$location', function ($http, realm, $q, $timeout, $location) {
	    return {
	        restrict: 'EAC',
	        template: template,
	        replace: true,
	        scope: {},
					require: '^search',
			link : function($scope, $element, $attr, searchCtrl) {  // jshint ignore:line

	            var iconMap = {
	                'focalPoint'            : 'fa fa-user',
	                'notification'          : 'icon-envelope',
	                'pressRelease'          : 'icon-bullhorn',
	                'statement'             : 'icon-microphone',
	                'announcement'          : 'icon-rss',
	                'event'                 : 'icon-calendar',
	                'organization'          : 'icon-building',
	                'resource'              : 'fa fa-book',
	                'aichiTarget'           : 'fa fa-flag',
	                'strategicPlanIndicator': 'icon-signal',
	                'marineEbsa'            : 'icon-map-marker',
	                'meeting'               : 'icon-calendar',
	                'meetingDocument'       : 'fa fa-file-o',
	                'decision'              : 'icon-legal',
	                'recommendation'        : 'icon-legal',
	                'nationalReport'        : 'icon-quote-left',
	                'nationalTarget'        : 'fa fa-flag',
	                'nationalIndicator'     : 'icon-signal',
	                'nationalAssessment'    : 'icon-eye-open',
	                'implementationActivity': 'icon-retweet',
	                'nationalSupportTool'   : 'icon-wrench',
									'resourceMobilisation'  : 'fa fa-university'
	            };

	            $scope.loaded          = false;
	            $scope.itemsPerPage    = 25;
	            $scope.pageCount       = 0;
	            $scope.currentPage     = 0;

							$scope.subQueries = {};
							if($location.search().currentPage >=0)
									$scope.currentPage=$location.search().currentPage;

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

								//=======================================================================
								//
								//=======================================================================
								$scope.buildQuery = function()
								{
										// NOT version_s:* remove non-public records from resultset
										var q = 'NOT version_s:* AND realm_ss:' + realm.toLowerCase() + ' AND schema_s:* ';

										var subQueries = _.compact([getFormatedSubQuery('schema_s'),
																								getFormatedSubQuery('government_s'),
																								getFormatedSubQuery('government_REL_ss'),
																								getFormatedSubQuery('thematicArea_REL_ss'),
																								getFormatedSubQuery('aichiTarget_ss'),
																								getFormatedSubQuery('createdDate_s'),
																								getFormatedSubQuery('keywords')]);

										if(subQueries.length)
											q += " AND " + subQueries.join(" AND ");
										return q;
								};//$scope.buildQuery

								//======================================================================
							  //hides filter if parent search result in no hits for this filter
								//======================================================================
								$scope.isFilterEmpty = function (filter) {

											var total=0;
											if($location.url()==='/database') {return 0;}
										  _.each(filter,function (filterElement){
															if (filterElement.count) total++;
											});
			              	if(total)
												return 0;
											else
												return 1;
			          };//$scope.isFilterEmpty

								//=======================================================================
								//
								//=======================================================================
		            $scope.range = function (start, end) {

		                var ret = [];
		                if (!end) {
		                    end = start;
		                    start = 0;
		                }

		                var maxCount = 10;
		                var middle = 5;
		                var count = end - start;

		                if (count > maxCount) {
		                    if ($scope.currentPage > middle)
		                        start = $scope.currentPage - middle;

		                    end = Math.min(count, start + maxCount);
		                    start = Math.max(0, end - maxCount);
		                }

		                for (var i = start; i < end; i++) {
		                    ret.push(i);
		                }
		                return ret;
			          };//$scope.range

								//=======================================================================
								//
								//=======================================================================
								function getFormatedSubQuery (name) {

										var subQ='';
										if($scope.subQueries[name] && _.isArray($scope.subQueries[name]) && $scope.subQueries[name].length){
												if(name==='keywords' && $scope.subQueries[name][0])
															subQ +=  $scope.subQueries[name][0];
												else
															subQ +=  name+':'+$scope.subQueries[name].join(" OR "+name+":");
												subQ = '('+subQ+')';
										}
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
								'fl': 'id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
								'wt': 'json',
								'start': $scope.currentPage * $scope.itemsPerPage,
								'rows': 25,
								'facet': true,
								'facet.field': ['schema_s', 'government_s', 'government_REL_ss', 'aichiTarget_ss', 'thematicArea_REL_ss'],
								'facet.limit': 999999,
								'facet.mincount' : 1
						};

						if (canceler) {
								canceler.resolve(true);
						}

						canceler = $q.defer();

						$http.get('/api/v2013/index/select', { params: queryParameters, timeout: canceler.promise }).success(function (data) {

								canceler = null;

								if(data.response.start && data.response.numFound && data.response.start>=data.response.numFound ){
										$scope.actionSetPage(1);
										query($scope);
								}

								$scope.count = data.response.numFound;
								$scope.start = data.response.start;
								$scope.stop  = data.response.start+data.response.docs.length-1;
								$scope.rows  = data.response.docs.length;



								$scope.schemas       = $scope.readFacets2(data.facet_counts.facet_fields.schema_s);
								$scope.governments   = $scope.readFacets2(data.facet_counts.facet_fields.government_s);
								$scope.regions       = $scope.readFacets2(data.facet_counts.facet_fields.government_REL_ss);
								$scope.aichiTargets  = $scope.readFacets2(data.facet_counts.facet_fields.aichiTarget_ss);
								$scope.thematicAreas = $scope.readFacets2(data.facet_counts.facet_fields.thematicArea_REL_ss);

								$scope.documents = data.response.docs;

								$scope.pageCount = Math.ceil(data.response.numFound / $scope.itemsPerPage);
								updateQueryString();
						});//$http.get('/ap
				}// query

				//=======================================================================
				//
				//=======================================================================
				function readQueryString () {

						var qsSchema = _([$location.search().schema_s]).flatten().compact().value(); // takes query string into array
						var qsCountry = _([$location.search().government_s]).flatten().compact().value(); // takes query string into array

						var qsArrByField = {'schema_s':qsSchema,'government_s':qsCountry};

						_.each(qsArrByField,function (idArr,schemaKey){
								_.each(idArr,function(id){
										addSubQuery(schemaKey,id);
								});//_.each
						});//_.each
				}//readQueryString

				//=======================================================================
				//
				//=======================================================================
				function updateQueryString () {

						_.each($scope.subQueries,function(itemIdArr,schemaKey){
											if(schemaKey!=='createdDate_s' && schemaKey!=='keywords'){ // exlusions should be handled better
													$location.replace();
													$location.search(schemaKey, itemIdArr);
											}
						});
				}//getFormatedSubQuery

				//=======================================================================
				//
				//=======================================================================
				function search () {
					
						if(queryScheduled)
								$timeout.cancel($scope.queryScheduled);
						queryScheduled = $timeout(function () { query($scope); }, 100);
				}//search

				//=======================================================================
				//
				//=======================================================================
				function addSubQuery (name, query,singleTon) {

						if(!$scope.subQueries) // if called from controler without link ex4ecuting first
							$scope.subQueries=[];
						if(!_.isArray($scope.subQueries[name])) // initialize
							$scope.subQueries[name]=[];
						if(singleTon){  // allows for only one of that type ie date or keyword
								$scope.subQueries[name]=[];
								$scope.subQueries[name].push(query);
						}
						else if($scope.subQueries[name].indexOf(query)<0) // if not already there add
									$scope.subQueries[name].push(query);
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
						if($scope.subQueries)
							$scope.subQueries[name]=[];
				}//deleteSubQuery

				//=======================================================================
				//
				//@ data - raw country data taken from api call
				//@ terms -
				//@ qsSelection -
				//=======================================================================
				function updateTerms(terms,items,facet,data) {

						var qsSelection = _([$location.search()[facet]]).flatten().compact().value(); // takes query string into array
						var termsx = {};

						if(!data)data=terms;
						terms =  _.map(data, function(t) {
									if(qsSelection && !_.isEmpty(qsSelection))
											t.selected = qsSelection.indexOf(t.identifier)>=0; // adds query string frmo url into query

									termsx[t.identifier] = t;
									return t;
						});//_.map
						insertCounts(items,termsx);
						return termsx;
				}//updateTerms

				//=======================================================================
				// initiates all counts to 0 and then insert facit counts based on country
				//
				//=======================================================================
				function insertCounts(items,termsx) {
						if(termsx)
								_.each(termsx,function (item) {
										item.count = 0;
								});//  _.each
						if(items)
								items.forEach(function (item) {
										if(_.has(termsx, item.symbol))
												termsx[item.symbol].count = item.count;
								});//items.forEach
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
