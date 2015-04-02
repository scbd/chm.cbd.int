/* jshint quotmark: false */
angular.module('kmApp') // lazy
.directive('nationalReportingManager', ["$timeout", "$q", "$location", "authentication","$rootScope",
 function ($timeout, $q, $location, authentication, $rootScope) {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/national-reporting-manager.partial.html',
		replace: true,
		transclude: false,
		scope: {},
		link: function($scope, $elm) {


			var qTimeout = $timeout(function(){
				var qElement = null;
				if($scope.$root.NRLastSection){

					qElement = $elm.find("#"+$scope.$root.NRLastSection);

					qElement.collapse("show");
					qElement.prev().removeClass("collapsed");//fixe boostrap bug

					/* global $: true */
					$('body').stop().animate({ scrollTop : qElement.offset().top-100 }, 600);
				}
				else {
					qElement = $elm.find(".panel-collapse:first");

					qElement.collapse("show");
					qElement.prev().removeClass("collapsed");//fixe boostrap bug
				}
			}, 250);


			function showModal(modal, display) {

				if(modal.is(":visible") == display) {
					return $q.when(display);
				}
				else {

					var oldDefered = modal.data("showDefered");
					var newDefered = $q.defer();

					if(oldDefered)
						oldDefered.reject();

					modal.data("showDefered", newDefered);
					modal.modal(display ? 'show' : 'hide');

					return newDefered.promise;
				}
			}

			function resolveShowModal(modal, value) {

				var defered = modal.data("showDefered");

				modal.data("showDefered", null);

				if(defered)
					$timeout(function() { defered.resolve(value); });
			}

			var qLinkTargetDialog = $elm.find("#linkNationalTargetDialog");

			qLinkTargetDialog.on('shown.bs.modal',  function(){ return resolveShowModal(qLinkTargetDialog, true); });
			qLinkTargetDialog.on('hidden.bs.modal', function(){ return resolveShowModal(qLinkTargetDialog, false); });
			$scope.showLinkTargetDialog = function(display)   { return showModal(qLinkTargetDialog, display); };


			if(!$rootScope.user.isAuthenticated) {
				$timeout.cancel(qTimeout);

				if(!$location.search().returnUrl)
					$location.search({returnUrl : $location.url() });

				$location.path('/signin');
				return;
			}

		},
		controller: ['$rootScope', '$scope', "$routeParams", '$q', '$http', "navigation", "underscore", "$location", "URI", "authentication", "IStorage", "$filter",
		function ($rootScope, $scope, $routeParams, $q, $http, navigation, _, $location, URI, authentication, storage, $filter) {

			 navigation.securize();
//["Administrator", "ChmAdministrator", "ChmNationalFocalPoint", "ChmNationalAuthorizedUser"]
			// if(userGovernment() && userGovernment()!=$routeParams.country) {
			// 	$location.path("/management/national-reporting/"+userGovernment());
			// 	return;
			// }
            if($routeParams.schema)
                $scope.schema = $routeParams.schema;
            else
                $scope.schema = "nationalStrategicPlan";
            $scope.loading = false;
			$scope.government  = userGovernment();// || $routeParams.country;
			$scope.currentYear = new Date().getUTCFullYear()-1;
			$scope.globalYears = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
			$scope.countries   = $http.get('/api/v2013/countries').then(function(response) {

				var eu  = _.findWhere(response.data, { code : "EU"  });
				var eur = _.findWhere(response.data, { code : "EUR" });

				if(eur && !eu ) response.data.push(_.extend(_.clone(eur), { code: "EU"  }));
				if(eu  && !eur) response.data.push(_.extend(_.clone(eu ), { code: "EUR" }));

				return $scope.countries = response.data;
			});
			$http.get('/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms').then(function(response) { $scope.nationalReportTypes = response.data; });
			$scope.cbdNBSAPs          = ["B0EBAE91-9581-4BB2-9C02-52FCF9D82721"];// NBSAP
			$scope.cbdNationalReports = ["B3079A36-32A3-41E2-BDE0-65E4E3A51601", // NR5
										 "272B0A17-5569-429D-ADF5-2A55C588F7A7", // NR4
										 "DA7E04F1-D2EA-491E-9503-F7923B1FD7D4", // NR3
										 "A49393CA-2950-4EFD-8BCC-33266D69232F", // NR2
										 "F27DBC9B-FF25-471B-B624-C0F73E76C8B3"]; // NR1

			$scope.orderList = true;
			$scope.sortTerm = 'title';

		    //==================================
		    //
		    //==================================
			$scope.sortTable = function (term) {

			    if ($scope.sortTerm == term) {
			        $scope.orderList = !$scope.orderList;
			    }
			    else {
			        $scope.sortTerm = term;
			        $scope.orderList = true;
			    }
			};

		    //==================================
		    //
		    //==================================
			$scope.UpToDate = function (items) {
			    if (!items)
			        return null;

			    var result = [];

			    for (var i = 0; i < items.length; i++) {

			        if (items[i].isUpToDate) {
			            result.push(items[i]);
			        }

			    }
			    return result;
			};

			//==================================
			//
			//==================================
			$scope.linkTargets = function(params) {

				var ids = _.map(params.excludeTargets, function(t) { return t.identifier; });

				$scope.linkTargetData = {
					aichiTarget : params.aichiTarget,
					nationalIndicator : params.nationalIndicator,
					targets : _.chain($scope.nationalTargets).filter(function(o) { return !_.contains(ids, o.identifier); }).value()
				};
			};

			//==================================
			//
			//==================================
			// $scope.$watch("government", function(gov, prev) {
			// 	// if($scope.government!=$routeParams.country) {
			// 	// 	$location.path("/management/national-reporting/"+$scope.government);
			// 	// 	return;
			// 	// }
            //
			// 	if(authentication.user().government)
			// 		$scope.government =$rootScope.user.government;
            //
			// 	// if(authentication.user().IsAdministrator() )
			// 	// 		$scope.government =authentication.user().government;
            //
            //
			// 	$scope.governmentName = null;
			// 	$scope.nationalReports = [];
			// 	$scope.nationalStrategicPlans = [];
			// 	$scope.otherNationalReports = [];
			// 	$scope.aichiTargets = [];
			// 	$scope.nationalIndicators = [];
			// 	$scope.nationalTargets = [];
			// 	$scope.implementationActivities = [];
			// 	$scope.nationalSupportTools = [];
            //
			// 	load();
			// });

			//==================================
			//
			//==================================
			// $scope.$watch("schema", function() {
            //
			// 	if($routeParams.schema)
			// 		$scope.schema = $routeParams.schema;
			// 	else
			// 		$scope.schema = "nationalStrategicPlans";
            //
			// 	$scope.governmentName = null;
			// 	$scope.nationalReports = [];
			// 	$scope.nationalStrategicPlans = [];
			// 	$scope.otherNationalReports = [];
			// 	$scope.aichiTargets = [];
			// 	$scope.nationalIndicators = [];
			// 	$scope.nationalTargets = [];
			// 	$scope.implementationActivities = [];
			// 	$scope.nationalSupportTools = [];
            //
			// 	load();
			// });


			//==================================
			//
			//==================================
			//==================================
			//
			//==================================
			// $rootScope.$on('$routeUpdate', function(evt, currentRoute) {
			//
			// 	console.log("$routeUpdate", currentRoute);
			//
			// 	var government = currentRoute.params.country;
			//
			// 	if(userGovernment())
			// 		government = userGovernment();
			//
			// 	$scope.government = government;
			// });

			//==================================
			//
			//==================================
			function userGovernment() {
				if($rootScope.user && $rootScope.user.government)
					return $rootScope.user.government.toUpperCase();

                return '';
			}

			$scope.setLastSection = function(name) {
				$rootScope.NRLastSection = name;
			};

			//===============
			//
			//===============
			$scope.isAssessed = function(value) {
				return value && value.progressAssessments && value.progressAssessments.length > 0;
			};

			//===============
			//
			//===============
			$scope.getAssessment = function(value, year) {

				if (value && value.progressAssessments)
					return _.find(value.progressAssessments, function(o) { return _.contains(o.years, year); });
			};

		    //===============
		    //
		    //===============
			$scope.getActivities = function (activities, targetID) {

			    if (!activities)
			        return null;

			    if (!targetID)
			        return null;

			    var result = [];

			    for (var i = 0; i < activities.length; i++) {
			        for (var j = 0; j < activities[i].nationalTargets.length; j++) {
			            if (activities[i].nationalTargets[j].identifier == targetID) {
			                result.push(activities[i]);
			            }
			        }
			    }
			    return result;
			};


			//===============
			//
			//===============
			$scope.isPublic = function(value) {
				return value && (value.isPublic===true || value.isDraft===undefined);
			};

			//===============
			//
			//===============
			$scope.isDraft = function(value) {
				return value && value.isDraft===true;
			};

			//===============
			//
			//===============
			$scope.edit = function(schema, option) {

				var d1 = $scope.showLinkTargetDialog(false);

				$q.all([d1]).then(function() {
                    var params=schema;
                    if(schema=='nationalReport' || schema=='nationalStrategicPlan' || schema=='otherReport'){
                        params = 'nationalReport';
                    }
					$location.path("/management/edit/"+params);
					$location.search(option||{});
				});
			};

			//===============
			//
			//===============
			$scope.userGovernment = function() {
				return userGovernment();
			};

			var autoRefresh = null;

			//==================================
			//
			//==================================
			function load() {

				if(autoRefresh)
					$timeout.cancel(autoRefresh);

				if ($scope.government) {
                    $scope.loading = true;
					$http.get('/api/v2013/countries/' + $scope.government.toUpperCase(), { cache:true }).then(function (response) {
                        $scope.governmentName =  response.data.name.en;
					}).catch(function() {
						navigation.notFound();
					});

					var government = $scope.government.toLowerCase();

					var req ='';
                    if( $scope.schema=='nationalReport' ||  $scope.schema=='nationalStrategicPlan' ||  $scope.schema=='otherReport')
                        req = loadNationalReports(government);
                    else
                        req = loadAssessments(government);

					$q.when(req).then(function(res) {
                        if($scope.schema=='nationalReport'){
						   $scope.nationalReports          = res.nationalReports;
                        }
                        else if($scope.schema=='nationalStrategicPlan'){
						   $scope.nationalStrategicPlans   = res.nationalStrategicPlans;
                        }
                        else if($scope.schema=='otherReport'){
                            $scope.otherNationalReports     = res.otherNationalReports;
                        }
                        else{
    						$scope.aichiTargets             = res.aichiTargets;
    						$scope.nationalIndicators       = res.nationalIndicators;
    						$scope.nationalTargets          = res.nationalTargets;
    						$scope.implementationActivities = res.implementationActivities;
    						$scope.nationalSupportTools     = res.nationalSupportTools;
                        }
					}).then(function(){

						if(!autoRefresh)
							autoRefresh = $timeout(load, 5000);
					}).finally(function(){
                        $scope.loading = false;
                    });
				}
			}

			//==================================
			//
			//==================================
			function loadNationalReports(government) {

                var query = ' reportType_s:'
                if($scope.schema=='nationalReport'){
                   query += '(' + $scope.cbdNationalReports.join(' OR reportType_s:') + ')'
                }
                else if($scope.schema=='nationalStrategicPlan'){
                    query += '(' + $scope.cbdNBSAPs.join(' OR reportType_s:') + ')'
                }
                else if($scope.schema=='otherReport'){
                    var others= $scope.cbdNationalReports.concat($scope.cbdNBSAPs);
                    query = ' NOT reportType_s:' + others.join(' AND NOT reportType_s:')
                }
				var nrQuery = {
					q: 'schema_s:("nationalReport") AND government_s:"' + government + '" AND ' + query ,
					fl: 'schema_s,url_ss,identifier_s,title_t,summary_t,reportType_s,reportType_EN_t,reportType_CEN_s,year_is,version_s',
					rows: 99999999
				};
console.log(nrQuery.q);
				var qResults = $http.get('/api/v2013/index', { params: nrQuery });

				return $q.when(qResults)
                .then(function(response) {
                    console.log(response.data.response.docs);
					return mergeWithDrafts(response.data.response.docs);
				}).then(function(qRecords) {
					var qqNationalReports = _.filter(qRecords, function(o) { return   _.contains($scope.cbdNationalReports, o.reportType_s); });
					var qqNBSAPs          = _.filter(qRecords, function(o) { return   _.contains($scope.cbdNBSAPs,          o.reportType_s); });
					//var qqOthers          = _.filter(qRecords, function(o) { return !(_.contains($scope.cbdNationalReports, o.reportType_s) || _.contains($scope.cbdNBSAPs, o.reportType_s)); });
                    var others= $scope.cbdNationalReports.concat($scope.cbdNBSAPs);
                    var qqOthers          = _.filter(qRecords, function(o) { return  !_.contains(others, o.reportType_s); });

					return {
						nationalReports:        map_reports(qqNationalReports),
						nationalStrategicPlans: map_reports(qqNBSAPs),
						otherNationalReports:   map_reports(qqOthers)
					};
				});

				//====================================
				//
				//====================================
				function map_reports(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							isPublic : record.isPublic,
							isDraft : record.isDraft,
							identifier : record.identifier_s,
							title : record.title_t,
							summary : record.summary_t,
							url : makeRelative(_.first(record.url_ss||[])),
							year: _.last(record.year_is || []),
							years: record.year_is,
							reportType : record.reportType_s,
							reportTypeEx : tryParseJson(record.reportType_CEN_s)
						};
					});
				}
			}

			//==================================
			//
			//==================================
			function loadAssessments(government) {
				var aichiTargetQuery = {
					q: "schema_s:aichiTarget NOT version_s:*",
					fl: "schema_s, url_ss, identifier_s, title_t, icon_s, url_ss, number_d, version_s",
					sort: "number_d ASC",
					rows: 99999999
				};

				var nationalQuery = {
					q: "schema_s:(nationalIndicator nationalTarget progressAssessment implementationActivity nationalSupportTool) AND government_s:" + government,
					fl: "schema_s, url_ss, identifier_s, title_t, description_t, nationalIndicator_ss, aichiTarget_ss, aichiTarget_s, nationalTarget_s, nationalTarget_ss, year_is, government_s, completion_CEN_s, version_s",
					sort: "title_s ASC",
					rows: 99999999
				};

				var qAichiTargetRecords = $http.get("/api/v2013/index", { params: aichiTargetQuery }).then(function(response) {
					return response.data.response.docs;
				});

				var qNationalRecords    = $http.get("/api/v2013/index", { params: nationalQuery }).then(function(response) {
					return mergeWithDrafts(response.data.response.docs);
				});

				return $q.all([qAichiTargetRecords, qNationalRecords]).then(function(response) {

					var qAichiTargets             =         response[0];
					var qNationalIndicators       = _.where(response[1], { schema_s: 'nationalIndicator' });
					var qNationalTargets          = _.where(response[1], { schema_s: 'nationalTarget' });
					var qProgressAssessments      = _.where(response[1], { schema_s: 'progressAssessment' });
					var qImplementationActivities = _.where(response[1], { schema_s: 'implementationActivity' });
					var qNationalSupportTools     = _.where(response[1], { schema_s: 'nationalSupportTool' });

					// Aichi Targets
					var aichiTargets = _.map(qAichiTargets, function(record) {

						var qqAssessments     = _.compact(_.where(qProgressAssessments, { aichiTarget_s : record.identifier_s }));
						var qqNationalTargets = _.compact(_.filter(qNationalTargets, function(o) { return _.contains(o.aichiTarget_ss, record.identifier_s); }));

						return _.first(_.map(map_aichiTargets([record]), function(record) {

							return _.extend(record, {
								nationalTargets     : map_nationalTargets(qqNationalTargets),
								progressAssessments : map_progressAssessments(qqAssessments),
								assessmentYears     : _.compact(_.uniq(_.flatten(_.pluck(qqAssessments, "year_is")))),
								nextAssessmentYear  : nextAssessmentYear(_.compact(_.uniq(_.flatten(_.pluck(qqAssessments, "year_is"))))),
								isUpToDate          : isUpToDate(_.flatten(_.pluck(qqAssessments, "year_is")))
							});
						}));
					});

					// National Targets
					var nationalTargets = _.map(qNationalTargets, function(record) {

						var qqAssessments  = _.compact(_.where (qProgressAssessments, { nationalTarget_s : record.identifier_s }));
						var qqAichiTargets = _.compact(_.filter(qAichiTargets,        function(o) { return _.contains(record.aichiTarget_ss, o.identifier_s); }));
						var qqIndicators   = _.compact(_.filter(qNationalIndicators,  function(o) { return _.contains(record.nationalIndicator_ss, o.identifier_s); }));

						return _.first(_.map(map_nationalTargets([record]), function(record) {

							return _.extend(record, {
								nationalIndicators  : map_nationalIndicators (qqIndicators),
								aichiTargets        : map_aichiTargets       (qqAichiTargets),
								progressAssessments : map_progressAssessments(qqAssessments),
								assessmentYears     : _.compact(_.uniq(_.flatten(_.pluck(qqAssessments, "year_is")))),
								nextAssessmentYear  : nextAssessmentYear(_.compact(_.uniq(_.flatten(_.pluck(qqAssessments, "year_is"))))),
								isUpToDate          : isUpToDate(_.flatten(_.pluck(qqAssessments, "year_is")))
							});
						}));
					});

					// National Indicators
					var nationalIndicators = _.map(qNationalIndicators, function(record) {

						var qqNationalTargets  = _.compact(_.filter(qNationalTargets, function(o) { return _.contains(o.nationalIndicator_ss, record.identifier_s); }));
						var qqAichiTargetCodes = _.compact(_.uniq(_.flatten(_.pluck(qqNationalTargets, "aichiTarget_ss"))));
						var qqAichiTargets     = _.compact(_.filter(qAichiTargets,    function(o) { return _.contains(qqAichiTargetCodes, o.identifier_s); }));

						return _.first(_.map(map_nationalTargets([record]), function(record) {

							return _.extend(record, {
								nationalTargets : map_nationalTargets(qqNationalTargets),
								aichiTargets    : map_aichiTargets   (qqAichiTargets),
							});
						}));
					});


					// Implementation Activities
					var implementationActivities = _.map(qImplementationActivities, function(record) {

						var qqAichiTargets    = _.compact(_.filter(qAichiTargets,        function(o) { return _.contains(record.aichiTarget_ss,       o.identifier_s); }));
						var qqIndicators      = _.compact(_.filter(qNationalIndicators,  function(o) { return _.contains(record.nationalIndicator_ss, o.identifier_s); }));
						var qqNationalTargets = _.compact(_.filter(qNationalTargets,     function(o) { return _.contains(record.nationalTarget_ss,    o.identifier_s); }));

						return _.first(_.map(map_implementationActivities([record]), function(record) {

							return _.extend(record, {
								nationalIndicators  : map_nationalIndicators (qqIndicators),
								aichiTargets        : map_aichiTargets       (qqAichiTargets),
								nationalTargets     : map_progressAssessments(qqNationalTargets)
							});
						}));
					});

					// National Support Tools
					var nationalSupportTools = _.map(qNationalSupportTools, function(record) {

						var qqAichiTargets    = _.compact(_.filter(qAichiTargets,        function(o) { return _.contains(record.aichiTarget_ss,       o.identifier_s); }));
						var qqNationalTargets = _.compact(_.filter(qNationalTargets,     function(o) { return _.contains(record.nationalTarget_ss,    o.identifier_s); }));
						var qqIndicatorCodes  = _.uniq(_.flatten(_.compact(_.map(qqNationalTargets, function(t) { return t.nationalIndicator_ss; }))));
						var qqIndicators      = _.compact(_.filter(qNationalIndicators,  function(o) { return _.contains(qqIndicatorCodes,            o.identifier_s); }));

						return _.first(_.map(map_nationalSupportTools([record]), function(record) {

							return _.extend(record, {
								nationalIndicators  : map_nationalIndicators (qqIndicators),
								aichiTargets        : map_aichiTargets       (qqAichiTargets),
								nationalTargets     : map_progressAssessments(qqNationalTargets)
							});
						}));
					});

					return {
						nationalIndicators : nationalIndicators,
						nationalTargets : nationalTargets,
						aichiTargets : aichiTargets,
						implementationActivities : implementationActivities,
						nationalSupportTools : nationalSupportTools
					};
				});


				//==================================
				//
				//==================================
				function map_aichiTargets(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							isPublic : record.isPublic,
							isDraft : record.isDraft,
							identifier: record.identifier_s,
							title: record.title_t,
							url : makeRelative(_.first(record.url_ss||[])),
							number: record.identifier_s.replace("AICHI-TARGET-", ""),
							iconUrl: record.icon_s
						};
					});
				}

				//==================================
				//
				//==================================
				function map_nationalIndicators(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							isPublic : record.isPublic,
							isDraft : record.isDraft,
							identifier: record.identifier_s,
							government: record.government_s,
							title: record.title_t,
							url : makeRelative(_.first(record.url_ss||[]))
					};
					});
				}

				//==================================
				//
				//==================================
				function map_nationalTargets(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							isPublic : record.isPublic,
							isDraft : record.isDraft,
							identifier: record.identifier_s,
							government: record.government_s,
							title: record.title_t,
							description: record.description_t,
							url : makeRelative(_.first(record.url_ss||[]))
						};
					});
				}

				//==================================
				//
				//==================================
				function map_implementationActivities(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							isPublic : record.isPublic,
							isDraft : record.isDraft,
							identifier: record.identifier_s,
							government: record.government_s,
							title: record.title_t,
							description: record.description_t,
							completion : tryParseJson(record.completion_CEN_s),
							url : makeRelative(_.first(record.url_ss||[]))
						};
					});
				}

				//==================================
				//
				//==================================
				function map_nationalSupportTools(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							isPublic : record.isPublic,
							isDraft : record.isDraft,
							identifier: record.identifier_s,
							government: record.government_s,
							title: record.title_t,
							description: record.description_t,
							url : makeRelative(_.first(record.url_ss||[]))
						};
					});
				}

				//==================================
				//
				//==================================
				function map_progressAssessments(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							isPublic : record.isPublic,
							isDraft : record.isDraft,
							identifier: record.identifier_s,
							title: record.title_t,
							url : makeRelative(_.first(record.url_ss||[])),
							years: record.year_is
						};
					});
				}
			}

			//===============
			//
			//===============
			function mergeWithDrafts(docsAndDrafts) {
				var qIdentifiers = _.union(_.pluck(docsAndDrafts, "identifier_s"));

				return _.map(qIdentifiers, function(uid){

					var doc   = _.find(docsAndDrafts,   function(d) { return d.identifier_s == uid && d.version_s===undefined; });
					var draft = _.find(docsAndDrafts,   function(d) { return d.identifier_s == uid && d.version_s==="draft"  ; });

					if(doc)   doc  .isPublic = true;
					if(draft) draft.isDraft  = true;

					return _.extend({}, doc||{}, draft||{});
				});
			}

			//===============
			//
			//===============
			function nextAssessmentYear(years) {
				if(years && years.length)
					return _.chain(_.range(2010, $scope.currentYear+1)).difference(years).last().value();

				return $scope.currentYear;
			}

			//===============
			//
			//===============
			function isUpToDate(years) {
				return years && _.contains(years, $scope.currentYear);
			}

			//==================================
			//
			//==================================
			function makeRelative(url) {

				var oPageUrl = new URI();

				if (_.isString(url) && (oPageUrl.host() == "chm.cbd.int" || oPageUrl.host() == "chm.local" || oPageUrl.host() == "localhost"|| oPageUrl.host() == "bchweb2" || oPageUrl.port()!=80)) {
					var oUrl = new URI(url);

					if (oUrl.host() == "chm.cbd.int")
						url = oUrl.path() + oUrl.search() + oUrl.hash();
				}
				return url;
			}

			//==================================
			//
			//==================================
			function tryParseJson(serializedObject) {

				if (_.isArray(serializedObject)){
					return _.map(serializedObject, angular.fromJson);
				}
				else if(_.isString(serializedObject)) {
					return angular.fromJson(serializedObject);
				}
			}

			//==============================
			//
			//==============================
			$scope.eraseDraft = function(draft, type, sourceCollection, identifier)
			{
				$scope.deleting = identifier;
				storage.drafts.get(identifier, { info: "true" }).then(function(document){

					if(document.workingDocumentLock || document.workingDocumentCreatedOn!=null){
						alert("You are not authorized to delete this draft. \n Document is in workflow mode.");
						return;
					}

					return storage.drafts.security.canDelete(identifier, type).then(
						function(isAllowed) {
							if (!isAllowed) {
								alert("You are not authorized to delete this draft");
								return;
							}

							if (!confirm("Delete the draft?"))
								return;

							storage.drafts.delete(identifier).then(
								function(success) {
							 		sourceCollection.splice(sourceCollection.indexOf(draft), 1);
								},
								function(error) {
									alert("Error: " + error);
								});
						});
				}).then(function(){
					$scope.deleting = false;
				});
			};
			//==============================
			//
			//==============================
			$scope.eraseDocument = function(draft, type, sourceCollection, identifier)
			{
				$scope.deleting = identifier;
					return storage.documents.security.canDelete(identifier, type).then(
						function(isAllowed) {
							if (!isAllowed) {
								alert("You are not authorized to delete this draft");
								return;
							}

							if (!confirm("Delete the document?"))
								return;

							storage.documents.delete(identifier).then(
								function(success) {
							 		sourceCollection.splice(sourceCollection.indexOf(draft), 1);
										$scope.deleting = false;
								},
								function(error) {
									alert("Error: " + error);
								});
						});

			};
            load();
		}]
	};
}]);
