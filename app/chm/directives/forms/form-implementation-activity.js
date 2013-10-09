var module = angular.module('kmApp').compileProvider; // lazy

module.directive("editImplementationActivity", ['authHttp', "$q", "$filter", "URI", "IStorage", function ($http, $q, $filter, URI, storage) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/forms/form-implementation-activity.partial.html',
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope, $element) {
            $scope.status = "";
            $scope.error = null;
            $scope.document = null;
            $scope.review = { locale: "en" };
            $scope.options = {
            	countries:          $http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
            	jurisdictions:      $http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms", { cache: true }).then(function (o) { return o.data; }),
            	statuses:           $http.get("/api/v2013/thesaurus/domains/Capacity%20Building%20Project%20Status/terms", { cache: true }).then(function (o) { return o.data; }),
            	aichiTargets:       $http.get("/api/v2013/index", { params: { q:"schema_s:aichiTarget", fl:"identifier_s,title_t,number_d",  sort:"number_d ASC", rows:999999 }}).then(function(o) { return _.map(o.data.response.docs, function(o) { return { identifier:o.identifier_s, title : o.number_d  +" - "+ o.title_t } })}).then(null, $scope.onError),
                nationalIndicators: [],
                nationalTargets:    []
            };

            $scope.$watch("document.government", function(term) {

            	$scope.options.nationalIndicators = [];
            	$scope.options.nationalTargets = [];

            	if (term) {

            		var buidQueryFn = function(schema) {
            			return {
            				q: "schema_s:" + schema + " AND government_s:" + term.identifier,
            				fl: "identifier_s,title_t",
            				sort: "title_s ASC",
							rows:99999999
            			}
            		}

            		var mapResultFn = function(res) {
            			return _.map(res.data.response.docs, function(o) {
            				return {
            					identifier: o.identifier_s,
            					title: o.title_t
            				}
            			});
            		};

            		$scope.options.nationalIndicators = $http.get("/api/v2013/index", { params: buidQueryFn("nationalIndicator")      }).then(mapResultFn).then(null, $scope.onError);
            		$scope.options.nationalTargets    = $http.get("/api/v2013/index", { params: buidQueryFn("nationalTarget")         }).then(mapResultFn).then(null, $scope.onError);
            	}
            });

			$element.find('a[data-toggle="tab"]').on('shown.bs.tab', function(e) {
				var onTabFn = function() { $scope.onTab($(e.target).attr('href').replace("#", "")); };
				if ($scope.$root.$$phase == '$apply' || $scope.$root.$$phase == '$digest')
					onTabFn()
				else
					$scope.$apply(onTabFn);
			});

            $scope.init();
        },
		controller : ['$scope', "$q", 'IStorage', "authentication", "editFormUtility", "guid", "$location", function ($scope, $q, storage, authentication, editFormUtility, guid, $location) {

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
					promise = editFormUtility.load(identifier, "implementationActivity");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "implementationActivity",
							languages: ["en"]
						},
						government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined,
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
			$scope.isJurisdictionSubNational = function(document) {

				document = document || $scope.document;

				return !!document && !!document.jurisdiction && document.jurisdiction.identifier == "DEBB019D-8647-40EC-8AE5-10CA88572F6E";
			}

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {

				document = document || $scope.document;

				if (!document)
					return $q.when(true);

				if (!$scope.isJurisdictionSubNational(document))
					document.jurisdictionInfo = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return $q.when(false);
			};

			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record

					return storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							return r.data
						})
						//otherwise
						.then(null, function(e) {
							if (e.status != 404)
								throw e;

							return storage.drafts.get(identifier, { info: "" })
								.then(function(r) {
									deferred.resolve(r.data)
								});
						});
				}
				else { //Load all record of specified schema;

					var sQuery = "type eq '" + encodeURI(schema) + "'";

					return $q.all([storage.documents.query(sQuery, null, { cache: true }),
								   storage.drafts.query(sQuery, null, { cache: true })])
						.then(function(results) {
							var qDocs = results[0].data.Items;
							var qDrafts = results[1].data.Items;
							var qUids = _.pluck(qDocs, "identifier");

							return _.union(qDocs, _.filter(qDrafts, function(draft) {
								return qUids.indexOf(draft.identifier);
							}));
						});
				}
			}

			
			//======================================================================
			//======================================================================
			//======================================================================
			//======================================================================
			//======================================================================

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
				if (field && $scope.validationReport && $scope.validationReport.errors) {
					return !_.findWhere($scope.validationReport.errors, { property: field });
				}

				return true;
			}

			//==================================
            //
            //==================================
            $scope.isLoading = function () {
                return $scope.status == "loading";
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
			$scope.userGovernment = function() {
				return authentication.user().government;
			};

			//==================================
			//
			//==================================
			$scope.defaultGovernment = function() {

				var qsGovernment = new URI().search(true).government;

				if (qsGovernment)
					qsGovernment = qsGovernment.toLowerCase()

				return $scope.userGovernment() || qsGovernment;
			};

			//==================================
			//
			//==================================
			$scope.tab = function(tab, show) {

				var oTabNames    = [];
				var sActiveTab   = $('.tab-content:first > .tab-pane.active').attr("id");
				var qActiveTab   = $('#editFormPager:first a[data-toggle="tab"]:not(:first):not(:last)').filter('[href="#'+sActiveTab+'"]');

				if (tab == "-") tab = (qActiveTab.prevAll(":not(:hidden):not(:last)").attr("href")||"").replace("#", "");
				if (tab == "+") tab = (qActiveTab.nextAll(":not(:hidden):not(:last)").attr("href")||"").replace("#", "");

				if(!tab)
					return undefined;

				if (show)
					$('#editFormPager:first a[data-toggle="tab"][href="#review"]:first').tab('show');

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
				gotoManager();
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function(data) {
				gotoManager();
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				gotoManager();
			};

			//==================================
			//
			//==================================
			function gotoManager() { 
				$location.url("/management/national-reporting" + ($scope.document.government ? "?country=" + $scope.document.government.identifier.toUpperCase() : ""));
			}

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
        }]
    }
}]);