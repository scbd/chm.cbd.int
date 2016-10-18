define(['text!./national-report-6.html', 'app', 'angular', 'lodash', 'authentication', '../views/national-report-6',
 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 
 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', './reference-selector'], 
function(template, app, angular, _) { 'use strict';

app.directive("editNationalReport6", ["$http","$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility",
 "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", 
 function ($http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls, thesaurus, guid, $route) {
    return {
        restrict: 'E',
        template : template,
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope) {

            $scope.status = "";
            $scope.error = null;
            $scope.tab = "general";
            $scope.document = null;
            $scope.review = { locale: "en" };
			$scope.qs = $location.search();

			// Ensure user as signed in
			navigation.securize();

			//==================================
			//
			//==================================
			$scope.init = function() {

				if ($scope.document)
					return;

				$scope.status = "loading";

				var qs = $route.current.params;
				var schema  = "nationalReport";
				var reportType  = qs.type;
				var promise = null;
				var keepTypeOptions= null;
				var rmTypeOptions= null;


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
							},
							government: $scope.defaultGovernment() ? { identifier: $scope.defaultGovernment() } : undefined,
							document : { targetPursued : undefined }
						};
							
					});
				}

				promise.then(function(doc) {

					if(!$scope.options) {

			            $scope.options = {
			                countries:		$http.get("/api/v2013/thesaurus/domains/countries/terms",								{ cache: true }).then(function (o) { return $filter('orderBy')(o.data, 'name'); }),
			                jurisdictions:	$http.get("/api/v2013/thesaurus/domains/50AC1489-92B8-4D99-965A-AAE97A80F38E/terms",	{ cache: true }).then(function (o) { return o.data; }),
			                aichiTargets  : function()  { return $http.get("/api/v2013/thesaurus/domains/AICHI-TARGETS/terms",{ cache: true }).then(function(o){ return o.data; }); },
							gspcTargets   : function()  { return $http.get("/api/v2013/thesaurus/domains/8D405050-50AF-45EA-95F7-A31A11196424/terms",{ cache: true }).then(function(o){ return o.data; }); },
							
							assessment   		: function()  { return $http.get("/api/v2013/thesaurus/domains/8D3DFD9C-EE6D-483D-A586-A0DDAD9A99E0/terms",{ cache: true }).then(function(o){ return o.data; }); },
							categoryProgress   	: function()  { return $http.get("/api/v2013/thesaurus/domains/EF99BEFD-5070-41C4-91F0-C051B338EEA6/terms",{ cache: true }).then(function(o){ return o.data; }); },
							confidenceLevel   	: function()  { return $http.get("/api/v2013/thesaurus/domains/B40C65BE-CFBF-4AA2-B2AA-C65F358C1D8D/terms",{ cache: true }).then(function(o){ return o.data; }); },
							adequacyMonitoring  : function()  { return $http.get("/api/v2013/thesaurus/domains/23643DAC-74BB-47BC-A603-123D20EAB824/terms",{ cache: true }).then(function(o){ return o.data; }); },
							//8D3DFD9C-EE6D-483D-A586-A0DDAD9A99E0 assessment
							//EF99BEFD-5070-41C4-91F0-C051B338EEA6//Category of progress towards the implementation of the selected target:
							//B40C65BE-CFBF-4AA2-B2AA-C65F358C1D8D//Level of confidence of the above assessment
							//23643DAC-74BB-47BC-A603-123D20EAB824 //adequacy monitoring
							//EF99BEFD-5070-41C4-91F0-C051B338EEA6//Category of progress towards the target of the Global Strategy for Plant Conservation at the
			            };
						if(!doc.nationalContributions){
							$q.when($scope.options.aichiTargets())
							.then(function(data){
								doc.nationalContributions = _.map(data,function(target){ return {identifier: target.identifier}});
							});
						}
						if(!doc.gspcNationalContribution){
							$q.when($scope.options.gspcTargets())
							.then(function(data){
								doc.gspcNationalContribution = { targetContributions : _.map(data,function(target){ return {identifier: target.identifier}}) };
							});
						}
			        }
					
			        return doc;

				}).then(function(doc) {
					
					$scope.document = doc;
					$scope.status = "ready";

				}).catch(function(err) {

					$scope.onError(err.data, err.status);
					throw err;

				});
			};

			//==================================
			//
			//==================================
			$scope.hasAdoptionDate = function (document) {

				document = document || $scope.document;

				return !!document && !!document.status && (
					document.status.identifier == "1C37E358-5295-46EB-816C-0A7EF2437EC9" ||
					document.status.identifier == "851B10ED-AE62-4F28-B178-6D40389CC8DB");
			};

			//==================================
			//
			//==================================
			$scope.hasApprovedStatus = function (document) {

				document = document || $scope.document;

				return !!document && !!document.status && document.status.identifier == "851B10ED-AE62-4F28-B178-6D40389CC8DB";
			};

			//==================================
			//
			//==================================
			$scope.hasApprovedStatusInfo = function (document) {

				document = document || $scope.document;

				return !!document && !!document.approvingBody && (
					document.approvingBody.identifier == "D3A4624E-21D9-4E49-953F-529734538E56" ||
					document.approvingBody.identifier == "E7398F2B-FA36-4F42-85C2-5D0044440476" ||
					document.approvingBody.identifier == "905C1F7F-C2F4-4DCE-A94E-BE6D6CE6E78F");
			};

			//==================================
			//
			//==================================
			$scope.isJurisdictionSubNational = function(document) {

				document = document || $scope.document;

				return !!document && !!document.jurisdiction && document.jurisdiction.identifier == "DEBB019D-8647-40EC-8AE5-10CA88572F6E";
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
			$scope.$watch('tab', function(tab) {
				if (tab == 'review')
					$scope.validate();
			});

			//==================================
			//
			//==================================
			$scope.validate = function() {

				$scope.validationReport = null;

				var oDocument = $scope.reviewDocument = $scope.getCleanDocument();

				return storage.documents.validate(oDocument).then(function(success) {

					$scope.validationReport = success.data;
					return !!(success.data && success.data.errors && success.data.errors.length);

				}).catch(function(error) {

					$scope.onError(error.data);
					return true;

				});
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
				return $scope.validate().then(function(hasError) {
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
                $location.url("/submit/nationalReport?type=" + $scope.qs.type);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$scope.$root.showAcknowledgement = true;
                $rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
                $location.url("/submit/nationalReport?type=" + $scope.qs.type);
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
                $location.url("/submit/nationalReport?type=" + $scope.qs.type);
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

            $scope.init();


			$scope.addImplementationMeasure = function(){
				if(!$scope.document.implementationMeasures){
					$scope.document.implementationMeasures = [];
				}
				$scope.document.implementationMeasures.push({});
			}
			$scope.removeImplementationMeasure = function(measure){
				if(measure && $scope.document.implementationMeasures){
					$scope.document.implementationMeasures.splice($scope.document.implementationMeasures.indexOf(measure),1);
				}
			}
			
			$scope.$watch('document.aichiTargets', function(newVal, old){
				
				if(!$scope.document)
					return;

				if(!$scope.document.progressAssessments)
						$scope.document.progressAssessments = [];
				
				var aichiTargets = _.pluck($scope.document.aichiTargets, 'identifier');
				$scope.document.progressAssessments = _.filter($scope.document.progressAssessments, function(progress){
													return _.contains(aichiTargets, progress.aichiTarget.identifier)
												})		
				_.map(aichiTargets, function(target){

					var targetAssessment = _.find($scope.document.progressAssessments, function(progress){
												return progress.aichiTarget.identifier == target;
											});
					if(!targetAssessment){
						$scope.document.progressAssessments.push({ aichiTarget : { identifier : target }});
					};

				})
			});

			$scope.$watch('document.targetPursued', function(newVal, old){
				
				if(!$scope.document || newVal === undefined)
					return;
				$scope.document.progressAssessments = [];
				if(newVal===false){					
					//nationalContributions contains preloaded aichiTargets just use instead of reloading
					var aichiTargets = _.pluck($scope.document.nationalContributions, 'identifier');				
					_.map(aichiTargets, function(target){
							$scope.document.progressAssessments.push({ aichiTarget : { identifier : target }});
					});
				}
			});

			$scope.$watch('document.nationalTargets', function(newVal, old){
				
				if(!$scope.document)
					return;
				
				var existingAssesments = angular.copy($scope.document.progressAssessments||[]);
				var existingMeasures   = angular.copy($scope.document.implementationMeasures||[]);

				$scope.document.progressAssessments 	= _.filter(existingAssesments, 	function(assessment){ return !assessment.nationalTarget});
				$scope.document.implementationMeasures	= _.filter(existingMeasures, 	function(measure){ return !measure.nationalTarget});

				var nationalTargets=[];
				_.each($scope.document.nationalTargets, function (mod) {
					if(mod.identifier)
						nationalTargets.push(storage.documents.get(mod.identifier));
				});					

				$q.all(nationalTargets)
				.then(function(results){
					
					var documents = _.map(results, function(result){ return result.data || {}; });
					$scope.selectedNationalTargets = documents;

					_.each(documents, function(nationalTarget){

						_.each(nationalTarget.aichiTargets, function(target){
								
							var existingAssesment = _.find(existingAssesments, function(progress){
														return progress.aichiTarget.identifier == target.identifier 
																&& progress.nationalTarget == nationalTarget.identifier;
													});
							if(existingAssesment)
								$scope.document.progressAssessments.push(existingAssesment);
							else
								$scope.document.progressAssessments.push({ aichiTarget : target, nationalTarget : { identifier : nationalTarget.header.identifier }   });

							var existingMeasure = _.find(existingMeasures, function(progress){
														return progress.aichiTarget.identifier == target.identifier 
																&& progress.nationalTarget == nationalTarget.identifier;
													});
							if(existingMeasure)
								$scope.document.implementationMeasures.push(existingMeasure);
							else
								$scope.document.implementationMeasures.push({ aichiTarget : target, nationalTarget : { identifier : nationalTarget.header.identifier } });
						
						});
					});
				});
			}, true);
			
			$scope.getNationalTargetTitle = function(identifier){

				if($scope.selectedNationalTargets){
					var nationalTarget = _.find($scope.selectedNationalTargets, function(target){
											return target && target.header.identifier == identifier; 
										 });
					if(nationalTarget)
						return nationalTarget.title
				}	
			}
        }
    };
}]);
});
