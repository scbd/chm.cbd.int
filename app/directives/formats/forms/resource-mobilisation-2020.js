define(['text!./resource-mobilisation-2020.html', 'app', 'angular', 'lodash', 'jquery', 'authentication', '../views/resource-mobilisation-2020', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', 'utilities/solr','ngDialog', 'scbd-angularjs-services/locale'], function(template, app, angular, _, $) { 'use strict';

app.directive('editResourceMobilisation2020', ["$http","$rootScope", "$filter", "guid", "$q", "$location", "IStorage", "Enumerable",  "editFormUtility", "authentication", "siteMapUrls", "navigation", '$route', "solr", "realm", "$compile", "$timeout", "ngDialog", "locale", function ($http, $rootScope, $filter, guid, $q, $location, storage, Enumerable, editFormUtility, authentication, siteMapUrls, navigation, $route, solr, realm, $compile, $timeout, ngDialog, locale) {
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
			$scope.review   = { locale : "en" };
			$scope.options  = {
				countries  :	function () { return $http.get("/api/v2013/thesaurus/domains/countries/terms",								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }); },
				confidence :	function () { return $http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				ownerBehalf:	function () { return $http.get("/api/v2013/thesaurus/domains/1FBEF0A8-EE94-4E6B-8547-8EDFCB1E2301/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				currencies :    function () { return $http.get("/api/v2013/thesaurus/domains/ISO-4217/terms",	                            { cache: true }).then(function (o) { return o.data; }); },
				categories :    function () { return $http.get("/api/v2013/thesaurus/domains/33D62DA5-D4A9-48A6-AAE0-3EEAA23D5EB0/terms",   { cache: true }).then(function (o) { return o.data; }); },
				types      :    function () { return $http.get("/api/v2013/thesaurus/domains/6BDB1F2A-FDD8-4922-BB40-D67C22236581/terms",   { cache: true }).then(function (o) { return o.data; }); },
				actions    :    function () { return $http.get("/api/v2013/thesaurus/domains/A9AB3215-353C-4077-8E8C-AF1BF0A89645/terms",   { cache: true }).then(function (o) { return o.data; }); },

				progressYears 	  : _.range(2016, 2021),
				domesticYears 	  : _.range(2005, 2026),
				fundingNeedsYears : _.range(2005, 2026), 

				multipliers : 	    [{identifier:'units',         title: {en:'in units'}},				{identifier:'thousands',  title: {en:'in thousands'}}, 		  {identifier:'millions', title: {en:'in millions'}}],
				methodology : 	    [{identifier:'oecd_dac',      title: {en:'OECD DAC Rio markers'}},  {identifier:'other', 	  title: {en:'Other'       }}],
				measures    : 	    [{identifier:'no', 	          title: {en:'No' }}, 		  	        {identifier:'some', 	  title: {en:'Some measures taken'}}, {identifier:'comprehensive', title: {en:'Comprehensive measures taken'}}],
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

			$q.when($http.get("/api/v2013/thesaurus/domains/93E3EC30-75E3-44C9-996E-6E61FEE4DE93/terms", { cache: true })).then(function (o) {
					$scope.options.overallGapReductions = o.data;
			});			

			$scope.isValidNumber = $.isNumeric;

			watchResource('internationalResources', 'financialFlows', 5);
			watchResource('domesticExpendituresData', 'contributions', 10);
			watchResource('nationalPlansData', 'domesticSources', 15);
			watchResource('nationalPlansData', 'internationalSources', 15);			

			$scope.financialFlowsYears = [];
			$scope.progressFlowsYears = [];
			$scope.contributionsYears = [];

			$scope.isRequired =   function (arrayName) {

                if(arrayName=='financialFlows' && $scope.document && $scope.document.internationalResources)
				{
					if($scope.document.internationalResources.financialFlows &&
						$scope.document.internationalResources.financialFlows.length > 1)
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

				var promise   = null;
				var schema    = "resourceMobilisation2020";
				var qs        = $route.current.params;


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
							title: {en: 'Financial Reporting Framework: Reporting on progress towards 2020'},
							government: authentication.user().government ? { identifier: authentication.user().government } : undefined,
							internationalResources:   {
								multiplier: 'units',
							},
							domesticExpendituresData: { contributions: [{}]},
							nationalPlansData : { domesticSources: [{}], internationalSources: [{}], multiplier: 'units', gapReductions: [{}]}
						};
					});
				}

				$q.when(loadReferenceRecords({ 
					"fl"    : 'identifier_s, title_s, _workflow_s, _state_s, versionID_s', 
					schema: 'resourceMobilisation2020'
				}))
				.then(function(rm2020Docs) {
					if (!qs.uid && rm2020Docs && rm2020Docs.length > 0) {
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
									var rm2020 = _.head(rm2020Docs);
									if(rm2020._workflow_s)
										$location.path('/management/requests/' + rm2020['_workflow_s'].replace('workflow-','')+'/publishRequest');
									else
										$location.path('/submit/resourceMobilisation2020/' + rm2020['identifier_s']);
								}
							}]
						});
					}
					else
						pendingPromise();
				})
				
				function pendingPromise() {
					promise.then(function(doc) {

						return doc;

					}).then(function(doc) {

						$scope.loadBaselineDocuments();

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
				
			//==================================
			//
			//==================================			
			$scope.$watch('baselineDocument', function(newValue, oldValue) {
				$scope.copyMandatoryFields();
			});

			//==================================
			//
			//==================================
			$scope.loadBaselineDocuments = function(){

				var sQuery = "type eq '" + encodeURI('resourceMobilisation') + "'";

				var qDocs   = storage.documents.query(sQuery, null, { cache: true });
				var qDrafts = storage.drafts   .query(sQuery, null, { cache: true });

				return $q.all([qDocs, qDrafts]).then(function(results) {

					var oDocs      = results[0].data.Items;
					var oDrafts    = results[1].data.Items;

					var oDraftUIDs = _.pluck(oDrafts, "identifier");

					oDocs = _.filter(oDocs, function(o) { return !_.contains(oDraftUIDs, o.identifier);});

					$scope.baselineDocuments = oDocs; //_.union(oDocs, oDrafts);

					// test
					if($scope.baselineDocuments){
						$scope.baselineDocumentId      = $scope.baselineDocuments[0].documentID;
						var baselineDocumentIdentifier = $scope.baselineDocuments[0].identifier;
					}
			
					$q.when($scope.getBaselineDocument(baselineDocumentIdentifier)).then(function(o){
						$scope.baselineDocument = o.body;
					})
				});
			}

			//==============================
			//
			//==============================
			$scope.copyMandatoryFields = function() {
				
				if($scope.document){
					
					if($scope.baselineDocument){

						if($scope.baselineDocument.internationalResources && $scope.baselineDocument.internationalResources.currency ){
								$scope.document.internationalResources.currency = $scope.baselineDocument.internationalResources.currency;
						}

						if($scope.baselineDocument.internationalResources && $scope.baselineDocument.internationalResources.multiplier ){
								$scope.document.internationalResources.multiplier = $scope.baselineDocument.internationalResources.multiplier;
						}

						if($scope.baselineDocument.domesticExpendituresData){
							
							if($scope.baselineDocument.domesticExpendituresData.currency ){
								$scope.document.domesticExpendituresData.currency = $scope.baselineDocument.domesticExpendituresData.currency
								$scope.document.nationalPlansData.currency 		  = $scope.baselineDocument.domesticExpendituresData.currency;
							}

							if($scope.baselineDocument.domesticExpendituresData.multiplier){
								$scope.document.domesticExpendituresData.multiplier = $scope.baselineDocument.domesticExpendituresData.multiplier
								$scope.document.nationalPlansData.multiplier 		= $scope.baselineDocument.domesticExpendituresData.multiplier // 5
							}
						}
					}

				}
			}

			//==============================
			//
			//==============================
			$scope.getBaselineDocument = function(identifier) {
				
				if (identifier) { //lookup single record
					var deferred = $q.defer();

					storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							$scope.hasBaselineDocument = true;
							deferred.resolve(r.data);
						}, function(e) {
							if (e.status == 404) {
								$scope.hasBaselineDocument = false;
								throw e;
							}
							else {
								deferred.reject (e);
							}
						});
					return deferred.promise;
				}
			}

			//==============================
			//
			//==============================
			function watchResource(container, member, maxItems) {
				$scope.$watch(function() {
						if(member === "financialFlows" || member =="contributions" || member=="internationalSources" || member=="domesticSources")
							return !$scope.document || angular.toJson(_.compact($scope.document[container][member]));

				}, function() {

					if(!$scope.document)
						return;

					//Auto add empty line
					var list = [];

					if(member === "financialFlows" || member =="contributions" || member=="domesticSources" || member=="internationalSources"){
						
						list = $scope.document[container][member] = _.compact($scope.document[container][member]) || [];
					}

					if(!_.last(list) || (!_.isEmpty(_.last(list)))){
						if (list.length < maxItems){

							if(list.length===0)
								list.push({});
							else if(member === "financialFlows" && hasValidFlows(list))
								list.push({});
							else if(member === "contributions" && hasValidContributions(list)){
								list.push({});
							}
							else if(member === "domesticSources" ){
								list.push({});
							}	
							else if(member === "internationalSources" ){
								list.push({});
							}														
						}
					}

					// Clean
					for(var i=0; i<list.length; i++) {

						var item = list[i]; // object

						if(!_.isEmpty(item)){
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

				if($scope.document && $scope.document.internationalResources && $scope.document.internationalResources.financialFlows)
				{
					odaAverage   = $scope.typeAverageAmount($scope.document.internationalResources.financialFlows,'odaAmount');
					oofAverage   = $scope.typeAverageAmount($scope.document.internationalResources.financialFlows,'oofAmount');
					otherAverage = $scope.typeAverageAmount($scope.document.internationalResources.financialFlows,'otherAmount');
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
			var setTerm = function (identifier) {
				if(!identifier) return undefined;

				if(_.has(identifier, 'identifier'))
					return identifier;

				return {'identifier': identifier};
			};			

			//==================================
			//
			//==================================
			$scope.showOtherMethodologyUsed = function(val){
				if (!$scope.document || !$scope.document.internationalResources || !$scope.document.internationalResources || !val)
					return false;

				if(val == 'other')
					return true;

				$scope.document.internationalResources.methodologyUsedComments = undefined;
			};

			//==================================
			//
			//==================================
			$scope.refreshYears = function(arrayName, source){
				if(!arrayName) return;

				$scope[arrayName] = _.compact(_.map(source, 'year'));

			};

			//==================================
			//
			//==================================
			var hasValidFlows = function(flows){ // [{year:2016, odaAmount: 111, oofAmout: 222, otherAmount: 555}]

				var odaAmount;
				var oofAmount;
				var otherAmount;
				var year; 
				var isValid = true;


				for(var i=0; i < flows.length; i++){
					year 		= _.has(flows[i], 'year');
					odaAmount   = parseInt(_.result(flows[i], 'odaAmount', '0'));
					oofAmount   = parseInt(_.result(flows[i], 'oofAmount', '0'));
					otherAmount = parseInt(_.result(flows[i], 'otherAmount', '0'));

					isValid = isValid && year && (odaAmount > 0 || oofAmount > 0 || otherAmount > 0);
				}

				if(flows.length === 0) isValid = false;

				return isValid;
			};


			//==================================
			//
			//==================================
			$scope.annualEstimatesHasYear = function (year) {
				if(!year) return false;

				if($scope.document && $scope.baselineDocument && $scope.baselineDocument.fundingNeedsData && $scope.baselineDocument.fundingNeedsData.annualEstimates){

					var estimates = $scope.baselineDocument.fundingNeedsData.annualEstimates;
					var estimate = _.findWhere(estimates, {year:year});

					if(estimate)
						return true;
				}
				return false;
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
			$scope.getFundingGapYear = function(year){
				if(!year) return 0;

				if($scope.document && $scope.baselineDocument && $scope.baselineDocument.fundingNeedsData && $scope.baselineDocument.fundingNeedsData.annualEstimates){

					var estimates = $scope.baselineDocument.fundingNeedsData.annualEstimates;
					var estimate = _.findWhere(estimates, {year:year});

					if(estimate && estimate.fundingGapAmount)
						return estimate.fundingGapAmount;
				}

				return 0;
			};

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
			var hasValidContributions = function(contributions){ 

				var amount;
				var year; 
				var confidence;
				var isValid = true;


				for(var i=0; i < contributions.length; i++){
					year 		= _.has(contributions[i], 'year');
					amount   = parseInt(_.result(contributions[i], 'amount', '0'));
					confidence = _.has(contributions[i], 'confidenceLevel');

					isValid = isValid && year && amount > 0 && confidence;
				}

				if(contributions.length === 0) isValid = false;

				return isValid;
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
			$scope.isEmpty = function(source){
				return _.isEmpty(source);
			};

			//==================================
			//
			//==================================
			$scope.isContributionTableVisible = function(val){
				if (!$scope.document || !$scope.document.domesticExpendituresData || !$scope.document.domesticExpendituresData.domesticCollectiveAction || !val)
					return false;

				if(val == 'some' || val=='comprehensive')
					return true;

				$scope.document.domesticExpendituresData.contributions                            = undefined;
				$scope.document.domesticExpendituresData.domesticCollectiveActionMethodology      = undefined;
				$scope.document.domesticExpendituresData.domesticCollectiveActionMethodologyOther = undefined;
				$scope.document.domesticExpendituresData.measurementUnit                          = undefined;
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
			$scope.getCleanDocument = function(document) {

				document = document || $scope.document;
				document = angular.fromJson(angular.toJson(document));

				if (document)
				{
					if(document.internationalResources){

						if(document.internationalResources.odaOofType && _.isEmpty( document.internationalResources.odaOofType))
							document.internationalResources.odaOofType = undefined;
						else
							document.internationalResources.odaOofType = setTerm(document.internationalResources.odaOofType);

						if(document.internationalResources.coefficient)
							document.internationalResources.coefficient = parseInt(document.internationalResources.coefficient || 0) || 0;

						// 1.2 - clear comments
						if(!document.internationalResources.hasPrivateSectorMeasures || document.internationalResources.hasPrivateSectorMeasures === "notyet"){
							document.internationalResources.hasPrivateSectorMeasuresComments = undefined;       	// clear value
							$scope.document.internationalResources.hasPrivateSectorMeasuresComments = undefined;	// clear scope
						}
					}

					// 2 - clear comments
					if(!document.hasNationalBiodiversityInclusion || document.hasNationalBiodiversityInclusion === "notyet"){
						document.hasNationalBiodiversityInclusionComments = undefined;		  // clear value
						$scope.document.hasNationalBiodiversityInclusionComments = undefined; // clear scope
					}

					// 3 - clear comments
					if(!document.hasBiodiversityAssessment || document.hasBiodiversityAssessment === "notyet" || document.hasBiodiversityAssessment === "no"){
						document.hasBiodiversityAssessmentComments = undefined;		  // clear value
						$scope.document.hasBiodiversityAssessmentComments = undefined; // clear scope
					}					
					
					// 5 - clear comments 
					if(document.nationalPlansData){					 
						if(!document.nationalPlansData.hasDomesticPrivateSectorMeasures  || document.nationalPlansData.hasDomesticPrivateSectorMeasures === "no"){
							document.nationalPlansData.hasDomesticPrivateSectorMeasuresComments = undefined;		  // clear value
							$scope.document.nationalPlansData.hasDomesticPrivateSectorMeasuresComments = undefined; // clear scope
						}	

						if(!document.nationalPlansData.gapReductions){
							if(!_.includes(_.map(document.nationalPlansData.gapReductions, _.isEmpty), false)){  // empty
								document.nationalPlansData.gapReductions = undefined;
							} 
						}
					}

					if (/^\s*$/g.test(document.notes))
						document.notes = undefined;
				}

				return document;
			};

			//==================================
			//
			//==================================
			// $scope.$watch('document.internationalResources.multiplier', function(multiplier) {

			// 	if($scope.document && $scope.document.domesticExpendituresData)
			// 		$scope.document.domesticExpendituresData.multiplier = multiplier;

			// });			

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

                return $scope.validate().then(function (hasError) {
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
				$location.url("/submit/resourceMobilisation2020");
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");

				$location.url("/submit/resourceMobilisation2020");
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
			$scope.onPostClose = function() {
				$rootScope.$broadcast("onPostClose", "Record closed..");
				$location.url("/submit/resourceMobilisation2020");
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
app.directive('modalPart1', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/templates/baseline-part1.html',
		scope: {
			id     : '@part1Id',
			header : '@part1Header',
			baseline: '=part1Data'		
		},
		controller: ['$scope', function ($scope) {

			//==================================
			//
			//==================================
			$scope.totalAverageAmount = function(){
				var odaAverage   = 0;
				var oofAverage   = 0;
				var otherAverage = 0;

				if($scope.baseline && $scope.baseline.internationalResources && $scope.baseline.internationalResources.baselineData.baselineFlows)
				{
					if( _.size($scope.baseline.internationalResources.baselineData.baselineFlows) > 0){
						var items = $scope.baseline.internationalResources.baselineData.baselineFlows;

						odaAverage   = _.sum(_.map(items, 'odaAmount'))/_.size(items);   //$parent.typeAverageAmount($scope.baseline.internationalResources.financialFlows,'odaAmount');
						oofAverage   = _.sum(_.map(items, 'oofAmount'))/_.size(items);   //$parent.typeAverageAmount($scope.baseline.internationalResources.financialFlows,'oofAmount');
						otherAverage = _.sum(_.map(items, 'otherAmount'))/_.size(items); //$parent.typeAverageAmount($scope.baseline.internationalResources.financialFlows,'otherAmount');
					}
				}
			
				return parseInt(odaAverage)+parseInt(oofAverage)+parseInt(otherAverage);
			}
		}]
	};
});
//==================================
//
//==================================
app.directive('modalPart2', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/templates/baseline-part2.html',
		scope: {
			id     : '@part2Id',
			header : '@part2Header',
			baseline: '=part2Data'		
		}
	};
});

//==================================
//
//==================================
app.directive('modalPart3', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/templates/baseline-part3.html',
		scope: {
			id     : '@part3Id',
			header : '@part3Header',
			baseline: '=part3Data'		
		}
	};
});

//==================================
//
//==================================
app.directive('modalPart4', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/templates/baseline-part4.html',
		scope: {
			id     : '@part4Id',
			header : '@part4Header',
			baseline: '=part4Data'		
		}
	};
});

//==================================
//
//==================================
app.directive('modalPart5', function() {
	return {
		restrict: 'E',
		transclude: true,
		templateUrl: '/templates/baseline-part5.html',
		scope: {
			id     : '@part5Id',
			header : '@part5Header',
			baseline: '=part5Data'		
		},
		controller: ['$scope', function ($scope) {

			//==================================
			//
			//==================================
			$scope.getNationalPlansSourcesTotal = function(member, year){
				if(!year || !member) return 0;

				if($scope.baseline && $scope.baseline.nationalPlansData && $scope.baseline.nationalPlansData[member]){

					var prop = "amount"+year;
					var items;

					var sources = angular.fromJson($scope.baseline.nationalPlansData[member]);

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
			$scope.getFundingGapYear = function(year){
				if(!year) return 0;

				if($scope.baseline && $scope.baseline.fundingNeedsData && $scope.baseline.fundingNeedsData.annualEstimates){

					var estimates = $scope.baseline.fundingNeedsData.annualEstimates;
					var estimate = _.findWhere(estimates, {year:year});

					if(estimate && estimate.fundingGapAmount)
						return estimate.fundingGapAmount;
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

		}]

	};
});

});


