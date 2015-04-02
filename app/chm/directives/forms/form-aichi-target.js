angular.module('kmApp') // lazy
.directive('editAichiTarget', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/forms/form-aichi-target.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.init();
		},
		controller : ['$scope', "$http", "$q", "$location", "$filter", 'IStorage', "underscore",  "editFormUtility", "navigation", "siteMapUrls", function ($scope, $http, $q, $location, $filter, storage, _, editFormUtility, navigation, siteMapUrls)

		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
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

				var identifier = $location.search().uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "aichiTarget");
				else
					promise = $q.when({}).then(function(doc) {
						throw { error: { data: "Forbidden"}, status : "cannotCreate"};
					});

				promise.then(function(doc) {

					if(!$scope.options)
					{
						$scope.options  = {
			            	strategicPlanIndicators: $http.get("/api/v2013/index", { params: { q:"schema_s:strategicPlanIndicator", fl:"identifier_s, title_t",  sort:"title_t ASC", rows:999999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title:o.title_t }; } ); } ),
							strategicGoals:			 $http.get("/api/v2013/thesaurus/domains/aichiTargetGoals/terms",			{ cache: true }).then(function (o) { return o.data; }),
							linkResourcesCategories: $http.get("/api/v2013/thesaurus/domains/aichiTartgetResourceTypes/terms",	{ cache: true }).then(function (o) { return o.data; }),
							targetChampionsRegions:	 $q.all([$http.get("/api/v2013/thesaurus/domains/countries/terms",			{ cache: true }),
															 $http.get("/api/v2013/thesaurus/domains/regions/terms",            { cache: true })]).then(function(o) {
								return _.union(_.sortBy(o[0].data, function(o){ return o.name }),
											   _.sortBy(o[1].data, function(o){ return o.name }));
							})
						};
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

				if (document.champions) {

					for (var i = 0; i < document.champions.length; i++) {
						var champion = document.champions[i];
						if (jQuery.isEmptyObject(champion)) {
							$scope.removeChampion(document.champions, champion);
						}
					}

					if (document.champions.length == 0) {
						document.champions = undefined;
					}
				}

				if (document.resources) {

					for (var i = 0; i < document.resources.length; i++) {
						var resource = document.resources[i];
						if (jQuery.isEmptyObject(resource)) {
							$scope.removeResource(document.resources, resource);
						}
					}

					if (document.resources.length == 0) {
						document.resources = undefined;
					}
				}

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return document;
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
			$scope.$watch('tab', function(tab) {
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
				$location.url('management/list/aichiTarget');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				$location.url('management/list/aichiTarget');
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('management/list/aichiTarget');
			};

			//==================================
			//
			//==================================
			$scope.onError = function(error, status)
			{
				$scope.status = "error";

				if (status == "cannotCreate") {
					$scope.status = "hidden";
					$scope.error  = "A new aichi target cannot be created";
				}
				else if (status == "notAuthorized") {
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

					oDocs = _.filter(oDocs, function(o) { return !_.contains(oDraftUIDs, o.identifier)});

					return _.union(oDocs, oDrafts);
				});
			}

			//==================================
			//
			//==================================
			$scope.addNewChampion = function() {
				if(!$scope.document)
					return;

				if (!$scope.document.champions)
					$scope.document.champions = [];

				$scope.document.champions.push({});
			}

			//====================
			//
			//====================
			$scope.removeChampion = function (champions, champion) {

				if(!champions)
					return;

				var index = champions.indexOf(champion);

				if (index >= 0)
					champions.splice(index, 1);

			};

			//==================================
			//
			//==================================
			$scope.addNewResource = function () {

				if(!$scope.document)
					return;

				if (!$scope.document.resources)
					$scope.document.resources = [];

				$scope.document.resources.push(new Object());
			}

			//====================
			//
			//====================
			$scope.removeResource = function (resources, resource) {

				if(!resource)
					return;

				var index = resources.indexOf(resource);

				if (index >= 0)
					resources.splice(index, 1);

			};
		}]
	}
}]);
