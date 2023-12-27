define(['text!./resource.html', 'app', 'angular', 'lodash', 'authentication', '../views/resource', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage'], function(template, app, angular, _) { 'use strict';

app.directive('editResource', ['$http',"$rootScope", "Enumerable", "$filter", "$q", "guid", "$location", "Thesaurus", 'authentication', 'editFormUtility', 'siteMapUrls', 'IStorage', '$route', function ($http, $rootScope, Enumerable, $filter, $q, guid, $location, thesaurus, authentication, editFormUtility, siteMapUrls, storage, $route) {
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
				languages     : function() { return $http.get("/api/v2013/thesaurus/domains/52AFC0EE-7A02-4EFA-9277-8B6C327CE21F/terms", { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				gbfTargets    : function() { return $http.get("/api/v2013/thesaurus/domains/GBF-TARGETS/terms",                          { cache: true }).then(function(o){ return o.data; }); },
				aichiTargets  : function() { return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms",                        { cache: true }).then(function(o){ return o.data; }); },
				absSubjects   : function() { return $http.get("/api/v2013/thesaurus/domains/CA9BBEA9-AAA7-4F2F-B3A3-7ED180DE1924/terms", { cache: true }).then(function(o){ return o.data; }); },
				bchSubjects   : function() { return $http.get("/api/v2013/thesaurus/domains/043C7F0D-2226-4E54-A56F-EE0B74CCC984/terms", { cache: true }).then(function(o){ return o.data; }); },
				bchRaSubjects : function() { return $http.get("/api/v2013/thesaurus/domains/69B43BB5-693B-4ED9-8FE0-95895E144142/terms", { cache: true }).then(function(o){ return o.data; }); },
				ebsaSubjects  : function() { return []; },

				regions       : function() { return $q.all([$http.get("/api/v2013/thesaurus/domains/countries/terms", { cache: true }),
														    $http.get("/api/v2013/thesaurus/domains/regions/terms",   { cache: true })]).then(function(o) {
														    	return Enumerable.From($filter('orderBy')(o[0].data, 'name')).Union(
																	   Enumerable.From($filter('orderBy')(o[1].data, 'name'))).ToArray();
														   }); },

			   resourceTypes   : function() { return $http.get("/api/v2013/thesaurus/domains/A762DF7E-B8D1-40D6-9DAC-D25E48C65528/terms", { cache: true }).then(function(o){ return thesaurus.buildTree(o.data); }); },
			   fileFormats 	   : function() { return $http.get("/api/v2013/thesaurus/domains/D2D97AB3-4D20-41D4-8CBE-B21C33924823/terms", { cache: true }).then(function(o){ return thesaurus.buildTree(o.data); }); },
			   purposes 	   : function() { return $http.get("/api/v2013/thesaurus/domains/E712C9CD-437E-454F-BA72-E7D20E4C28ED/terms", { cache: true }).then(function(o){ return thesaurus.buildTree(o.data); }); },
			   targetGroups    : function() { return $http.get("/api/v2013/thesaurus/domains/AFB155C4-93A6-402C-B812-CFC7488ED651/terms", { cache: true }).then(function(o){ return o.data; }); },
			   expertiseLevels : function() { return $http.get("/api/v2013/thesaurus/domains/1B57D9C3-F5F8-4875-94DC-93E427F3BFD8/terms", { cache: true }).then(function(o){ return o.data; }); },
			   cbdSubjects     : function() { return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",                         { cache: true }).then(function(o){

			   	var subjects = ['CBD-SUBJECT-BIOMES', 'CBD-SUBJECT-CROSS-CUTTING'];
			   	var items = [];

			   		_.forEach(subjects, function(subject) {
			   			var term = _.findWhere(o.data, {'identifier': subject } );

			   			items.push(term);

			   			_(term.narrowerTerms).forEach(function (term) {
			   				items.push(_.findWhere(o.data, {'identifier':term}));
			   			}).value();

			   		});

			   		return items;
			   	});
			   },
			   absKeyAreas : function () {return $http.get("/api/v2013/thesaurus/domains/2B2A5166-F949-4B1E-888F-A7976E76320B/terms", { cache: true }).then(function(o){return o.data;});}

			};

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if (tab == 'review')
					$scope.validate();
			});

			//============================================================
			//
			//============================================================
			$scope.nextTab = function() {
				var next = 'review';

				if($scope.tab=='general') { next = 'chm';   }
				if($scope.tab=='chm' 	) { next = 'absch'; }
				if($scope.tab=='absch'	) { next = 'bch';   }
				if($scope.tab=='bch'	) { next = 'review';}

				$scope.tab = next;
			};

			//============================================================
			//
			//============================================================
			$scope.prevTab = function() {
				var prev;

				if($scope.tab=='review' ) { prev = 'bch'; 	 }
				if($scope.tab=='bch'	) { prev = 'absch';  }
				if($scope.tab=='absch'	) { prev = 'chm'; 	 }
				if($scope.tab=='chm'	) { prev = 'general';}

				$scope.tab = prev;
			};

			//==================================
			//
			//==================================
			$scope.IsCapacityBuilding = function(document) {
				document = document || $scope.document;

				if (!document || !document.purpose)
					return false;

				var purposes = _.map(document.purpose, 'identifier');

				return _.includes(purposes, 'A5C5ADE8-2061-4AB8-8E2D-1E6CFF5DD793') || // Assessing capacity-building needs
					   _.includes(purposes, '3813BA1A-2DE7-4DD5-8415-3B2C6737E567') || // Designing capacity building initiatives
					   _.includes(purposes, '5054AC52-E738-4694-A403-6490FE7D4CF4') || // Monitoring and evaluation of capacity-building initiatives and products
					   _.includes(purposes, '05FA6F66-F942-4713-BB4C-DA032C111188') || // Providing technical guidance
					   _.includes(purposes, '9F48AEA0-EE28-4B6F-AB91-E0E088A8C6B7') || // Raising awareness
					   _.includes(purposes, '5831C357-95CA-4F09-963B-DF9E8AFD8C88');   // Training/learning
			};

			//==================================
			//
			//==================================
			$scope.IsAbs = function(document) {
				document = document || $scope.document;

				if (!document || !document.aichiTargets)
					return false;

				var targets = _.map(document.aichiTargets, 'identifier');

				return _.includes(targets, 'AICHI-TARGET-16');
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

				var identifier = $route.current.params.uid;
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
				$rootScope.$broadcast("onPostWorkflow", "Publishing request sent successfully.");
				gotoManager();
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
				gotoManager();
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
				$rootScope.$broadcast("onPostClose", "Record closed.");
				gotoManager();
			};
			//==================================
			//
			//==================================
			function gotoManager() {
				$location.url("/submit/resource");
			}

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
				return $q.when(true);

				if(!$scope.IsCapacityBuilding()){
					document.targetGroups    = undefined;
					document.expertiseLevels = undefined;
				}

				if(!$scope.IsCapacityBuilding() && !$scope.IsAbs())
					document.absKeyAreas     = undefined;

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
