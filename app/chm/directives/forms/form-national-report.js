angular.module('kmApp').compileProvider // lazy
.directive("editNationalReport", ['authHttp', "$q", "$filter", "URI", "IStorage", "Thesaurus", function ($http, $q, $filter, URI, storage, thesaurus) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/forms/form-national-report.partial.html',
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope, $element) {
            $scope.status = "";
            $scope.error = null;
            $scope.document = null;
            $scope.review = { locale: "en" };

            $element.find('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            	var onTabFn = function () { $scope.onTab($(e.target).attr('href').replace("#", "")); };
            	if ($scope.$root.$$phase == '$apply' || $scope.$root.$$phase == '$digest')
            		onTabFn()
            	else
            		$scope.$apply(onTabFn);
            });

            $scope.init();
        },
		controller : ['$scope', "$q", 'IStorage', "authentication", "editFormUtility", "guid", "$location", 'ngProgress', function ($scope, $q, storage, authentication, editFormUtility, guid, $location, ngProgress) {

			$scope.qs = $location.search();

			//==================================
			//
			//==================================
			$scope.init = function() {
				if ($scope.document)
					return;

				ngProgress.start();

				$scope.status = "loading";

				var qs = $scope.qs;
				var identifier  = qs.uid;
				var year        = qs.year;
				var reportType  = qs.reportType;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "nationalReport");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "nationalReport",
							languages: ["en"],
						},
						government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined,
						reportType: reportType ? { identifier: reportType } : undefined
					});

				promise.then(function(doc) {
					
					if(!$scope.options) {
							
			            $scope.options = {
			                countries:		$http.get("/api/v2013/thesaurus/domains/countries/terms",								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
			                jurisdictions:	$http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                approvedStatus:	$http.get("/api/v2013/thesaurus/domains/E27760AB-4F87-4FBB-A8EA-927BDE375B48/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                approvingBody:	$http.get("/api/v2013/thesaurus/domains/F1A5BFF1-F555-40D1-A24C-BBE1BE8E82BF/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                reportStatus:	$http.get("/api/v2013/thesaurus/domains/7F0D898A-6BF1-4CE6-AA77-7FEAED3429C6/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                reportTypes:	$http.get("/api/v2013/thesaurus/domains/2FD0C77B-D30B-42BC-8049-8C62D898A193/terms",	{ cache: true }).then(function (o) { return thesaurus.buildTree(o.data); })
			            }

			            return $q.all(_.values($scope.options)).then(function() {
			            	return doc;
			            });
			        }

			        return doc;
				}).then(function(doc) {

					$scope.status = "ready";
					$scope.document = doc;

				}).catch(function(err) {

					$scope.onError(err.data, err.status)
					throw err;

				}).finally(function() {

					ngProgress.complete();

				});
			}

			//==================================
			//
			//==================================
			$scope.hasAdoptionDate = function (document) {

				document = document || $scope.document;

				return !!document && !!document.status && (
					document.status.identifier == "1C37E358-5295-46EB-816C-0A7EF2437EC9" ||
					document.status.identifier == "851B10ED-AE62-4F28-B178-6D40389CC8DB");
			}

			//==================================
			//
			//==================================
			$scope.hasApprovedStatus = function (document) {

				document = document || $scope.document;

				return !!document && !!document.status && document.status.identifier == "851B10ED-AE62-4F28-B178-6D40389CC8DB";
			}

			//==================================
			//
			//==================================
			$scope.hasApprovedStatusInfo = function (document) {

				document = document || $scope.document;

				return !!document && !!document.approvingBody && (
					document.approvingBody.identifier == "D3A4624E-21D9-4E49-953F-529734538E56" ||
					document.approvingBody.identifier == "E7398F2B-FA36-4F42-85C2-5D0044440476" ||
					document.approvingBody.identifier == "905C1F7F-C2F4-4DCE-A94E-BE6D6CE6E78F");
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
					document.jurisdictionInfo  = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;
				if (!$scope.hasAdoptionDate(document)) {
					document.adoptionDate      = undefined;
				}
				if (!$scope.hasApprovedStatus(document)) {
					document.approvedStatus    = undefined;
					document.approvingBody     = undefined;
					document.approvingBodyInfo = undefined;
				}

				if (!$scope.hasApprovedStatusInfo(document)) {
					document.approvingBodyInfo = undefined;
				}

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
				$scope.reviewedDocument = oDocument;

				return $scope.cleanUp(oDocument).then(function (cleanUpError) {
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
					return !_.findWhere($scope.validationReport.errors, { property: field });

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
}])