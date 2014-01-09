angular.module('kmApp').compileProvider // lazy
.directive('editResourceMobilisation', ['authHttp', "$filter", "guid", "underscore", function ($http, $filter, guid, _) {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-resource-mobilisation.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';	
			$scope.review   = { locale : "en" };
			$scope.options  = {
				countries:		function () { return $http.get("/api/v2013/thesaurus/domains/countries/terms",								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }); },
				confidence:		function () { return $http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				ownerBehalf:	function () { return $http.get("/api/v2013/thesaurus/domains/1FBEF0A8-EE94-4E6B-8547-8EDFCB1E2301/terms",	{ cache: true }).then(function (o) { return o.data; }); },
				currencies:     function () { return $http.get("/api/v2013/thesaurus/domains/ISO-4217/terms",	                            { cache: true }).then(function (o) { return o.data; }); },
				types:          $http.get("/api/v2013/thesaurus/domains/33D62DA5-D4A9-48A6-AAE0-3EEAA23D5EB0/terms", { cache: true }).then(function (o) { return o.data; }),
				sources:		$http.get("/api/v2013/thesaurus/domains/09A1F957-C1B8-4419-90A3-168DE3CD1676/terms", { cache: true }).then(function (o) { return o.data; }),
				categories:		$http.get("/api/v2013/thesaurus/domains/A9AB3215-353C-4077-8E8C-AF1BF0A89645/terms", { cache: true }).then(function (o) { return o.data; }),
				confidences:	$http.get("/api/v2013/thesaurus/domains/AB782477-9942-4C6B-B9F0-79A82915A069/terms", { cache: true }).then(function (o) { return o.data; }),
				years: [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020]
			};

			$scope.init();
		},
		controller : ['$scope', "$q", "$location", 'IStorage', "Enumerable",  "editFormUtility", "authentication", "siteMapUrls", "navigation", function ($scope, $q, $location, storage, Enumerable, editFormUtility, authentication, siteMapUrls, navigation) 
		{
			watchResource('financialResources');
			watchResource('countryFinancialResources');
			watchResource('financialMechanisms');
			watchResource('resourceIntiatives');

			//==================================
			//
			//==================================
			$scope.isLoading = function() {
				return $scope.status=="loading";
			}

			//==================================
			//
			//==================================
			$scope.hasError = function(field) {
				return $scope.error!=null;
			}

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
				var qs = $location.search();


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
							government: authentication.user().government ? { identifier: authentication.user().government } : undefined
						};
					});
				}

				promise.then(function(doc) {

					return $scope.getCleanDocument(doc);

				}).then(function(doc) {

					$scope.status = "ready";
					$scope.document = doc;

				}).catch(function(err) {

					$scope.onError(err.data, err.status)
					throw err;

				});
			}

			//==============================
			//
			//==============================
			function watchResource(member) {

				$scope.$watch(function() { 

					return !$scope.document || angular.toJson($scope.document[member]); 

				}, function() {

					if(!$scope.document)
						return;

					//Auto add empty line

					var list = $scope.document[member] = $scope.document[member] || [];

					if(!_.last(list) || !_.isEmpty(_.last(list)))
						list.push({});

					// Clean

					for(var i=0; i<list.length; i++) {

						var item = list[i];

						if(member!="financialMechanisms") {
							if(item.type && !item.type.identifier)
								item.type = undefined;
						}

						if(item.source     && !item.source.identifier    ) item.source     = undefined;
						if(item.category   && !item.category.identifier  ) item.category   = undefined;
						if(item.confidence && !item.confidence.identifier) item.confidence = undefined;
						if(item.year  ===null) item.year   = undefined;
						if(item.amount===null) item.amount = undefined;
						if(item.amount===""  ) item.amount = undefined;
						if($.isNumeric(item.amount))  item.amount = parseInt(item.amount);
					}
				});
			}

			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {

				document = document || $scope.document
				document = angular.fromJson(angular.toJson(document));

				if (document)
				{
					if(document.financialResources) {
						document.financialResources = _.filter(document.financialResources, function(o) { return !_.isEmpty(o) });
						document.financialResources = document.financialResources.length!=0 ? document.financialResources : undefined;
					}

					if(document.countryFinancialResources) {
						document.countryFinancialResources = _.filter(document.countryFinancialResources, function(o) { return !_.isEmpty(o) });
						document.countryFinancialResources = document.countryFinancialResources.length!=0 ? document.countryFinancialResources : undefined;
					}

					if(document.financialMechanisms) {
						document.financialMechanisms = _.filter(document.financialMechanisms, function(o) { return !_.isEmpty(o) });
						document.financialMechanisms = document.financialMechanisms.length!=0 ? document.financialMechanisms : undefined;
					}

					if(document.resourceIntiatives) {
						document.resourceIntiatives = _.filter(document.resourceIntiatives, function(o) { return !_.isEmpty(o) });
						document.resourceIntiatives = document.resourceIntiatives.length!=0 ? document.resourceIntiatives : undefined;
					}

					if (/^\s*$/g.test(document.notes))
						document.notes = undefined;
				}

				return document
			};

			//==================================
			//
			//==================================
			$scope.validate = function() {

				$scope.validationReport = null;

				var oDocument = $scope.getCleanDocument();

				$scope.reviewDocument = angular.fromJson(angular.toJson(oDocument));;

				return storage.documents.validate(oDocument).then(function(success) {

					$scope.validationReport = success.data;
					return !!(success.data && success.data.errors && success.data.errors.length);
					
				}).catch(function(error) {

					$scope.onError(error.data);
					return true;
				});
			}

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if(tab == "general"   )     { $scope.prevTab = "general";        $scope.nextTab = "identification" }
				if(tab == "identification") { $scope.prevTab = "general";        $scope.nextTab = "section1" }
				if(tab == "section1"  )     { $scope.prevTab = "identification"; $scope.nextTab = "section2" }
				if(tab == "section2"  )     { $scope.prevTab = "section1";       $scope.nextTab = "section3" }
				if(tab == "section3"  )     { $scope.prevTab = "section2";       $scope.nextTab = "section4" }
				if(tab == "section4"  )     { $scope.prevTab = "section3";       $scope.nextTab = "section5" }
				if(tab == "section5"  )     { $scope.prevTab = "section4";       $scope.nextTab = "review" }
				if(tab == "review"    )     { $scope.prevTab = "section5";       $scope.nextTab = "review" }

				if (tab == 'review')
					$scope.validate();
			});


			//==================================
			//
			//==================================
			$scope.isFieldValid = function(field) {
				if (field && $scope.validationReport && $scope.validationReport.errors)
					return !Enumerable.From($scope.validationReport.errors).Any(function(x){return x.property==field})

				return true;
			}


			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
			}

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			}

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function(data) {
				$location.url(siteMapUrls.management.workflows);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function(data) {
				$location.url("/database/record?documentID=" + data.documentID);
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				$location.url(siteMapUrls.management.drafts);
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);	
				else
					$location.url(siteMapUrls.management.home);
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
					$scope.error = error.Message
				else
					$scope.error = error;
			}
			
			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record
					var deferred = $q.defer();

					storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							deferred.resolve(r.data);
						}, function(e) {
							if (e.status == 404) {
								storage.drafts.get(identifier, { info: "" })
									.then(function(r) { deferred.resolve(r.data)},
										  function(e) { deferred.reject (e)});
							}
							else {
								deferred.reject (e)
							}
						});
					return deferred.promise;
				}

				//Load all record of specified schema;

				var sQuery = "type eq '" + encodeURI(schema) + "'";

				return $q.all([storage.documents.query(sQuery, null, { cache: true }), 
							   storage.drafts   .query(sQuery, null, { cache: true })])
					.then(function(results) {
						var qResult = Enumerable.From (results[0].data.Items)
												.Union(results[1].data.Items, "$.identifier");
						return qResult.ToArray();
					});
			}


			$scope.directlyRelated             = "4BE226BA-E72F-4A8A-939E-6FCF0FA76CE4";
			$scope.indirectlyRelated           = "4B931A40-8032-41BD-BBD7-B16905E41DF2";
			$scope.direclyAndIndirectlyRelated = "2BBC9278-A50C-4B3C-AF2C-BBC103405DE4";
			$scope.isValidNumber = $.isNumeric;

			//==================================
			//
			//==================================
			$scope.getSum = function (resources, target) {

				if(target) {
					resources = _.filter(resources, function(o) {
						return o && o.category && o.category.identifier==target;
					});
				}

				var values = _.map(resources, function(o) {
					return o.amount||0;
				});

				return values.length 
					 ? _.reduce(values, function(res, val) { return res+val })
					 : 0;
			}

			//==================================
			//
			//==================================
			$scope.confidenceAverage = function (resources) {

				var values = _.compact(_.map(resources, function (resource) {

					if (resource && resource.confidence && resource.confidence.identifier == "D8BC6348-D1F9-4DA4-A8C0-7AE149939ABE") return 3; //high
					if (resource && resource.confidence && resource.confidence.identifier == "42526EE6-68F3-4E8A-BC2B-3BE60DA2EB32") return 2; //medium
					if (resource && resource.confidence && resource.confidence.identifier == "6FBEDE59-88DB-45FB-AACB-13C68406BD67") return 1; //low

					return 0
				}));

				var value = 0;

				if(values.length) {
					value = Math.round(_.reduce(values, function(memo, value) { return memo + value; }) / values.length);
				}

				if ( value == 3) return "High";
				if ( value == 2) return "Medium";
				if ( value == 1) return "Low";

				return "No value selected";
			}
		}]
	}
}])
