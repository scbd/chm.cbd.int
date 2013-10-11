angular.module('kmApp').compileProvider // lazy
.directive('nationalReportingManager', ["$timeout", "$q", "$location", "authentication", function ($timeout, $q, $location, authentication) {
	return {
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/national-reporting-manager.partial.html',
		replace: true,
		transclude: false,
		scope: {},
		link: function($scope, $elm) {


			var qTimeout = $timeout(function(){ 
				if($scope.$root.NRLastSection){

					var qElement = $elm.find("#"+$scope.$root.NRLastSection);

					qElement.collapse("show");
					qElement.prev().removeClass("collapsed");//fixe boostrap bug

					$('body').stop().animate({ scrollTop : qElement.offset().top-100 }, 600);
				}
				else {
					var qElement = $elm.find(".panel-collapse:first");
					
					qElement.collapse("show");
					qElement.prev().removeClass("collapsed");//fixe boostrap bug
				}
			}, 250)


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


			if(!authentication.user().isAuthenticated) {
				$timeout.cancel(qTimeout);
				$location.search({returnUrl : $location.url() });
				$location.path('/management/signin');
				return;
			}

		},
		controller: ['$rootScope', '$scope', '$q', 'authHttp', "underscore", "$location", "URI", "authentication", function ($rootScope, $scope, $q, $http, _, $location, URI, authentication) {

			$scope.government = 'AF';
			$scope.currentYear = new Date().getUTCFullYear();
			$scope.globalYears = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
			$scope.countries           = $http.get('/api/v2013/countries').then(function(response) { return response.data });
			$scope.nationalReportTypes = $http.get('/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms').then(function(response) { return response.data });
			$scope.cbdNBSAPs          = ["B0EBAE91-9581-4BB2-9C02-52FCF9D82721"];// NBSAP
			$scope.cbdNationalReports = ["B3079A36-32A3-41E2-BDE0-65E4E3A51601", // NR5
										 "272B0A17-5569-429D-ADF5-2A55C588F7A7", // NR4
										 "DA7E04F1-D2EA-491E-9503-F7923B1FD7D4", // NR3
										 "A49393CA-2950-4EFD-8BCC-33266D69232F", // NR2
										 "F27DBC9B-FF25-471B-B624-C0F73E76C8B"]; // NR1

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
			$scope.$watch("government", function(gov) {

				if ($location.search() != gov && gov)
					$location.search("country", gov||null);

				load();
			});

			//==================================
			//
			//==================================
			$scope.$watch(function() { return $location.search().country }, function government(government) {

				$scope.government = government || userGovernment() || undefined;
			});

			//==================================
			//
			//==================================
			function userGovernment() {
				if(authentication.user().government)
					return authentication.user().government.toUpperCase();
			};

			$scope.setLastSection = function(name) {
				$rootScope.NRLastSection = name;
			}

			//===============
			//
			//===============
			$scope.isAssessed = function(value) {
				return value && value.progressAssessments && value.progressAssessments.length > 0;
			}

			//===============
			//
			//===============
			$scope.getAssessment = function(value, year) {

				if (value && value.progressAssessments)
					return _.first(_.filter(value.progressAssessments, function(o) { return _.contains(o.years, year) }));
			}

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
			}


			//===============
			//
			//===============
			$scope.isPublic = function(value) {
				return true; //TODO
			}

			//===============
			//
			//===============
			$scope.isDraft = function(value) {
				return false; //TODO
			}

			//===============
			//
			//===============
			$scope.edit = function(schema, option) {

				var d1 = $scope.showLinkTargetDialog(false)

				$q.all([d1]).then(function(res) {

					var url = URI("/management/edit/" + schema);

					if (option)
						url = url.search(option);

					$location.url(url.toString());
				});
			}

			//===============
			//
			//===============
			$scope.userGovernment = function() {
				return userGovernment();
			}
			
			//==================================
			//
			//==================================
			function load() {

				$scope.nationalReports = [];
				$scope.nationalStrategicPlans = [];
				$scope.otherNationalReports = [];

				$scope.aichiTargets = [];
				$scope.nationalIndicators = [];
				$scope.nationalTargets = [];

				$scope.implementationActivities = [];
				$scope.nationalSupportTools = [];

				if ($scope.government) {

					var government = $scope.government.toLowerCase();

					var req = [
						loadNationalReports(government),
						loadAssessments(government), 
					];

					$q.all(req).then(function(res) {

						$scope.nationalReports          = res[0].nationalReports;
						$scope.nationalStrategicPlans   = res[0].nationalStrategicPlans;
						$scope.otherNationalReports     = res[0].otherNationalReports;

						$scope.aichiTargets             = res[1].aichiTargets;
						$scope.nationalIndicators       = res[1].nationalIndicators;
						$scope.nationalTargets          = res[1].nationalTargets;
						$scope.implementationActivities = res[1].implementationActivities;
						$scope.nationalSupportTools     = res[1].nationalSupportTools;
					});
				}
			}

			//==================================
			//
			//==================================
			function loadNationalReports(government) {

				var nrQuery = {
					q: "schema_s:(nationalReport) AND government_s:" + government,
					fl: "schema_s,url_ss,identifier_s,title_t,summary_t,reportType_s,reportType_CEN_s,year_is",
					rows: 99999999
				}

				return $http.get("/api/v2013/index", { params: nrQuery }).then(function(response) {

					var qRecords = response.data.response.docs;

					var qqNationalReports = _.filter(qRecords, function(o) { return   _.contains($scope.cbdNationalReports, o.reportType_s) });
					var qqNBSAPs          = _.filter(qRecords, function(o) { return   _.contains($scope.cbdNBSAPs,          o.reportType_s) });
					var qqOthers          = _.filter(qRecords, function(o) { return !(_.contains($scope.cbdNationalReports, o.reportType_s) || _.contains($scope.cbdNBSAPs, o.reportType_s)) });

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
							identifier : record.identifier_s,
							title : record.title_t,
							summary : record.summary_t,
							url : makeRelative(_.first(record.url_ss||[])),
							year: _.last(record.year_is || []),
							years: record.year_is,
							reportType : record.reportType_s,
							reportTypeEx : tryParseJson(record.reportType_CEN_s)
						}
					});
				}
			}

			//==================================
			//
			//==================================
			function loadAssessments(government) {
				var aichiTargetQuery = {
					q: "schema_s:aichiTarget",
					fl: "schema_s, url_ss, identifier_s, title_t, icon_s, url_ss, number_d",
					sort: "number_d ASC",
					rows: 99999999
				}

				var nationalQuery = {
					q: "schema_s:(nationalIndicator nationalTarget progressAssessment implementationActivity nationalSupportTool) AND government_s:" + government,
					fl: "schema_s, url_ss, identifier_s, title_t, description_t, nationalIndicator_ss, aichiTarget_ss, aichiTarget_s, nationalTarget_s, nationalTarget_ss, year_is, government_s, completion_CEN_s",
					sort: "title_s ASC",
					rows: 99999999
				};

				var qAichiTargetRecords = $http.get("/api/v2013/index", { params: aichiTargetQuery });
				var qNationalRecords    = $http.get("/api/v2013/index", { params: nationalQuery });

				return $q.all([qAichiTargetRecords, qNationalRecords]).then(function(response) {

					var qAichiTargets = response[0].data.response.docs;
					var qNationalIndicators       = _.where(response[1].data.response.docs, { schema_s: 'nationalIndicator' });
					var qNationalTargets          = _.where(response[1].data.response.docs, { schema_s: 'nationalTarget' });
					var qProgressAssessments      = _.where(response[1].data.response.docs, { schema_s: 'progressAssessment' });
					var qImplementationActivities = _.where(response[1].data.response.docs, { schema_s: 'implementationActivity' });
					var qNationalSupportTools     = _.where(response[1].data.response.docs, { schema_s: 'nationalSupportTool' });

					// Aichi Targets
					var aichiTargets = _.map(qAichiTargets, function(record) {

						var qqAssessments     = _.compact(_.where(qProgressAssessments, { aichiTarget_s : record.identifier_s }));
						var qqNationalTargets = _.compact(_.filter(qNationalTargets, function(o) { return _.contains(o.aichiTarget_ss, record.identifier_s) }));

						return _.first(_.map(map_aichiTargets([record]), function(record) {

							return _.extend(record, {
								nationalTargets     : map_nationalTargets(qqNationalTargets),
								progressAssessments : map_progressAssessments(qqAssessments),
								assessmentYears     : _.compact(_.uniq(_.flatten(_.pluck(qqAssessments, "year_is")))),
								nextAssessmentYear  : nextAssessmentYear(_.compact(_.uniq(_.flatten(_.pluck(qqAssessments, "year_is"))))),
								isUpToDate          : isUpToDate(_.flatten(_.pluck(qqAssessments, "year_is")))
							});
						}));
					})

					// National Targets
					var nationalTargets = _.map(qNationalTargets, function(record) {

						var qqAssessments  = _.compact(_.where (qProgressAssessments, { nationalTarget_s : record.identifier_s }));
						var qqAichiTargets = _.compact(_.filter(qAichiTargets,        function(o) { return _.contains(record.aichiTarget_ss, o.identifier_s) }));
						var qqIndicators   = _.compact(_.filter(qNationalIndicators,  function(o) { return _.contains(record.nationalIndicator_ss, o.identifier_s) }));

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

						var qqNationalTargets  = _.compact(_.filter(qNationalTargets, function(o) { return _.contains(o.nationalIndicator_ss, record.identifier_s) }));
						var qqAichiTargetCodes = _.compact(_.uniq(_.flatten(_.pluck(qqNationalTargets, "aichiTarget_ss"))));
						var qqAichiTargets     = _.compact(_.filter(qAichiTargets,    function(o) { return _.contains(qqAichiTargetCodes, o.identifier_s) }));

						return _.first(_.map(map_nationalTargets([record]), function(record) {

							return _.extend(record, {
								nationalTargets : map_nationalTargets(qqNationalTargets),
								aichiTargets    : map_aichiTargets   (qqAichiTargets),
							});
						}));
					});


					// Implementation Activities
					var implementationActivities = _.map(qImplementationActivities, function(record) {

						var qqAichiTargets    = _.compact(_.filter(qAichiTargets,        function(o) { return _.contains(record.aichiTarget_ss,       o.identifier_s) }));
						var qqIndicators      = _.compact(_.filter(qNationalIndicators,  function(o) { return _.contains(record.nationalIndicator_ss, o.identifier_s) }));
						var qqNationalTargets = _.compact(_.filter(qNationalTargets,     function(o) { return _.contains(record.nationalTarget_ss,    o.identifier_s) }));

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

						var qqIndicatorCodes  = _.uniq(_.flatten(_.compact(_.map(qqNationalTargets, function(t) { return t.nationalIndicator_ss }))));
						var qqIndicators      = _.compact(_.filter(qNationalIndicators,  function(o) { return _.contains(qqIndicatorCodes,            o.identifier_s) }));
						var qqAichiTargets    = _.compact(_.filter(qAichiTargets,        function(o) { return _.contains(record.aichiTarget_ss,       o.identifier_s) }));
						var qqNationalTargets = _.compact(_.filter(qNationalTargets,     function(o) { return _.contains(record.nationalTarget_ss,    o.identifier_s) }));
												
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
					}
				});


				//==================================
				//
				//==================================
				function map_aichiTargets(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
							identifier: record.identifier_s,
							title: record.title_t,
							url : makeRelative(_.first(record.url_ss||[])),
							number: record.identifier_s.replace("AICHI-TARGET-", ""),
							iconUrl: record.icon_s
						}
					});
				}

				//==================================
				//
				//==================================
				function map_nationalIndicators(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
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
				function map_implementationActivities(rawRecords) {

					return _.map(rawRecords, function(record) {
						return {
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
			function nextAssessmentYear(years) {
				if(years && years.length)
					return _.chain(_.range(2010, $scope.currentYear+1)).difference(years).last().value()

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
			};
		}]
	};
}]);

