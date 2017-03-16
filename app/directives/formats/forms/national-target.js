define(['text!./national-target.html', 'app', 'angular', 'lodash', 'authentication', '../views/national-target', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', 'scbd-angularjs-services/locale'], function(template, app, angular, _) { 'use strict';

app.directive("editNationalTarget", ['$filter','$rootScope', "$http", "$q", 'IStorage', "authentication", "editFormUtility", "guid", "$location", "navigation", "$route", "Thesaurus", "locale", function ($filter, $rootScope, $http, $q, storage, authentication, editFormUtility, guid, $location, navigation, $route, Thesaurus, locale) {
    return {
        restrict: 'E',
        template : template,
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope) {
            $scope.status = "";
            $scope.error = null;
            $scope.document = null;
			$scope.tab      = 'general';
            $scope.review = { locale: locale };
			$scope.qs = $location.search();
            
			
			$scope.selectedAichi={};
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
			$scope.init = function() {

				navigation.securize();
				
				var promise = null;
				var schema  = "nationalTarget";
				var qs = $route.current.params;


				if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = $route.current.params.uid;
				var promise = null;

				if(identifier)
					promise = editFormUtility.load(identifier, "nationalTarget");
				else
					promise = $q.when(guid()).then(function(identifier) {

						return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {
							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							return identifier;
						});
					}).then(function(identifier) {

						return{ 
						header: {
							identifier: guid(),
							schema   : "nationalTarget",
							languages: [locale]
						},
						government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined
					}});


				promise.then(function(doc) {

					var aichiTarget = $location.search().aichiTarget;

					if(aichiTarget) {

						doc.aichiTargets = doc.aichiTargets || [];
						doc.aichiTargets.push({ identifier : aichiTarget });
					}

					return doc;

				}).then(function(doc) {

					if(!$scope.options) {

			            $scope.options = {
			                countries:          $http.get("/api/v2013/thesaurus/domains/countries/terms",                            { cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
                            jurisdictions:      $http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms", { cache: true }).then(function (o) { return o.data; }),
                            aichiTargets:       $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS-COMPONENTS/terms",			 { cache: true }).then(function (o) { return Thesaurus.buildTree(o.data); }),
                            aichiTargetsFiltered: $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS-COMPONENTS/terms",			 { cache: true }).then(function (o) {
                                                                 var records =  _.reject(o.data, function(item){return item.broaderTerms.length>0});
                                                                 $scope.cachedAichiTargets = o.data;
                                                                 return records;
                                                            }),
                            aichiSubTargets     : function(){return filterSubAichiTargets();}
			            };

       				    return $q.all(_.values($scope.options)).then(function() {
       				    	return doc;
       				    });
			        }

			        return doc;

				}).then(function(doc) {

					$scope.document = doc;
					$scope.status  = "ready";
                    if($scope.document.isAichiTarget===undefined)
                        $scope.document.isAichiTarget = false;
				}).catch(function(err) {

					$scope.onError(err.data, err.status);
					throw err;

				});
			};

            function filterSubAichiTargets(){
                if(!$scope.cachedAichiTargets || !$scope.selectedAichi.target)
                    return [];

                return _.filter($scope.cachedAichiTargets, function(item){

                            return _.contains(item.broaderTerms,$scope.selectedAichi.target.identifier);
                        });
            }

			//==================================
			//
			//==================================
			$scope.isJurisdictionSubNational = function(document) {

				document = document || $scope.document;

				return !!document && !!document.jurisdiction && 
				(document.jurisdiction.identifier == "528B1187-F1BD-4479-9FB3-ADBD9076D361" || document.jurisdiction.identifier == "DEBB019D-8647-40EC-8AE5-10CA88572F6E");
			};

			//==================================
			//
			//==================================
			$scope.cleanUp = function(document) {

				return $q.when($scope.getCleanDocument(document));
			};
			
			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return;

				document = angular.fromJson(angular.toJson(document));

				if (!document)
					return $q.when(true);

				if (!$scope.isJurisdictionSubNational(document))
					document.jurisdictionInfo = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

                if($scope.selectedAichi.target && document.isAichiTarget){
                    document.aichiTargets = [];
                    document.aichiTargets.push($scope.selectedAichi.target);
                    document.title =  {en:$scope.selectedAichi.target.identifier};

                    document.description = undefined;
                    document.jurisdiction = undefined;
                    document.jurisdictionInfo = undefined;
                    document.relevantInformation = undefined;
                    document.relevantDocuments = undefined;
                }
				if(document.otherAichiTargets && document.otherAichiTargets.length>0){
					document.noOtherAichiTargets = undefined;
					document.noOtherAichiTargetsDescription = undefined;
				}
				return document;
			};

			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) { //lookup single record

					return storage.documents.get(identifier, { info: "" })
						.then(function(r) {
							return r.data;
						})
						//otherwise
						.then(null, function(e) {
							if (e.status != 404)
								throw e;

							return storage.drafts.get(identifier, { info: "" })
								.then(function(r) {
									return r.data;
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
			};


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

				return $scope.cleanUp().then(function(oDocument) {
					return storage.documents.validate(oDocument).then(
						function(success) {
							$scope.validationReport = success.data;
							return !!(success.data && success.data.errors && success.data.errors.length);
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
					return !_.findWhere($scope.validationReport.errors, { property: field });

				return true;
			};

			//==================================
            //
            //==================================
            $scope.isLoading = function () {
                return $scope.status == "loading";
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
			$scope.defaultGovernment = function() {

				var qsGovernment = $location.search().government;

				if (qsGovernment)
					qsGovernment = qsGovernment.toLowerCase();

				return $scope.userGovernment() || qsGovernment;
			};


			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
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
				$scope.$root.showAcknowledgement = true;
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
				$location.url("/submit/online-reporting");
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
					$scope.error = error.Message;
				else
					$scope.error = error;
			};

            $scope.$watch('document.aichiTargets', function(value){
                if(value && $scope.document.isAichiTarget)
                    $scope.selectedAichi.target = _.first(value);
            });
            $scope.$watch('selectedAichi.target', function(value){
                if($scope.options)
                    $scope.options.aichiSubTargets = filterSubAichiTargets();
            });

            $scope.init();

        }
    };
}]);
});
