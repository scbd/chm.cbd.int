define(['text!./capacity-building-initiative.html', 'app', 'angular', 'lodash', 'authentication', '../views/capacity-building-initiative', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage'], function(template, app, angular, _) { 'use strict';

app.directive('editCapacityBuildingInitiative', ["$http","$rootScope", "Enumerable", "$filter", "$q", "guid", "$location", "Thesaurus", "authentication", "editFormUtility", "siteMapUrls", "IStorage", "$route", function ($http, $rootScope, Enumerable, $filter, $q, guid, $location, Thesaurus, authentication, editFormUtility, siteMapUrls, storage, $route) {
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
			$scope.countryRegions		= {};
			$scope.options  = {
				activityScope : function() { return $http.get("/api/v2013/thesaurus/domains/5CA7AACE-CB79-4146-BF12-B3B1955AFF17/terms", { cache: true }).then(function(o){ return o.data; }); },
				libraries     : function() { return $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms",                         { cache: true }).then(function(o){ return Enumerable.From(o.data).Where("$.identifier!='cbdLibrary:bch'").ToArray();});},
				languages     : function() { return $http.get("/api/v2013/thesaurus/domains/52AFC0EE-7A02-4EFA-9277-8B6C327CE21F/terms", { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }); },
				cbiTypes : function() { return $http.get("/api/v2013/thesaurus/domains/D935D0C8-F5A5-43B8-9E06-45A57BF3C731/terms", 	 { cache: true }).then(function(o){ return Thesaurus.buildTree(o.data); }); },

				cbdSubjects   : function() { return $http.get("/api/v2013/thesaurus/domains/CBD-SUBJECTS/terms",                         { cache: true }).then(function(o){

					var subjects = ['CBD-SUBJECT-BIOMES', 'CBD-SUBJECT-CROSS-CUTTING'];
					var items = [];

					_(subjects).forEach(function(subject) {
					  	// each selected item in the array
						var term = _.findWhere(o.data, {'identifier': subject } );

						items.push(term);

						_(term.narrowerTerms).forEach(function (term) {
							items.push(_.findWhere(o.data, {'identifier':term}));
						}).value();

					}).value();

					return items;
				});
			},
				bchSubjects   : function() { return $http.get("/api/v2013/thesaurus/domains/043C7F0D-2226-4E54-A56F-EE0B74CCC984/terms", { cache: true }).then(function(o){ return o.data; }); },
				regions       : function() { return $q.when($http.get("/api/v2013/thesaurus/domains/regions/terms",   { cache: true })).then(function(o) {
														    	return Enumerable.From($filter('orderBy')(o.data, 'name')).ToArray();
														   }); },
				countries: function() {
					return $q.when($http.get("/api/v2013/thesaurus/domains/countries/terms", {cache: true})).then(function(o) {
						return Enumerable.From($filter("orderBy")(o.data, "name")).ToArray();
					});
				},
			    status : function () {
					 return $http.get("/api/v2013/thesaurus/domains/4E7731C7-791E-46E9-A579-7272AF261FED/terms", { cache: true })
					 .then(function(o){
						 return Thesaurus.buildTree(o.data);
					 });
				},
				categories : function () {
				  	return $http.get("/api/v2013/thesaurus/domains/579F448B-ECA8-4258-B130-3EAA68056D1F/terms", { cache: true })
				  	.then(function(o){
					  return Thesaurus.buildTree(o.data);
				  	});
				},
				fundingSources : function () {
					return $http.get("/api/v2013/thesaurus/domains/Capacity Building Project Funding Types/terms", { cache: true })
					.then(function(o){
					  return Thesaurus.buildTree($filter('orderBy')(o.data, 'name'));
					});
				},
				absKeyAreas : function () {
					return $http.get("/api/v2013/thesaurus/domains/2B2A5166-F949-4B1E-888F-A7976E76320B/terms", { cache: true })
			        	.then(function(o){
			            	return o.data;
			            });
			    },

		         aichiTargets : function () {
		             return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms", { cache: true })
		             .then(function(o){
		                 return Thesaurus.buildTree(o.data);
		             });
		         },

				 geographicScope : function () {
					 return $http.get("/api/v2013/thesaurus/domains/4D4413D8-36F9-4CD2-8CC1-4F3C866DDE5A/terms", { cache: true })
					 .then(function(o){
						 return Thesaurus.buildTree(o.data);
					 });
				 },
				 targetGroups : function () {
					 return $http.get("/api/v2013/thesaurus/domains/AFB155C4-93A6-402C-B812-CFC7488ED651/terms", { cache: true })
					 .then(function(o){
						 return o.data;
					 });
				 },
			};


			$scope.isGlobalOrRegional = function () {
				if($scope.document && $scope.document.geographicScope){
					return _.contains(['56B8CEB7-56B5-436B-99D9-AA7C4622F326', 'C7D6719B-8AD9-4EB1-A472-B0B858DE0F56'], $scope.document.geographicScope.identifier);
				}
				return false;
			};
		
			$scope.isNational = function () {
				if($scope.document && $scope.document.geographicScope){
					return $scope.document.geographicScope.identifier == "20B2CC6D-646D-4FD5-BD53-D652BA3FA088";
				}
				return false;
			};

			//============================================================
			//
			//============================================================
			$scope.isSubnational = function () {
				if($scope.document && $scope.document.geographicScope){
					return $scope.document.geographicScope.identifier == "DEBB019D-8647-40EC-8AE5-10CA88572F6E";
				}
				return false;
			};

			//============================================================
			//
			//============================================================
			$scope.clearJurisdiction = function () {
				if($scope.document && $scope.document.geographicScope && $scope.document.geographicScope.jurisdiction)
					$scope.document.geographicScope.jurisdiction = undefined;

			};

			//============================================================
			//
			//============================================================
			$scope.isCommunity = function () {
				if($scope.document && $scope.document.geographicScope){
					return $scope.document.geographicScope.identifier == "9627DF2B-FFAC-4F85-B075-AF783FF2A0B5";
				}
				return false;
			};

			//============================================================
			//
			//============================================================
			$scope.clearCommunity = function () {
				if($scope.document && $scope.document.geographicScope && $scope.document.geographicScope.community)
					$scope.document.geographicScope.community = undefined;
			};

			//============================================================
			//
			//============================================================
			$scope.isPartofBroaderInitiative = function () {
				if($scope.document && $scope.document.type){
					return $scope.document.type.identifier == "8E66C5C7-194C-4A27-9218-26ED003E6D30";
				}
				return false;
			};

			//============================================================
			//
			//============================================================
			$scope.isSelfFunding = function () {
				if($scope.document && $scope.document.fundingSourceTypes){
					return !_.isEmpty(_.where($scope.document.fundingSourceTypes, { identifier: "AFDE8912-E398-4194-95BA-FE488DCC891A"}));
				}
				return false;
			};

			$scope.isProposedOrApproved = function(){

				if($scope.document && $scope.document.status)
					return _.contains(['73E2AC27-D964-487C-A4E6-0997BB27AF01','851B10ED-AE62-4F28-B178-6D40389CC8DB'], $scope.document.status.identifier)
				return false;
			}
		
			//============================================================
			//
			//============================================================
			$scope.clearDates = function () {
				if($scope.document && ($scope.document.startDate || $scope.document.endDate))
				{
					$scope.document.startDate = undefined;
					$scope.document.endDate   = undefined;
				}
			};

			//============================================================
			//
			//============================================================
			$scope.clearDuration = function () {
				if($scope.document && $scope.document.duration)
					$scope.document.duration = undefined;
			};

			//============================================================
			//
			//============================================================
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

			//============================================================
			//
			//============================================================
			$scope.isInLibrary = function(name, document) {
				document = document || $scope.document;

				if (!document || !document.libraries)
					return false;

				var qLibraries = Enumerable.From(document.libraries);

				if(name=="chm"  ) return qLibraries.Any(function(o){ return o.identifier == "cbdLibrary:chm"    ;});
				if(name=="absch") return qLibraries.Any(function(o){ return o.identifier == "cbdLibrary:abs-ch" ;});
				if(name=="bch"  ) return qLibraries.Any(function(o){ return o.identifier == "cbdLibrary:bch"    ;});

				return false;
			};


			//============================================================
			//
			//============================================================
			$scope.isLoading = function() {
				return $scope.status=="loading";
			};

			//============================================================
			//
			//============================================================
			$scope.hasError = function() {
				return !!$scope.error;
			};

			//============================================================
			//
			//============================================================
			$scope.userGovernment = function() {
				return authentication.user().government;
			};

			//============================================================
			//
			//============================================================
			$scope.init = function() {
				if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = $route.current.params.uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "capacityBuildingInitiative");
				else
					promise = $q.when({
						header: {
							identifier: guid(),
							schema   : "capacityBuildingInitiative",
							languages: ["en"]
						}
					});


				promise.then(
					function(doc) {
						$scope.status = "ready";
						$scope.document = doc;
						//Set countryRegions
						console.log(doc);
						if(doc.countryRegions){
							$q.when($http.get("/api/v2013/thesaurus/domains/countries/terms", {cache: true})).then(function(countries){
								$scope.countryRegions.countries = _.filter(doc.countryRegions, function(country){
								return _.find(countries, {identifier:country.identifier});
							});
								$scope.countryRegions.regions = _.filter(doc.countryRegions, function(region){
								return !_.find(countries, {identifier:region.identifier});
							});
							});
						}
					}).then(null,
					function(err) {
						$scope.onError(err.data, err.status);
						throw err;
					});
			};

			//============================================================
			//
			//============================================================
			$scope.onPreSaveDraft = function() {
				return $scope.cleanUp();
			};

			//============================================================
			//
			//============================================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			};

			//============================================================
			//
			//============================================================
			$scope.onPostWorkflow = function() {
				$rootScope.$broadcast("onPostWorkflow", "Publishing request sent successfully.");
				gotoManager();
			};

			//============================================================
			//
			//============================================================
			$scope.onPostPublish = function() {
				$rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
				gotoManager();
			};

			//============================================================
			//
			//============================================================
			$scope.onPostSaveDraft = function() {
				$rootScope.$broadcast("onSaveDraft", "Draft record saved.");
			};

			//============================================================
			//
			//============================================================
			$scope.onPostClose = function() {
				$rootScope.$broadcast("onPostClose", "Record closed.");
				gotoManager();
			};

			//============================================================
			//
			//============================================================
			function gotoManager() {
				$location.url("/submit/capacityBuildingInitiative");
			}

			//============================================================
			//
			//============================================================
			$scope.cleanUp = function(document) {
				document = document || $scope.document;

				if (!document)
					return $q.when(true);
				
			// if(!document.geographicScope)
				// 	document.geographicScope = {};
				// if(!$scope.isGlobalOrRegional())
				// 	delete document.geographicScope.regions;
				// if(!$scope.isGlobalOrRegional() && !$scope.isNational())
				// 	delete document.geographicScope.countries;
		
				// if(_.isEmpty(document.geographicScope))
				// 	document.geographicScope = undefined;

				// 	if(document.geographicScope && document.geographicScope.regionsOrCountries)
				// 	delete document.geographicScope.regionsOrCountries;

				if(!document.geographicScope)
				document.geographicScope = {};


				if(_.isEmpty(document.geographicScope))
					document.geographicScope = undefined;
				if(!$scope.isGlobalOrRegional()) {
					delete $scope.countryRegions.regions;
				} else{
					document.geographicScope.customValue = undefined;
				}

				var countryRegions = []
				if($scope.countryRegions){

					if(($scope.countryRegions.countries||[]).length){
					countryRegions = $scope.countryRegions.countries;
					}
					if(($scope.countryRegions.regions||[]).length){
					countryRegions = _.union(countryRegions, $scope.countryRegions.regions)
					}
					if(countryRegions.length!=0)	{
						document.countryRegions = countryRegions;
					}
				}
		
				if(document.capacityBuildingsType && !document.capacityBuildingsType.isBroaderProjectPart)
					document.capacityBuildingsType.broaderProjectPart = undefined;
		
				if(document.status && !$scope.isProposedOrApproved()){
					document.durationPeriod = undefined;
					document.durationText = undefined;
				}
					
				if((document.durationText||'').trim() == '')
					document.durationText = undefined;
				
		
				if(document.type)
					delete document.type;
				if(document.duration)
					delete document.duration;
				// if(document.geographicScope && document.geographicScope.regionsOrCountries)
				// 	delete document.geographicScope.regionsOrCountries;
				if(document.typeInfo)
					delete document.typeInfo;
					
				if (!$scope.isInLibrary("absch", document)) {
					document.absSubjects = undefined;
				}

				document.libraries = [];
				if(document.cbdSubjects || document.aichiTargets)
					document.libraries.push({identifier: 'cbdLibrary:chm'   });

				if(document.absKeyAreas) 	  document.libraries.push({identifier: 'cbdLibrary:abs-ch'});
				if(document.cpbThematicAreas) document.libraries.push({identifier: 'cbdLibrary:bch'   });

				if(_.isEmpty(document.libraries )) document.libraries = undefined;

				if (!$scope.isInLibrary("chm", document)) {
					document.cbdSubjects  = undefined;
					document.aichiTargets = undefined;
				}

				if (!$scope.isInLibrary("absch", document)) {
					document.absKeyAreas  = undefined;
				}

				if (!$scope.isInLibrary("bch", document)) {
					document.cpbThematicAreas = undefined;
				}

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return $q.when(false);
			};

			//============================================================
			//
			//============================================================
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

			//============================================================
			//
			//============================================================
			$scope.isFieldValid = function(field) {
				if (field && $scope.validationReport && $scope.validationReport.errors)
					return !Enumerable.From($scope.validationReport.errors).Any(function(x){return x.property==field;});

				return true;
			};

			//============================================================
			//
			//============================================================
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

			//============================================================
			//
			//============================================================
			$scope.loadRecords = function(identifier, schema) {

        if (identifier) 
					return getSingleRecord(identifier)

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

      //============================================================
			//
			//============================================================          
      function getSingleRecord(identifier){
        var deferred = $q.defer();

        storage.documents.get(identifier, { info: "" })
          .then(function(r) {
            return r.data;
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
      
      //============================================================
			//
			//============================================================      
      $scope.loadOrgs = function(identifier) {

				if (identifier) 
					return getSingleRecord(identifier)
				
        return getAllOrgs()
			};

      //============================================================
			//
			//============================================================       
      function getAllOrgs(){
        var sQuery = "type eq 'organization'";
        var params = {
          q: "schema_s:organization",
          fl: "identifier_s,title_*",
          sort: "title_s ASC",
          rows:99999999
        };
        return $q.all([$http.get("/api/v2013/index", { params:params, cache: true }),
                 storage.drafts   .query(sQuery, null, { cache: true })])
          .then(function(results) {

            var qResult = Enumerable.From (normalizeSolrResult(results[0].data.response.docs))
                        .Union(results[1].data.Items, "$.identifier");
            return qResult.ToArray();
          });
      }

      //============================================================
			//
			//============================================================       
      function normalizeSolrResult(data){
        var normalData=[]
        for (var i = 0; i < data.length; i++) {
          normalData[i] ={}
          normalData[i].identifier = data[i].identifier_s
          normalData[i].title = solrPropTolString('title',data[i])
        }
        return normalData
      }

      //============================================================
			//
			//============================================================       
      function solrPropTolString(propertyName,solrDoc){
        if(!solrDoc[propertyName+'_t']) return {}
        
        var langs = ['EN','AR','ES','FR','RU','ZH']
        var lString = {}
        
        for (var i = 0; i < langs.length; i++) {
          lString[langs[i].toLowerCase()]=solrDoc[propertyName+'_'+langs[i]+'_t']
        }
        return lString
      }
      
			$scope.init();
		}
	};
}]);
});
