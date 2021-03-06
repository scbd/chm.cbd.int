define(['text!./resource-mobilisation.html', 'app', 'angular', 'lodash', 'jquery', 'authentication', '../views/resource-mobilisation', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', 'utilities/solr','ngDialog', 'scbd-angularjs-services/locale'], function(template, app, angular, _, $) { 'use strict';

app.directive('editResourceMobilisation', ["$http","$rootScope", "$filter", "guid", "$q", "$location", "IStorage", "Enumerable",  "editFormUtility", "authentication", "siteMapUrls", "navigation", '$route', "solr", "realm", "$compile", "$timeout", "ngDialog", "locale", function ($http, $rootScope, $filter, guid, $q, $location, storage, Enumerable,  editFormUtility, authentication, siteMapUrls, navigation, $route, solr, realm, $compile, $timeout, ngDialog, locale) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope)
		{
			$scope.selectedIndex = 0;
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'part1';
			$scope.temp 	= { isExtrapolated: false };
			$scope.review   = { locale : "en" };
			$scope.options  = {
				countries  :	function () { return $http.get("/api/v2013/thesaurus/domains/countries/terms",								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }); },
				confidence :	function () { return $http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				ownerBehalf:	function () { return $http.get("/api/v2013/thesaurus/domains/1FBEF0A8-EE94-4E6B-8547-8EDFCB1E2301/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				currencies :    function () { return $http.get("/api/v2013/thesaurus/domains/ISO-4217/terms",	                            { cache: true }).then(function (o) { return o.data; }); },
				categories :    function () { return $http.get("/api/v2013/thesaurus/domains/33D62DA5-D4A9-48A6-AAE0-3EEAA23D5EB0/terms",   { cache: true }).then(function (o) { return o.data; }); },
				types      :    function () { return $http.get("/api/v2013/thesaurus/domains/6BDB1F2A-FDD8-4922-BB40-D67C22236581/terms",   { cache: true }).then(function (o) { return o.data; }); },
				actions    :    function () { return $http.get("/api/v2013/thesaurus/domains/A9AB3215-353C-4077-8E8C-AF1BF0A89645/terms",   { cache: true }).then(function (o) { return o.data; }); },

				baselineYears 	  : _.range(2006, 2011),
				progressYears 	  : _.range(2011, 2016),
				domesticYears 	  : _.range(2006, 2016),
				fundingNeedsYears : _.range(2014, 2021),

				multipliers : 	    [{identifier:'units',         title: {en:'in units'}},				{identifier:'thousands',     title: {en:'in thousands'}}, 		  {identifier:'millions', title: {en:'in millions'}}],
				methodology : 	    [{identifier:'oecd_dac',      title: {en:'OECD DAC Rio markers'}},  {identifier:'other', 	 title: {en:'Other'       }}],
				measures    : 	    [{identifier:'no', 	          title: {en:'No' }}, 		  	      {identifier:'some', title: {en:'Some measures taken'}}, {identifier:'comprehensive', title: {en:'Comprehensive measures taken'}}],
				inclusions  : 	    [{identifier:'notyet', 	      title: {en:'Not yet started'}},
							   	     {identifier:'some', 	      title: {en:'Some inclusion achieved'}},
							   	     {identifier:'comprehensive', title: {en:'Comprehensive inclusion'}}],
				assessments:  	    [{identifier:'notnecessary',  title: {en:'No such assessment necessary'}},
							   	     {identifier:'notyet', 	      title: {en:'Not yet started'}},
							   	     {identifier:'some', 		  title: {en:'Some assessments undertaken'}},
							   	     {identifier:'comprehensive', title: {en:'Comprehensive assessments undertaken'}}],
				domesticMethodology:[{identifier:'cmfeccabc',     title: {en:'Conceptual and Methodological Framework for Evaluating the Contribution of Collective Action to Biodiversity Conservation'}},
									 {identifier:'other', 	      title: {en:'Other'}}]

			};
			$q.when($http.get("/api/v2013/thesaurus/domains/6BDB1F2A-FDD8-4922-BB40-D67C22236581/terms", { cache: true })).then(function (o) {
					$scope.options.odaOofTypes = o.data;
			});

			$q.when($http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms", { cache: true })).then(function (o) {
					$scope.options.confidences = o.data;
			});

			$scope.isValidNumber = $.isNumeric;

			watchResource('baselineData', 'baselineFlows', 5);
			watchResource('progressData', 'progressFlows', 5);
			watchResource('domesticExpendituresData', 'expenditures', 10);
			watchResource('domesticExpendituresData', 'contributions', 10);
			watchResource('fundingNeedsData', 'annualEstimates', 7);
		    watchResource('nationalPlansData', 'domesticSources', 15);
			watchResource('nationalPlansData', 'internationalSources', 15);

			$scope.baselineFlowsYears = [];
			$scope.progressFlowsYears = [];
			$scope.expendituresYears  = [];
			$scope.contributionsYears = [];
			$scope.fundingNeedsYears  = [];

            $scope.isRequired =   function (arrayName) {

                if((arrayName == 'baselineFlows' || arrayName=='progressFlows' ) && $scope.document && $scope.document.internationalResources)
            	{
				  	if($scope.document.internationalResources.baselineData &&
					   $scope.document.internationalResources.baselineData.baselineFlows &&
                       $scope.document.internationalResources.baselineData.baselineFlows.length > 1)
						return true;

					if($scope.document.internationalResources.progressData &&
					   $scope.document.internationalResources.progressData.progressFlows &&
					   $scope.document.internationalResources.progressData.progressFlows.length > 1)
						return true;
				}

				if((arrayName == 'expenditures' || arrayName == 'contributions')  && $scope.document && $scope.document.domesticExpendituresData)
				{
					if($scope.document.domesticExpendituresData.expenditures &&
					   $scope.document.domesticExpendituresData.expenditures.length > 1)
						return true;

					if($scope.document.domesticExpendituresData.contributions &&
					   $scope.document.domesticExpendituresData.contributions.length > 1)
						return true;
				}

				if(arrayName == 'annualEstimates' &&  $scope.document && $scope.document.fundingNeedsData)
				{
					if($scope.document.fundingNeedsData.annualEstimates &&
					   $scope.document.fundingNeedsData.annualEstimates.length > 1)
						return true;
				}

				if((arrayName == 'domesticSources'  || arrayName == 'internationalSources'  ) && $scope.document && $scope.document.nationalPlansData)
				{
					if($scope.document.nationalPlansData.domesticSources &&
					   $scope.document.nationalPlansData.domesticSources.length > 1)
						return true;

					if($scope.document.nationalPlansData.internationalSources &&
					   $scope.document.nationalPlansData.internationalSources.length > 1)
						return true;
				}

                return false;
            };


			//==================================
			//
			//==================================
			$scope.init = function() {

				navigation.securize();

				if ($scope.document)
					return;

				$scope.status = "loading";

				var promise = null;
				var schema  = "resourceMobilisation";
				var qs = $route.current.params;


				if(qs.uid) { // Load
					promise = editFormUtility.load(qs.uid, schema);
				}
				else { // Create

					promise = $q.when(guid()).then(function(identifier) {
						return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {

							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							return identifier;
						});
					}).then(function(identifier) {

						return {
							header: {
								identifier: identifier,
								schema   : schema,
								languages: ["en"]
							},
							title: {en: 'Financial Reporting Framework: Reporting on baseline and progress towards 2015'},
							government: authentication.user().government ? { identifier: authentication.user().government } : undefined,
							internationalResources:   {
								multiplier: 'units',
								baselineData: { baselineFlows: [{}], coefficient:0},
								progressData:  {progressFlows:[{}]}
							},
							domesticExpendituresData: { expenditures:  [{}], contributions: [{}], multiplier: 'units'},
							fundingNeedsData: 		  { annualEstimates: [{}], multiplier: 'units'},
							nationalPlansData:		  { domesticSources: [{}], internationalSources: [{}], multiplier: 'units'}
						};
					});
				}


				$q.when(loadReferenceRecords({ 
					"fl"    : 'identifier_s, title_s, _workflow_s, _state_s, versionID_s', 
					schema: 'resourceMobilisation'
				}))
				.then(function(rm2015Docs) {
					if (!qs.uid && rm2015Docs && rm2015Docs.length > 0) {
						ngDialog.open({
							template: 'recordExistsTemplate.html',													
							closeByDocument: false,
							closeByEscape: false,
							showClose: false,
							closeByNavigation: false,
							controller: ['$scope', '$timeout', function($scope, $timeout) {
								$scope.alertSeconds = 10;
								time();

								function time(){
									$timeout(function(){
										if($scope.alertSeconds == 1){																	
											$scope.openExisting();
										}
										else{
											$scope.alertSeconds--;																
											time()
										}
									}, 1000)
								}
								$scope.openExisting = function() {
									ngDialog.close();
									var rm2015 = _.head(rm2015Docs);
									if(rm2015._workflow_s)
										$location.path('/management/requests/' + rm2015['_workflow_s'].replace('workflow-','')+'/publishRequest');
									else
										$location.path('/submit/resourceMobilisation/' + rm2015['identifier_s']);
								}
							}]
						});
					}
					else
						pendingPromise();
				})

				function pendingPromise() {
								
					promise.then(function(doc) {
						loadYears(doc);
						return doc;

					}).then(function(doc) {

						$scope.status = "ready";
						$scope.document = doc;

					}).catch(function(err) {

						$scope.onError(err.data, err.status);
						throw err;

					});
				}
			};

			//============================================================
			//
			//============================================================
			function loadReferenceRecords(options, appRealm) {

				var government;
				if($scope.document && $scope.document.government){
					government = $scope.document.government.identifier
				}
				else
					government = $scope.defaultGovernment();

				if (!options.skipLatest && options.latest === undefined)
					options.latest = true;
				
				government = (government||'UNKNONW');
				
				options = _.assign({
					schema    : options.schema,
					rows      : 500,
					government: government
				}, options || {});

				var query = [];
				var fq = [];
				// Add Schema
				fq.push("schema_s:" + solr.escape(options.schema));

				if (options.government)
					fq.push("government_s:" + solr.escape(options.government));

				if (options.identifier)
					query.push("identifier_s:" + solr.escape(options.identifier));

				if (options.state)
					fq.push("_state_s:" + solr.escape(options.state));

				fq.push("realm_ss:" + (appRealm || realm).toLowerCase());

				if (options.latest !== undefined) {
					fq.push("_latest_s:" + (options.latest ? "true" : "false"));
				}

				// AND / OR everything

				if(query.length==0)
					query = '*:*'
				else 
					query = solr.andOr(query);
					
				return querySolr(fq, query, options.rows, options.fl, options)
			}
			
			//==================================
			//
			//==================================	
			function querySolr(fq, query, rows, fields, options){
				var qsParams = {
					"fl"	: 	"id, identifier_s, uniqueIdentifier_s, schema_t, schema_s, createdDate_dt, title_*, summary_*, description_*, url_ss, _revision_i, _state_s, version_s, _latest_s, _workflow_s, date_dt",
					"sort"	: 	(options||{}).sort||"createdDate_dt asc",
					"start"	: 	0,
					"rows"	: 	rows,
				};

				if (options && options.group){
					qsParams.group = options.group;
					qsParams['group.field'] = options['group.field']
					qsParams['group.limit'] = options['group.limit']
				}

				if(fields)
					qsParams.fl = fields;

				if(fq)
					qsParams.fq = fq
				if(query)
					qsParams.q = query;
				
				if(locale != 'en')
					qsParams.fl = qsParams.fl.replace(/_EN_/g, '_'+locale.toUpperCase()+'_')

				return $http.get("/api/v2013/index", {params: qsParams}).then(function(res) {

					if(options && options.group){
						var fieldGroups = res.data.grouped[options['group.field']];
						if(fieldGroups){
							_.each(fieldGroups.groups, function(o){
								_.each(o.doclist.docs, defaultLstring);
							});
						}
						return res.data.grouped;
					}
					var t = _.map(res.data.response.docs, defaultLstring);
					return _.map(res.data.response.docs, defaultLstring);

				});
			}

			//==================================
			//
			//==================================
			function defaultLstring(v){
				return _.defaults(v, {
					schemaName: solr.lstring(v, "schema_*_t", "schema_EN_t", "schema_s"),
					title: solr.lstring(v, "title_*_t", "title_EN_t", "title_t"),
					summary: solr.lstring(v, "summary_*_t", "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t"),
					url    : toLocalUrl(v.url_ss)
				});
			}

			//==================================
			//
			//==================================			
			function toLocalUrl(urls) {

				var url = navigation.toLocalUrl(_.first(urls));
	
				if(_(url).startsWith('/') && (_(url).endsWith('=null') || _(url).endsWith('=undefined')))
					return null;
			}
						
			//==============================
			//
			//==============================
			function watchResource(container, member, maxItems) {
				$scope.$watch(function() {
						if(member == "expenditures" || member == "annualEstimates" || member =="contributions" || member=="domesticSources" || member=="internationalSources" )
							return !$scope.document || angular.toJson(_.compact($scope.document[container][member]));

						if(member == "baselineFlows" || member == "progressFlows")
							return !$scope.document || angular.toJson(_.compact($scope.document.internationalResources[container][member]));

					}, function() {

						if(!$scope.document)
							return;

						//Auto add empty line
						var list = [];

						if(member == "baselineFlows" || member == "progressFlows")
							list = $scope.document.internationalResources[container][member] = _.compact($scope.document.internationalResources[container][member]) || [];

						if(member == "expenditures" || member == "annualEstimates" || member =="contributions" || member=="domesticSources" || member=="internationalSources")
							{
								list = $scope.document[container][member] = _.compact($scope.document[container][member]) || [];

								if(member == "expenditures" && $scope.temp.isExtrapolated){
									$scope.applyPercentageIncrease($scope.temp.annualPercentage);
								}
							}

						if(!_.last(list) || (!_.isEmpty(_.last(list))))
						{
							if(container=="nationalPlansData" &&   (_.has(_.last(list), 'name') || list.length===0) )
								list.push({});
							else  if (list.length < maxItems && container!="nationalPlansData" && (_.has(_.last(list), 'year') || list.length===0) )
								list.push({});
						}

						// Clean
						for(var i=0; i<list.length; i++) {

							var item = list[i]; // object

							if(!_.isEmpty(item))
							{
								item = _.mapValues(item, function(val, key){

											if(key.toLowerCase().indexOf('amount') > -1 || key.toLowerCase().indexOf('year') > -1)
												return parseInt(val || 0);

											return val;
									 	}); // jshint ignore:line
							}

							list[i] = item;
						}
					});
			}

			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {

				document = document || $scope.document;
				document = angular.fromJson(angular.toJson(document));

				if (document)
				{
					if(document.internationalResources && document.internationalResources.baselineData && document.internationalResources.baselineData.baselineFlows){
						document.internationalResources.baselineData.baselineFlows = _.filter(document.internationalResources.baselineData.baselineFlows, function(o) { return !_.isEmpty(o);});
						if(document.internationalResources.baselineData.baselineFlows.length===0)
							document.internationalResources.baselineData.baselineFlows = undefined;
					}


					if(document.internationalResources.currency && _.isEmpty(document.internationalResources.currency))
						document.internationalResources.currency= undefined;

					if(document.internationalResources && document.internationalResources.baselineData){
						if(document.internationalResources.baselineData.odaConfidenceLevel && _.isEmpty( document.internationalResources.baselineData.odaConfidenceLevel))
							document.internationalResources.baselineData.odaConfidenceLevel = undefined;

						if(document.internationalResources.baselineData.oofConfidenceLevel && _.isEmpty( document.internationalResources.baselineData.oofConfidenceLevel))
							document.internationalResources.baselineData.oofConfidenceLevel = undefined;

						if(document.internationalResources.baselineData.otherConfidenceLevel && _.isEmpty( document.internationalResources.baselineData.otherConfidenceLevel))
							document.internationalResources.baselineData.otherConfidenceLevel = undefined;

						if(document.internationalResources.baselineData.odaOofType && _.isEmpty( document.internationalResources.baselineData.odaOofType))
							document.internationalResources.baselineData.odaOofType = undefined;
						else
							document.internationalResources.baselineData.odaOofType = setTerm(document.internationalResources.baselineData.odaOofType);
					}

					if(document.internationalResources && document.internationalResources.progressData){
						if(document.internationalResources.progressData.odaConfidenceLevel && _.isEmpty( document.internationalResources.progressData.odaConfidenceLevel))
							document.internationalResources.progressData.odaConfidenceLevel = undefined;

						if(document.internationalResources.progressData.oofConfidenceLevel && _.isEmpty( document.internationalResources.progressData.oofConfidenceLevel))
							document.internationalResources.progressData.oofConfidenceLevel = undefined;

						if(document.internationalResources.progressData.otherConfidenceLevel && _.isEmpty( document.internationalResources.progressData.otherConfidenceLevel))
							document.internationalResources.progressData.otherConfidenceLevel = undefined;
					}

					if(document.domesticExpendituresData.currency && _.isEmpty(document.domesticExpendituresData.currency))
						document.domesticExpendituresData.currency= undefined;

					if(document.internationalResources && document.internationalResources.progressData && document.internationalResources.progressData.progressFlows){
						document.internationalResources.progressData.progressFlows = _.filter(document.internationalResources.progressData.progressFlows, function(o) { return !_.isEmpty(o);});
						if(document.internationalResources.progressData.progressFlows.length===0)
							document.internationalResources.progressData.progressFlows = undefined;
					}

					if(_.isEmpty(document.internationalResources.baselineData))
						document.internationalResources.baselineData = undefined;

					if(_.isEmpty(document.internationalResources.progressData))
						document.internationalResources.progressData = undefined;



					if(document && document.domesticExpendituresData && document.domesticExpendituresData.expenditures){
						if(_.isEmpty(document.domesticExpendituresData.currency))
							document.domesticExpendituresData.currency = undefined;

						document.domesticExpendituresData.expenditures =_.filter(document.domesticExpendituresData.expenditures, function(o) { return !_.isEmpty(o);});
						if(document.domesticExpendituresData.expenditures.length===0)
							document.domesticExpendituresData.expenditures = undefined;
					}

					if(document && document.domesticExpendituresData && document.domesticExpendituresData.contributions){
						document.domesticExpendituresData.contributions = _.filter(document.domesticExpendituresData.contributions, function(o) { return !_.isEmpty(o);});
						if(document.domesticExpendituresData.contributions.length===0)
							document.domesticExpendituresData.contributions = undefined;
					}

					if(document && document.fundingNeedsData && document.fundingNeedsData.annualEstimates){
						document.fundingNeedsData.annualEstimates = _.filter(document.fundingNeedsData.annualEstimates, function(o) { return !_.isEmpty(o);});
						if(document.fundingNeedsData.annualEstimates.length===0)
							document.fundingNeedsData.annualEstimates = undefined;
					}

					if(document && document.nationalPlansData && document.nationalPlansData.domesticSources ){
						document.nationalPlansData.domesticSources = _.filter(document.nationalPlansData.domesticSources, function(o) { return !_.isEmpty(o);});
						if(document.nationalPlansData.domesticSources.length===0)
							document.nationalPlansData.domesticSources = undefined;
					}

					if(document && document.nationalPlansData && document.nationalPlansData.internationalSources){
						document.nationalPlansData.internationalSources = _.filter(document.nationalPlansData.internationalSources, function(o) { return !_.isEmpty(o);});
						if(document.nationalPlansData.internationalSources.length===0)
							document.nationalPlansData.internationalSources = undefined;
					}

					if(document.internationalResources && document.internationalResources.baselineData && !document.internationalResources.baselineData.coefficient)
						document.internationalResources.baselineData.coefficient = parseInt(document.internationalResources.baselineData.coefficient || 0) || 0;

					if(document.domesticExpendituresData){
						document.fundingNeedsData.multiplier  = document.domesticExpendituresData.multiplier;
						document.nationalPlansData.multiplier = document.domesticExpendituresData.multiplier;
					}

					if (/^\s*$/g.test(document.notes))
						document.notes = undefined;
				}
				//console.log(document);
				return document;
			};





			//==================================
			//
			//==================================
			var getEstimateAverageAmount = function(){

				if(!$scope.document && !$scope.document.domesticExpendituresData && !$scope.document.domesticExpendituresData.expenditures)
					return 0;

				return $scope.typeAverageAmount($scope.document.domesticExpendituresData.expenditures,'amount');
			};

			//==================================
			//
			//==================================
			$scope.applyPercentageIncrease = function(rate){
				if($scope.document && $scope.document.fundingNeedsData && $scope.document.fundingNeedsData.annualEstimates){

					var items		 = $scope.document.fundingNeedsData.annualEstimates;
					var averageValue = getEstimateAverageAmount();
					var currentValue = averageValue;
					var lastYear;

					if($scope.document && $scope.document.domesticExpendituresData && $scope.document.domesticExpendituresData.expenditures){
						lastYear = parseInt(_.max(_.pluck($scope.document.domesticExpendituresData.expenditures, 'year')));
					}

					for(var i=0; i<items.length; i++) {

						var item     = items[i];

						if(!_.isEmpty(item))
						{

							var year = _.result(item, 'year', lastYear);

							if(year > lastYear){
								var years = year-lastYear;
								currentValue = calculateIncrease(averageValue, rate, years);
							}

							item = _.mapValues(item, function(val, key){

										if(key == 'availableResourcesAmount')
											return currentValue;

										if(key == 'fundingGapAmount')
											return item.fundingNeedAmount-currentValue;

										return val;
									}); // jshint ignore:line
						}

						items[i] = item;
					}
				}
			};

			//==================================
			//
			//==================================
			var calculateIncrease = function (val, rate, years) {
				var currentValue = val;

				for(var i=0; i < years; i++){
					currentValue = Math.round(parseFloat(currentValue + (currentValue*rate/100) || 0));
				}
				return currentValue;
			};

			//==================================
			//
			//==================================
			var setTerm = function (identifier) {
				if(!identifier) return undefined;

				if(_.has(identifier, 'identifier'))
					return identifier;

				return {'identifier': identifier};
			};

			//==================================
			//
			//==================================
			$scope.applyExtrapolation = function (value) {

				if(!value) {
					$scope.temp.annualPercentage = 0;
					$scope.document.fundingNeedsData.annualEstimates = [];
					$scope.refreshYears('fundingNeedsYears', items);
					return;
				}

				$scope.temp.annualPercentage = 0;

				var items = [];
				var years = $scope.expendituresYears;
				var availableAmount = getEstimateAverageAmount(); //average from 4.1
				var estimates = {};

				if($scope.document && $scope.document.fundingNeedsData && $scope.document.fundingNeedsData.annualEstimates){
					estimates = $scope.document.fundingNeedsData.annualEstimates;
				}

				for(var i=0; i < years.length; i++){

					var newAvailableAmount = availableAmount;
					var temp = _.findWhere(estimates, { 'year': years[i]});
					var fundingNeedAmount = 0;
					var fundingGapAmount = 0;
					var action = '';

					if(temp){
						fundingNeedAmount = temp.fundingNeedAmount;
						fundingGapAmount  = temp.fundingGapAmount;
						action = temp.action.en;
					}

					var item = {
									"year": years[i],
									"fundingNeedAmount": fundingNeedAmount || 0,
									"availableResourcesAmount": newAvailableAmount,
									"fundingGapAmount": fundingGapAmount-newAvailableAmount,
									"action":{en: action}
								};

					items.push(item);
				}

				$scope.document.fundingNeedsData.annualEstimates = items;
				$scope.refreshYears('fundingNeedsYears', items);
			};


			//==================================
			//
			//==================================
			$scope.refreshYears = function(arrayName, source){
				if(!arrayName) return;

				$scope[arrayName] = _.compact(_.map(source, 'year'));

				// _.map(_.pluck(source, 'year'), function (year) {
				// 						return parseInt(year);
				// 					});
			};

			//==================================
			//
			//==================================
			$scope.isSelectedYear = function(arrayName, year){
				return _.indexOf($scope[arrayName], year ) !== -1;
			};

			//==================================
			//
			//==================================
			$scope.removeYear = function(arrayName, year){
				$scope[arrayName] = _.without($scope[arrayName], year);
			};

			//==================================
			//
			//==================================
			$scope.hasDuplicateYear = function (year, source) {

				var arr = _.compact(_.map(source, 'year'));

				var count = 0;

				for(var i = 0; i < arr.length; ++i){
					if(arr[i] === year)
						count++;
				}

				return count > 1;
			};

            //==================================
			//
			//==================================
			function loadYears(doc) {
				_.map(_.pluck(doc.internationalResources.baselineData.baselineFlows, 'year'), function(year){
					$scope.baselineFlowsYears.push(year);
				});

				_.map(_.pluck(doc.internationalResources.progressData.progressFlows, 'year'), function(year){
					$scope.progressFlowsYears.push(year);
				});

				_.map(_.pluck(doc.domesticExpendituresData.expenditures, 'year'), function(year){
					$scope.expendituresYears.push(year);
				});

				_.map(_.pluck(doc.domesticExpendituresData.contributions, 'year'), function(year){
					$scope.contributionsYears.push(year);
				});

				_.map(_.pluck(doc.fundingNeedsData.annualEstimates, 'year'), function(year){
					$scope.fundingNeedsYears.push(year);
				});
			}

			//==================================
			//
			//==================================
			$scope.isNotEmpty = function(source){
				return !_.isEmpty(source);
			};

			//==================================
			//
			//==================================
			$scope.totalFlowAmount = function(flow){
				var total = 0;

				if(_.isEmpty(flow)) return 0;

				var values = _.omit(angular.fromJson(flow), 'year');

				total = _.reduce(
								_.map(values, function(num) {
									return _.isNumber(num) ? parseInt(num): 0 ;
								}), function(memo, num) {
									return memo+(num||0);
								}, 0);

				return total;
			};

			//==================================
			//
			//==================================
			$scope.totalAverageAmount = function(){
				var odaAverage   = 0;
				var oofAverage   = 0;
				var otherAverage = 0;

				if($scope.document && $scope.document.internationalResources && $scope.document.internationalResources.baselineData && $scope.document.internationalResources.baselineData.baselineFlows)
				{
					odaAverage   = $scope.typeAverageAmount($scope.document.internationalResources.baselineData.baselineFlows,'odaAmount');
					oofAverage   = $scope.typeAverageAmount($scope.document.internationalResources.baselineData.baselineFlows,'oofAmount');
					otherAverage = $scope.typeAverageAmount($scope.document.internationalResources.baselineData.baselineFlows,'otherAmount');
				}

				return parseInt(odaAverage)+parseInt(oofAverage)+parseInt(otherAverage);
			};

			//==================================
			//
			//==================================
			$scope.typeAverageAmount = function(flows, type){
				if(!flows) return 0;

				var items;

				if(_.isEmpty(_.last(flows)) || !_.last(flows))
					items = _.initial(_.pluck(flows, type));
				else
					items = _.pluck(_.filter(flows, function(o){return o.year;}), type);

				if(items.length===0)
					return 0;

				var sum   = _.reduce(_.compact(items), function(memo, num){ return memo + parseInt(num || 0); }, 0);

				return Math.round(sum/items.length);
			};

			//==================================
			//
			//==================================
			var isSomeOrComprehensive = function(val){
				return (val == 'some' || val=='comprehensive');
			};

			//==================================
			//
			//==================================
			$scope.hasBaselineAmount = function (key) {

				if($scope.document && $scope.document.internationalResources &&
									  $scope.document.internationalResources.baselineData &&
				   					  $scope.document.internationalResources.baselineData.baselineFlows
								  ){

					var flows = $scope.document.internationalResources.baselineData.baselineFlows;
				 	var avg = $scope.typeAverageAmount(flows, key);

					return (avg > 0);
				}
				return false;
			};

			//==================================
			//
			//==================================
			$scope.hasProgressAmount = function (key) {

				if($scope.document && $scope.document.internationalResources &&
				   					  $scope.document.internationalResources.progressData &&
				   					  $scope.document.internationalResources.progressData.progressFlows
								  ){

					var flows = $scope.document.internationalResources.progressData.progressFlows;
				 	var avg = $scope.typeAverageAmount(flows, key);

					return (avg > 0);
				}
				return false;
			};

			//==================================
			//
			//==================================
			$scope.showInternationalPrivateSectorComments = function(val){
				if (!$scope.document || !$scope.document.internationalResources || !val)
					return false;

				if(isSomeOrComprehensive(val))
					return true;

				$scope.document.internationalResources.hasPrivateSectorMeasuresComments = undefined;
			};

			//==================================
			//
			//==================================
			$scope.showOtherMethodologyUsed = function(val){
				if (!$scope.document || !$scope.document.internationalResources || !$scope.document.internationalResources.baselineData || !val)
					return false;

				if(val == 'other')
					return true;

				$scope.document.internationalResources.baselineData.methodologyUsedComments = undefined;
			};

			//==================================
			//
			//==================================
			$scope.showInclusionComments = function(val){
				if (!$scope.document || !val)
					return false;

				if(isSomeOrComprehensive(val))
					return true;

				$scope.document.hasNationalBiodiversityInclusionComments = undefined;
			};

			//==================================
			//
			//==================================
			$scope.showBiodiversityAssessmentComments = function(val){
				if (!$scope.document || !val)
					return false;

				if(isSomeOrComprehensive(val))
					return true;

				$scope.document.hasBiodiversityAssessmentComments = undefined;
			};

			//==================================
			//
			//==================================
			$scope.showOtherDomesticMethodology = function(val){
				if (!$scope.document || !$scope.document.domesticExpendituresData || !$scope.document.domesticExpendituresData.domesticCollectiveActionMethodology || !val)
					return false;

				if(val == 'other')
					return true;

				$scope.document.domesticExpendituresData.domesticCollectiveActionMethodologyOther = undefined;
			};

			//==================================
			//
			//==================================
			$scope.isContributionTableVisible = function(val){
				if (!$scope.document || !$scope.document.domesticExpendituresData || !$scope.document.domesticExpendituresData.domesticCollectiveAction || !val)
					return false;

				if(isSomeOrComprehensive(val))
					return true;

				$scope.document.domesticExpendituresData.contributions                            = undefined;
				$scope.document.domesticExpendituresData.domesticCollectiveActionMethodology      = undefined;
				$scope.document.domesticExpendituresData.domesticCollectiveActionMethodologyOther = undefined;
				$scope.document.domesticExpendituresData.measurementUnit                          = undefined;
			};

			//==================================
			//
			//==================================
			$scope.confidenceAverage = function (resources) {

				var values = _.compact(_.map(resources, function (resource) {

					if (resource && resource.confidenceLevel && resource.confidenceLevel.identifier == "D8BC6348-D1F9-4DA4-A8C0-7AE149939ABE") return 3; //high
					if (resource && resource.confidenceLevel && resource.confidenceLevel.identifier == "42526EE6-68F3-4E8A-BC2B-3BE60DA2EB32") return 2; //medium
					if (resource && resource.confidenceLevel && resource.confidenceLevel.identifier == "6FBEDE59-88DB-45FB-AACB-13C68406BD67") return 1; //low

					return 0;
				}));

				var value = 0;

				if(values.length) {
					value = Math.round(_.reduce(values, function(memo, value) { return memo + value; }) / values.length);
				}

				if ( value == 3) return "High";
				if ( value == 2) return "Medium";
				if ( value == 1) return "Low";

				return "No value selected";
			};

			//==================================
			//
			//==================================
			$scope.getEstimatedFundingGap = function(available, need){

				if(!need && !available)
					return 0;

				if(!_.isNumber(parseInt(need)) && _.isNumber(parseInt(available)))
					return 0;

				return parseInt(need - available);
			};

			//==================================
			//
			//==================================
			$scope.getFundingGapYear = function(year){
				if(!year) return 0;

				if($scope.document && $scope.document.fundingNeedsData && $scope.document.fundingNeedsData.annualEstimates){

					var estimates = $scope.document.fundingNeedsData.annualEstimates;
					var estimate = _.findWhere(estimates, {year:year});

					if(estimate && estimate.fundingGapAmount)
						return estimate.fundingGapAmount;
				}

				return 0;
			};

			//==================================
			//
			//==================================
			$scope.getNationalPlansSourcesTotal = function(member, year){
				if(!year || !member) return 0;

				if($scope.document && $scope.document.nationalPlansData && $scope.document.nationalPlansData[member]){

					var prop = "amount"+year;
					var items;

					var sources = angular.fromJson($scope.document.nationalPlansData[member]);

					if(_.isEmpty(_.last(sources)))
						items = _.initial(sources);

					items = _.pluck(sources, prop); // array of amounts

					var sum = 0;
					_.map(_.compact(items), function(num){
						sum = sum + parseInt(num)||0;
					});

					return sum;
				}
				return 0;
			};

			//==================================
			//
			//==================================
			$scope.getNationalPlansRemainingGapByYear = function(year){
				if(!year) return 0;

				return $scope.getFundingGapYear(year) - ($scope.getNationalPlansSourcesTotal('domesticSources', year)  + $scope.getNationalPlansSourcesTotal('internationalSources', year)) ;
			};

			//==================================
			//
			//==================================
			$scope.showDomesticPrivateSectorComments = function(val){
				if (!$scope.document || !$scope.document.hasDomesticPrivateSectorMeasures  || !val)
					return false;

				if(isSomeOrComprehensive(val))
					return true;

				$scope.document.hasDomesticPrivateSectorMeasuresComments = undefined;
			};


			//==================================
			//
			//==================================
			$scope.annualEstimatesHasYear = function (year) {
				if(!year) return false;

				if($scope.document && $scope.document.fundingNeedsData && $scope.document.fundingNeedsData.annualEstimates){

					var estimates = $scope.document.fundingNeedsData.annualEstimates;
					var estimate = _.findWhere(estimates, {year:year});

					if(estimate)
						return true;
				}
				return false;
			};

			//==================================
			//
			//==================================
			$scope.$watch(function () {
				if($scope.document && $scope.document.internationalResources &&
				   $scope.document.internationalResources.baselineData && $scope.document.internationalResources.baselineData.coefficient)
					return $scope.document.internationalResources.baselineData.coefficient || 0;

			}, function(val) {

					if(!$scope.document || !$scope.document.internationalResources ||
					           !$scope.document.internationalResources.baselineData || !$scope.document.internationalResources.baselineData.coefficient)
						return 0;

					$scope.document.internationalResources.baselineData.coefficient = parseInt(val) || 0;

			});

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if(tab == "part1"  ) 	 { $scope.prevTab = "part1"; 	   $scope.nextTab = "part2";}
				if(tab == "part2"  )     { $scope.prevTab = "part1"; 	   $scope.nextTab = "part3";}
				if(tab == "part3"  )     { $scope.prevTab = "part2";       $scope.nextTab = "part4";}
				if(tab == "part4"  )     { $scope.prevTab = "part3";       $scope.nextTab = "part5";}
				if(tab == "part5"  )     { $scope.prevTab = "part4";       $scope.nextTab = "part6";}
				if(tab == "part6"  )     { $scope.prevTab = "part5";       $scope.nextTab = "review";}
				if(tab == "review" )     { $scope.prevTab = "part6";       $scope.nextTab = "review";}

				if (tab == 'review')
					$scope.validate();
			});



			//==================================
			//
			//==================================
			$scope.$watch('selectedIndex', function(selectedIndex) {

				if(!selectedIndex) return;

				if (selectedIndex == 6)
					$scope.validate();

			});
			///////////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////////



			//==================================
			//
			//==================================
			$scope.validate = function() {

				$scope.validationReport = null;

				var oDocument = $scope.getCleanDocument();

				$scope.reviewDocument = angular.fromJson(angular.toJson(oDocument));

				return storage.documents.validate(oDocument).then(function(success) {

					$scope.validationReport = success.data;
					return !!(success.data && success.data.errors && success.data.errors.length);

				}).catch(function(error) {

					$scope.onError(error.data);
					return true;
				});
			};

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
			$scope.isFieldValid = function(field) {
				if (field && $scope.validationReport && $scope.validationReport.errors)
					return !Enumerable.From($scope.validationReport.errors).Any(function(x){return x.property==field;});

				return true;
			};

			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
			};

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {

				 return $scope.validate().then(function(hasError) {
				 	if (hasError)
					$scope.selectedIndex = 6;
				 	return hasError;
				 });
			};

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function() {
				$rootScope.$broadcast("onPostWorkflow", "Publishing request sent successfully.");
				$location.url("/submit/resourceMobilisation");
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");

				$location.url("/submit/resourceMobilisation");
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				//$location.url("/submit/resourceMobilisation");
				$rootScope.$broadcast("onSaveDraft", "Draft record saved.");

			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				$rootScope.$broadcast("onPostClose", "Record closed..");
				$location.url("/submit/resourceMobilisation");
			};

			//==================================
			//
			//==================================
			$scope.userGovernment = function() {
				return authentication.user().government;
			};

			//==================================
			//
			//==================================
			$scope.defaultGovernment = function() {

				var qsGovernment = $location.search().government;

				if (qsGovernment)
					qsGovernment = qsGovernment.toLowerCase();

				return $scope.userGovernment() || qsGovernment;
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

			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record

					return storage.drafts.get(identifier, { info : "", cache:true }).then(function(r) {
						return r.data;
					}).catch(function(e) {

						if (!e || !e.status || e.status != 404)
							throw e;

						return storage.documents.get(identifier, { info : "", cache:true }).then(function(r) {
							return r.data;
						});
					});
				}

				//Load all record of specified schema;
				var sQuery = "type eq '" + encodeURI(schema) + "'";

				var qDocs   = storage.documents.query(sQuery, null, { cache: true });
				var qDrafts = storage.drafts   .query(sQuery, null, { cache: true });

				return $q.all([qDocs, qDrafts]).then(function(results) {

					var oDocs      = results[0].data.Items;
					var oDrafts    = results[1].data.Items;
					var oDraftUIDs = _.pluck(oDrafts, "identifier");

					oDocs = _.filter(oDocs, function(o) { return !_.contains(oDraftUIDs, o.identifier);});

					return _.union(oDocs, oDrafts);
				});
			};

			$scope.init();

        }
    };
}]);


//==================================
//
//==================================
app.directive('rmPopover', function() {
	return {
		restrict: 'A',
		link: function (scope, elem, attrs) {
			elem.popover({
				trigger: 'focus hover',
				placement: attrs.dataPlacement || 'auto',
				html: true,
				container: 'body'
			});
		}
	};
});

//==================================
//
//==================================
app.directive('modalYoutube', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/templates/modal-youtube.html',
		scope: {
			id     : '@videoId',
			header : '@videoHeader',
			videoEn: '@videoCodeEn',
			videoEs: '@videoCodeEs',
			videoFr: '@videoCodeFr',
            callbackbuttonleft: '&ngClickLeftButton',
            callbackbuttonright: '&ngClickRightButton'			
		},
		link: function($scope, elem) {

			//==================================
			//
			//==================================			
			elem.on('hidden.bs.modal', function() {
				$scope.$apply(function() {
					$scope.stopVideo();
				});
			});

			//==================================
			//
			//==================================
			$scope.playVideo = function (lang) {
				var youtubeUrl = 'https://www.youtube.com/embed/'  
				var options    = '?enablejsapi=1&rel=0&autoplay=1&showinfo=0';

				if(lang=='en') $scope.video = youtubeUrl+$scope.videoEn+options;
				if(lang=='es') $scope.video = youtubeUrl+$scope.videoEs+options;
				if(lang=='fr') $scope.video = youtubeUrl+$scope.videoFr+options;
			}

			//==================================
			//
			//==================================
			$scope.stopVideo = function () {
				$scope.video = '';
				var selector = '#'+$scope.id + ' iframe';
				var youtube = angular.element(document.querySelector(selector))[0].contentWindow;

				if(youtube){ 
					youtube.postMessage('{"event":"command","func":"' + 'stopVideo' +   '","args":""}', '*');
				}
			};
		}
	};
});
});
