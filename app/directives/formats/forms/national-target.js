define(['text!./national-target.html', 'app', 'angular', 'lodash', 'json!app-data/edit-form-messages.json', 'authentication', '../views/national-target', 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', 'scbd-angularjs-services/locale'], function(template, app, angular, _, messages) { 'use strict';

app.directive("editNationalTarget", ['$filter','$rootScope', "$http", "$q", 'IStorage', "authentication", "editFormUtility", "guid", "$location", "navigation", "$route", "Thesaurus", "locale", function ($filter, $rootScope, $http, $q, storage, authentication, editFormUtility, guid, $location, navigation, $route, Thesaurus, locale) {
    return {
        restrict: 'EA',
        template : template,
        replace: true,
        transclude: false,
        scope: {
				query:'&?',
				closeDialog: '&?'
		},
        link: function ($scope) {
			var aichiTargets;
            $scope.status = "";
            $scope.error = null;
            $scope.document = null;
			$scope.tab      = 'general';
            $scope.review = { locale: locale };
			
			var qs = $route.current.params;
			var openInDialog = false;
			if($scope.query){//when its open in dialog
				qs = $scope.query();
				$scope.container = '.ngdialog-theme-default';
				openInDialog = true;
			}
            
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

				if ($scope.document)
					return;

				$scope.status = "loading";

				var identifier = qs.uid;
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
							languages: qs.documentLanguages ? qs.documentLanguages : [locale]
						},
						government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined,
						isAichiTarget : false
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
                            aichiTargets:       $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS-COMPONENTS/terms",			 { cache: true }).then(function (o) { return aichiTargets = Thesaurus.buildTree(o.data); }),
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
                    // if($scope.document.isAichiTarget===undefined)
                    //     $scope.document.isAichiTarget = false;
					$scope.status  = "ready";
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
					
					var aichiTarget = _.find(aichiTargets, {identifier:$scope.selectedAichi.target.identifier})
					document.title = {};
					_.each(document.header.languages, function(lang){
						document.title[lang] = aichiTarget.title[lang]
					})

                    document.description = undefined;
                    document.jurisdiction = undefined;
                    document.jurisdictionInfo = undefined;
                }
				if((document.aichiTargets && document.aichiTargets.length>0) || (document.otherAichiTargets && document.otherAichiTargets.length>0)){
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
			$scope.onPostWorkflow = function(info) {
                $rootScope.$broadcast("onPostWorkflow", messages.onPostWorkflow);
                
				if(!openInDialog)
					gotoManager();
				else{
					$rootScope.$broadcast("evt:dialog-onPostWorkflow", info);
					$scope.closeDialog();
				}
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function(info) {
				$scope.$root.showAcknowledgement = true;
                $rootScope.$broadcast("onPostPublish", messages.onPostPublish);
             	
				if(!openInDialog)
					gotoManager();
				else{
					$rootScope.$broadcast("evt:dialog-onPostWorkflow", info);
					$scope.closeDialog();
				}
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
                $rootScope.$broadcast("onSaveDraft", messages.onPostSaveDraft);
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
                $rootScope.$broadcast("onPostClose", messages.onPostClose);
				if(!openInDialog)
					gotoManager();
				else{
					$scope.closeDialog();
				}
			};

//==================================
			//
			//==================================
			function gotoManager() {
				$location.url("/submit/nationalReport6");
			}
			

			//==================================
			//
			//==================================
			$scope.onError = function(error, status)
			{
				if(error.data)
					error = error.data;
					
				$scope.status = "error";

				if (status == "notAuthorized") {
					$scope.status = "hidden";
					$scope.error  = messages.unAuthorizedError;
				}
				else if (status == 404) {
					$scope.status = "hidden";
					$scope.error  = messages.recordNotFoundError;
				}
				else if (status == "badSchema") {
					$scope.status = "hidden";
					$scope.error  = messages.badSchemaError;
				}
				else if (error && error.Message)
					$scope.error = error.Message;
				else
					$scope.error = error;
			};

            $scope.$watch('document.isAichiTarget', function(value, oldValue){
				if($scope.status=='ready'){   
					if($scope.document.isAichiTarget && $scope.document.aichiTargets && $scope.document.aichiTargets.length > 1){
						$scope.selectedAichi.target = undefined;
						$scope.document.aichiTargets = undefined;
					}
					else
						$scope.selectedAichi.target = _.head($scope.document.aichiTargets);
				}
            });
            $scope.$watch('selectedAichi.target', function(value){
                if($scope.options)
                    $scope.options.aichiSubTargets = filterSubAichiTargets();
				if($scope.document && $scope.document.isAichiTarget)
					$scope.document.aichiTargets = $scope.selectedAichi.target ? [$scope.selectedAichi.target]:undefined;
            });

			$scope.isTypeAichiTarget= function(){
				return $scope.document && $scope.document.isAichiTarget
			}

			$scope.onEditorFileUpload = function(data){
				if(!$scope.document.additionalDocuments)
					$scope.document.additionalDocuments = [];
				var editorImage = {
					url: data.url,
					name: data.filename,
					tag : 'editorImage'
				};
				$scope.document.additionalDocuments.push(editorImage);

			}

            $scope.init();

        }
    };
}]);
});
