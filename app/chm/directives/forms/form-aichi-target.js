var module = angular.module('kmApp').compileProvider; // lazy

module.directive('editAichiTarget', ['authHttp', "URI", "$filter", "$q", "guid", function ($http, URI, $filter, $q, guid) {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/abs/directives/forms/aichiTarget.html', // edit-aichi-target.partial.html',
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope, $element)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.review   = { locale : "en" };
			$scope.options  = {
				strategicGoal:				function () { return $http.get("/api/v2013/thesaurus/domains/aichiTargetGoals/terms",			{ cache: true }).then(function (o) { return o.data; }); },
				relevantIndicators:			function () { return $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms",				{ cache: true }).then(function (o) { return o.data; }); },
				otherIndicators:			function () { return $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms",				{ cache: true }).then(function (o) { return o.data; }); },
				targetChampionsRegions:		function () { return $q.all([$http.get("/api/v2013/thesaurus/domains/countries/terms",			{ cache: true }), 
															$http.get("/api/v2013/thesaurus/domains/regions/terms",   { cache: true })]).then(function(o) {
																return Enumerable.From($filter('orderBy')(o[0].data, 'name')).Union(
																	   Enumerable.From($filter('orderBy')(o[1].data, 'name'))).ToArray();
															}) },
				linkResourcesCategories:	function () { return $http.get("/api/v2013/thesaurus/domains/aichiTartgetResourceTypes/terms",	{ cache: true }).then(function (o) { return o.data; }); },
			};

			$element.find('a[data-toggle="tab"]').on('shown', function(e) {
				var onTabFn = function() { $scope.onTab($(e.target).attr('href').replace("#", "")); };
				if ($scope.$root.$$phase == '$apply' || $scope.$root.$$phase == '$digest')
					onTabFn()
				else
					$scope.$apply(onTabFn);
			});

			$scope.init();
		},
		controller : ['$scope', "$q", 'IStorage', "authentication", "Enumerable", "editFormUtility", function ($scope, $q, storage, authentication, Enumerable, editFormUtility) 
		{
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
				if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = URI().search(true).uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "aichiTarget");
				else
					promise = $q.when({}).then(function(doc) {
						throw { error: { data: "Forbidden"}, status : "notAuthorized"};
					});


				promise.then(
					function(doc) {
						$scope.status = "ready";
						$scope.document = doc;
					}).then(null, 
					function(err) {
						$scope.onError(err.data, err.status)
						throw err;
					});
			}


			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
					return $q.when(true);

				for (var i = 0; i < document.champions.length; i++) {
					var champion = document.champions[i];
					if (jQuery.isEmptyObject(champion)) {
						$scope.removeChampion(document.champions, champion);
					}
				}
				if (document.champions.length == 0) {
					document.champions = undefined;
				}
				for (var i = 0; i < document.resources.length; i++) {
					var resource = document.resources[i];
					if (jQuery.isEmptyObject(resource)) {
						$scope.removeResource(document.resources, resource);
					}
				}
				if (document.resources.length == 0) {
					document.resources = undefined;
				}

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return $q.when(false);
			};

			//==================================
			//
			//==================================
			$scope.validate = function(clone) {

				$scope.validationReport = null;

				var oDocument = $scope.document;

				if (clone !== false)
					oDocument = angular.fromJson(angular.toJson(oDocument));

				return $scope.cleanUp(oDocument).then(function(cleanUpError) {
					return storage.documents.validate(oDocument).then(
						function(success) {
							$scope.validationReport = success.data;
							return cleanUpError || !!(success.data && success.data.errors && success.data.errors.length);
						},
						function(error) {
							$scope.onError(error.data);
							return true;
						}
					);
				});
			}

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
			$scope.tab = function(tab, show) {

				var oTabNames    = [];
				var sActiveTab   = $('.tab-content:first > .tab-pane.active').attr("id");
				var qActiveTab   = $('#editFormPager a[data-toggle="tab"]:not(:first):not(:last)').filter('[href="#'+sActiveTab+'"]');

				if (tab == "-") tab = (qActiveTab.prevAll(":not(:hidden):not(:last)").attr("href")||"").replace("#", "");
				if (tab == "+") tab = (qActiveTab.nextAll(":not(:hidden):not(:last)").attr("href")||"").replace("#", "");

				if(!tab)
					return undefined;

				if (show)
					$('#editFormPager a[data-toggle="tab"][href="#review"]:first').tab('show');

				return {
					'name' : tab,
					'active': sActiveTab == tab
				}
			}

			//==================================
			//
			//==================================
			$scope.onTab  = function(tab) {
				var fn = function() {
					if (tab == 'review')
						$scope.validate();

					if (!$('body').is(":animated"))
						$('body').stop().animate({ scrollTop: 0 }, 600);
				};

				if ($scope.$root.$$phase == '$apply' || $scope.$root.$$phase == '$digest')
					fn();
				else
					$scope.$apply(fn);
			}

			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
				return $scope.cleanUp();
			}

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab("review", true)
					return hasError;
				});
			}

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function(data) {
				window.location = "/managementcentre/my-pending-items";
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function(data) {
				window.location = "/managementcentre/edit/";
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				window.location = "/managementcentre/edit-draft/";
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				window.location = "/managementcentre/";
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

			//==================================
			//
			//==================================
			$scope.addNewChampion = function()
			{
				if (!$scope.document.champions) {
					$scope.document.champions = [];
				}
				$scope.document.champions.push(new Object());
			}

			//====================
			//
			//====================
			$scope.removeChampion = function (champions, champion) {
				var index = champions.indexOf(champion);

				if (index >= 0)
					champions.splice(index, 1);

			};

			//==================================
			//
			//==================================
			$scope.addNewResource = function () {
				if (!$scope.document.resources) {
					$scope.document.resources = [];
				}
				$scope.document.resources.push(new Object());
			}

			//====================
			//
			//====================
			$scope.removeResource = function (resources, resource) {
				var index = resources.indexOf(resource);

				if (index >= 0)
					resources.splice(index, 1);

			};

		}]
	}
}]);