angular.module('kmApp') // lazy
.directive('editMarineEbsa', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-marine-ebsa.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.init();
		},
		controller : ['$scope', "$http", "$q", "$location", "$filter", 'IStorage', "underscore",  "editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", function ($scope, $http, $q, $location, $filter, storage, _, editFormUtility, navigation, authentication, siteMapUrls, Thesaurus, guid)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = "general";
			$scope.review   = { locale : "en" };

			// Ensure user as signed in
			navigation.securize();

			//==================================
			//
			//==================================
			$scope.init = function() {

				if ($scope.document)
					return;

				$scope.status = "loading";

				var promise = null;
				var schema  = "marineEbsa";
				var qs      = $location.search();

				if(qs.uid) { // Load
					promise = editFormUtility.load(qs.uid, schema);
				}
				else { // Create

					promise = $q.when(guid()).then(function(identifier) {
						return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {

							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							return identifier;
						})
						;
					}).then(function(identifier) {

						return {
							header: {
								identifier: identifier,
								schema   : schema,
								languages: ["en"]
							}
						};
					});
				}

				return promise.then(function(doc) {

					if(!$scope.options)	{
						$scope.options  = {
							countries     : $http.get("/api/v2013/thesaurus/domains/countries/terms",            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
							libraries     : $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms",         { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
							copDecisions  : $http.get("/api/v2013/index/select?q=schema_s%3Adecision+AND+body_s%3ACOP&sort=event_s+desc%2Cdecision_s+asc&rows=999999&fl=title_t%2C+decision_s%2C+symbol_s", { cache: true })
												 .then(function(res) {
												 	return _.map(res.data.response.docs, function(o) {
												 		return {
												 			identifier: o.decision_s,
												 			title: (o.decision_s + " - " + o.title_t)
												 		}
												 	});
												 })
						}
					}

			        return doc;

				}).then(function(doc) {

					$scope.status = "ready";
					$scope.document = doc;

				}).catch(function(err) {

					$scope.onError(err.data, err.status)
					throw err;

				});
			}

			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return undefined

				document = angular.fromJson(angular.toJson(document));

				if (document.approvedByGovernmentOn && document.approvedByGovernmentOn.indexOf('0001') == 0)
					document.approvedByGovernmentOn = undefined;

				if (document.recommendedToCopByGovernmentOn && document.recommendedToCopByGovernmentOn.indexOf('0001') == 0)
					document.recommendedToCopByGovernmentOn = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return document
			};

			//==================================
			//
			//==================================
			$scope.validate = function(clone) {

				$scope.validationReport = null;

				var oDocument = $scope.reviewDocument = $scope.getCleanDocument();

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
			$scope.$watch("document.gisFiles", function() {

				var qLinks = [];
				var qGis   = [];

				if ($scope.document)
					qLinks = $scope.document.gisFiles || [];

				angular.forEach(qLinks, function(link){
					qGis.push($http.get(link.url).then(function(res) { return L.geoJson(res.data) }));
				});

				$q.all(qGis).then(function(layers) {
					$scope.gisLayer = layers;
				})
			});

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if(tab == "general"   ) { $scope.prevTab = "general";    $scope.nextTab = "status" }
				if(tab == "status"    ) { $scope.prevTab = "general";    $scope.nextTab = "assessment" }
				if(tab == "assessment") { $scope.prevTab = "status";     $scope.nextTab = "review" }
				if(tab == "review"    ) { $scope.prevTab = "assessment"; $scope.nextTab = "review" }

				if (tab == 'review')
					$scope.validate();

			});

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
				$location.url('/management/list/marineEbsa');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				$location.url('/management/list/marineEbsa');
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('/management/list/marineEbsa');
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

				if (identifier) //lookup single record
					return storage.documents.get(identifier, { info: "" })
						                    .then(function(res) {
						                    	return res.data;
						                    });

				//Load all record of specified schema;

				return storage.documents.query("type eq '" + encodeURI(schema) + "'", null, { cache: true })
									    .then(function(res) {
									    	return res.data.Items;
									    });
			}
		}]
	}
}])

.directive('marineEbsaAssessment', [ function () {
	return {
		restrict   : 'EAC',
		templateUrl: "marine-ebsa-assessment.html",
		replace    : true,
		transclude : false,
		scope: {
			binding : "=ngModel",
			locales : "="
		},
		link : function($scope, $element)
		{
			$scope.assessments = [
				{ selected: false, code: "criteria1", title: "C1: Uniqueness or rarity" },
				{ selected: false, code: "criteria2", title: "C2: Special importance for life-history stages of species" },
				{ selected: false, code: "criteria3", title: "C3: Importance for threatened, endangered or declining species and/or habitats" },
				{ selected: false, code: "criteria4", title: "C4: Vulnerability, fragility, sensitivity, or slow recovery" },
				{ selected: false, code: "criteria5", title: "C5: Biological productivity" },
				{ selected: false, code: "criteria6", title: "C6: Biological diversity" },
				{ selected: false, code: "criteria7", title: "C7: Naturalness" }
			];

			$scope.$watch("binding", $scope.load);
			$scope.$watch(function(){ return angular.toJson($scope.assessments);}, $scope.save);
		},
		controller : ['$scope', "Enumerable", function ($scope, Enumerable)
		{
			//==================================
			//
			//==================================
			$scope.load = function() {
				var qBinding = Enumerable.From($scope.binding || []);

				angular.forEach($scope.assessments, function(criteria, key) {
					var oBindingCriteria = qBinding.FirstOrDefault(undefined, function(o) { return o.identifier == criteria.code });

					var oSelected      = !!oBindingCriteria;
					var oLevel         = (oBindingCriteria || {}).level;
					var oJustification = (oBindingCriteria || {}).justification;

					if (!angular.equals(criteria.selected,      oSelected))      criteria.selected      = oSelected;
					if (!angular.equals(criteria.level,         oLevel))         criteria.level         = oLevel;
					if (!angular.equals(criteria.justification, oJustification)) criteria.justification = oJustification;
				});
			}

			//==================================
			//
			//==================================
			$scope.save = function() {
				var oBinding = [];

				angular.forEach($scope.assessments, function(criteria, key) {

					if (!criteria.selected)
						return;

					oBinding.push({
						identifier    : criteria.code,
						level         : criteria.level,
						justification : criteria.justification
					})
				});

				if (jQuery.isEmptyObject(oBinding))
					oBinding = undefined;

				$scope.binding = oBinding;
			}
		}]
	}
}])
