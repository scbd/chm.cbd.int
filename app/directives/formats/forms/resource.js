define(['text!./resource.html', 'app', 'angular', 'authentication', '../views/resource', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage'], function(template, app, angular) { 'use strict';

app.directive('editResource', ['$http', "Enumerable", "$filter", "$q", "guid", "$location", "Thesaurus", 'authentication', 'editFormUtility', 'siteMapUrls', 'IStorage', function ($http, Enumerable, $filter, $q, guid, $location, thesaurus, authentication, editFormUtility, siteMapUrls, storage) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {},
		link : function($scope)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = 'general';
			$scope.review   = { locale: "en" };
			$scope.options  = {
				libraries     : function() { return $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms",                         { cache: true }).then(function(o){ return Enumerable.From(o.data).Where("$.identifier!='cbdLibrary:bch'").ToArray();});},
				languages     : function() { return $http.get("/api/v2013/thesaurus/domains/52AFC0EE-7A02-4EFA-9277-8B6C327CE21F/terms", { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				resourceTypes : function() { return $http.get("/api/v2013/thesaurus/domains/83BA4728-A843-442B-9664-705F55A8EC52/terms", { cache: true }).then(function(o){ return thesaurus.buildTree(o.data); }); },
				cbdSubjects   : function() { return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",                         { cache: true }).then(function(o){ return o.data; }); },
				aichiTargets  : function() { return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms",                        { cache: true }).then(function(o){ return o.data; }); },
				absSubjects   : function() { return $http.get("/api/v2013/thesaurus/domains/CA9BBEA9-AAA7-4F2F-B3A3-7ED180DE1924/terms", { cache: true }).then(function(o){ return o.data; }); },
				bchSubjects   : function() { return $http.get("/api/v2013/thesaurus/domains/043C7F0D-2226-4E54-A56F-EE0B74CCC984/terms", { cache: true }).then(function(o){ return o.data; }); },
				bchRaSubjects : function() { return $http.get("/api/v2013/thesaurus/domains/69B43BB5-693B-4ED9-8FE0-95895E144142/terms", { cache: true }).then(function(o){ return o.data; }); },
				ebsaSubjects  : function() { return []; },
				regions       : function() { return $q.all([$http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }),
														    $http.get("/api/v2013/thesaurus/domains/regions/terms",   { cache: true })]).then(function(o) {
														    	return Enumerable.From($filter('orderBy')(o[0].data, 'name')).Union(
																	   Enumerable.From($filter('orderBy')(o[1].data, 'name'))).ToArray();
														   }); }
			};

			$scope.$watch("document.libraries", $scope.refreshTabs);


			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;


				if (tab == 'review')
					$scope.validate();

			});


			//==================================
			//
			//==================================
			$scope.nextTab = function() {
				if($scope.tab=='general') {
					if($scope.isInLibrary('chm'))					{ $scope.tab = 'chm'; 		}
					else if($scope.isInLibrary('absch'))			{ $scope.tab = 'absch'; 	}
					else if($scope.isInLibrary('bch-disabled'))		{ $scope.tab = 'bch'; 		}
					else if($scope.isInLibrary('ebsa-disabled'))	{ $scope.tab = 'ebsa'; 		}
					else											{ $scope.tab = 'review';	}
				}
				else if($scope.tab=='chm') {
					if($scope.isInLibrary('absch'))					{ $scope.tab = 'absch'; 	}
					else if($scope.isInLibrary('bch-disabled'))		{ $scope.tab = 'bch'; 		}
					else if($scope.isInLibrary('ebsa-disabled'))	{ $scope.tab = 'ebsa'; 		}
					else											{ $scope.tab = 'review';	}
				}
				else if($scope.tab=='absch') {
					if($scope.isInLibrary('bch-disabled'))			{ $scope.tab = 'bch'; 		}
					else if($scope.isInLibrary('ebsa-disabled'))	{ $scope.tab = 'ebsa'; 		}
					else											{ $scope.tab = 'review';	}
				}
				else if($scope.tab=='bch-disabled') {
					if($scope.isInLibrary('ebsa-disabled'))			{ $scope.tab = 'ebsa'; 		}
					else											{ $scope.tab = 'review';	}
				}
				else if($scope.tab=='ebsa-disabled') {
					$scope.tab = 'review';
				}
			};

			//==================================
			//
			//==================================
			$scope.prevTab = function() {
				if($scope.tab=='review') {
					if($scope.isInLibrary('ebsa-disabled'))			{ $scope.tab = 'ebsa'; 		}
					else if($scope.isInLibrary('bch-disabled'))		{ $scope.tab = 'bch'; 		}
					else if($scope.isInLibrary('absch'))			{ $scope.tab = 'absch'; 	}
					else if($scope.isInLibrary('chm'))				{ $scope.tab = 'chm'; 		}
					else											{ $scope.tab = 'general';	}
				}
				else if($scope.tab=='ebsa-disabled') {
					if($scope.isInLibrary('bch-disabled'))			{ $scope.tab = 'bch'; 		}
					else if($scope.isInLibrary('absch'))			{ $scope.tab = 'absch'; 	}
					else if($scope.isInLibrary('chm'))				{ $scope.tab = 'chm'; 		}
					else											{ $scope.tab = 'general';	}
				}
				else if($scope.tab=='bch-disabled') {
					if($scope.isInLibrary('absch'))					{ $scope.tab = 'absch'; 	}
					else if($scope.isInLibrary('chm'))				{ $scope.tab = 'chm'; 		}
					else											{ $scope.tab = 'general';	}
				}
				else if($scope.tab=='absch') {
					if($scope.isInLibrary('chm'))				{ $scope.tab = 'chm'; 		}
					else											{ $scope.tab = 'general';	}
				}
				else if($scope.tab=='chm') {
					$scope.tab = 'general';
				}
			};

			//==================================
			//
			//==================================
			$scope.isInLibrary = function(name, document) {
				document = document || $scope.document;

				if (!document || !document.libraries)
					return false;

				var qLibraries = Enumerable.From(document.libraries);

				if(name=="chm"  ) return qLibraries.Any(function(o){ return o.identifier == "cbdLibrary:chm"    ;});
				if(name=="absch") return qLibraries.Any(function(o){ return o.identifier == "cbdLibrary:abs-ch" ;});
				if(name=="bch"  ) return qLibraries.Any(function(o){ return o.identifier == "cbdLibrary:bch"    ;});
				if(name=="ebsa" ) return qLibraries.Any(function(o){ return o.identifier == "cbdLibrary:ebsa"   ;});

				return false;
			};

			//==================================
			//
			//==================================
			$scope.IsBchRa = function(document) {
				document = document || $scope.document;

				if (!document || !document.bchSubjects)
					return false;

				var qLibraries = Enumerable.From(document.bchSubjects);

				return qLibraries.Any(function(o) {
					return o.identifier == "FBAF958B-14BF-45DD-BC6D-D34A9953BCEF"  || //Risk assessment
					       o.identifier == "6F28D3FB-7CCE-4FD0-8C29-FB0306C52BD0";    //Risk assessment and risk management
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
			$scope.userGovernment = function() {
				return authentication.user().government;
			};

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
					promise = editFormUtility.load(identifier, "resource");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "resource",
							languages: ["en"]
						}
					});


				promise.then(
					function(doc) {
						$scope.status = "ready";
						$scope.document = doc;
					}).then(null,
					function(err) {
						$scope.onError(err.data, err.status);
						throw err;
					});
			};

			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
				return $scope.cleanUp();
			};

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			};

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function() {
				$location.url(siteMapUrls.management.workflows);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$location.url('/management/list/resource');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				$location.url('/management/list/resource');
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('/management/list/resource');
			};

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
				return $q.when(true);

				if (!$scope.isInLibrary("absch", document)) {
					document.absSubjects = undefined;
				}

				if (!$scope.isInLibrary("bch", document)) {
					document.bchSubjects       = undefined;
					document.bchRaRecommend    = undefined;
					document.bchRaSubjects     = undefined;
					document.bchRaForLmo       = undefined;
					document.organisms         = undefined;
					document.genes             = undefined;
					document.modifiedOrganisms = undefined;
				}

				if (!$scope.isInLibrary("chm", document)) {
					document.cbdSubjects  = undefined;
					document.aichiTargets = undefined;
				}

				if (!$scope.isInLibrary("ebsa", document)) {
					document.ebsaSubjects = undefined;
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
					var deferred = $q.defer();

					storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							deferred.resolve(r.data);
						}, function(e) {
							if (e.status == 404) {
								storage.drafts.get(identifier, { info: "" })
									.then(function(r) { deferred.resolve(r.data);},
										  function(e) { deferred.reject (e);});
							}
							else {
								deferred.reject (e);
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
			};

			$scope.init();
		}
	};
}]);
});
