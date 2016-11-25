define(['text!./national-report-6.html', 'app', 'angular', 'lodash', 'authentication', '../views/national-report-6',
 'authentication', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 
 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', './reference-selector', "utilities/solr",],
function(template, app, angular, _) { 'use strict';

app.directive("editNationalReport6", ["$http","$rootScope", "$q", "$location", "$filter", 'IStorage', "editFormUtility",
 "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", "solr", "realm",  '$compile', "$timeout",
 function ($http, $rootScope, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls, 
 thesaurus, guid, $route, solr, realm,  $compile, $timeout) {
    return {
        restrict: 'E',
        template : template,
        replace: true,
        transclude: false,
        scope: {},
        link: function ($scope) {

			var targetAssessments = [];
            $scope.status = "";
            $scope.error = null;
            $scope.tab = "general";
            $scope.document = null;
            $scope.review = { locale: "en" };
			$scope.qs = $location.search();
			$scope.user
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
				var schema  = "nationalReport6";
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
							targetPursued : undefined 
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
							nationalTargets		: function()  { 
																var targets = $scope.nationalTargets
																if(!targets)
																	targets = loadNationalTargets() 
																return $q.when(targets) 
																		.then(function(){																			
																			return _.map($scope.nationalTargets, function(item){ return { title : item.title_t, identifier : item.identifier_s }});																		
																		}); 
															  },							
							
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
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return;

				document = angular.fromJson(angular.toJson(document));

				if (!document)
					return $q.when(true);
				
				if(_.isEmpty(document.progressAssessments))
					document.progressAssessments = undefined;
				
				if(document.implementationMeasures && document.implementationMeasures.length ==0)
					document.implementationMeasures = undefined;
				else{
					_.each(document.implementationMeasures, function(measure){						
						if(document.targetPursued)						
							measure.aichiTargets = undefined;
						else
							measure.nationalTargets = undefined;
					})
				}

				return document;
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
				
				// if(tab == 'implementation')$scope.closeall('.implementationMeasure');
				// if(tab == 'progress')$scope.closeall('.progressAssessment');
				// if(tab == 'nationalContribution')$scope.closeall('.aichiTarget');
				// if(tab == 'gspcContribution')$scope.closeall('.gspcTarget');
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
                $location.url("/submit/nationalReport6");
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$scope.$root.showAcknowledgement = true;
                $rootScope.$broadcast("onPostPublish", "Record is being published, please note the publishing process could take up to 1 minute before your record appears.");
                $location.url("/submit/nationalReport6");
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
                $location.url("/submit/nationalReport6");
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
			
			$scope.$watch('document', function(newVal, old){
				
				if(!$scope.document || newVal === undefined)
					return;			
				if(newVal && newVal.targetPursued){					
					loadNationalTargets();
				}
			});

			$scope.$watch('document.targetPursued', function(newVal, old){
				
				if(!$scope.document || newVal === undefined)
					return;
				
				if(newVal===false){	//if target not pursued by country than the country has to assess againts all AICHI targets 		
					$scope.document.progressAssessments = [];
					//nationalContributions contains preloaded aichiTargets just use instead of reloading
					var aichiTargets = _.pluck($scope.document.nationalContributions, 'identifier');				
					_.map(aichiTargets, function(target){
							$scope.document.progressAssessments.push({ aichiTarget : { identifier : target }});
					});
				}
				else{
					$q.when(loadNationalTargets())
					.then(function(){
						loadProgressAssessment();
					});		
				}
			});
			
			$scope.getNationalTargetTitle = function(identifier){

				if($scope.nationalTargets){
					var nationalTarget = _.find($scope.nationalTargets, function(target){
											return target && target.identifier_s == identifier; 
										 });
					if(nationalTarget)
						return nationalTarget.title_t
				}	
			}

			$scope.getAssessmentInfo = function(assessment, field){
				var existingAssesment = _.find(targetAssessments, function(progress){
													return  progress.identifier_s == assessment.identifier;
												});
				if(existingAssesment)
					return existingAssesment[field];

			}

			$scope.addAssessment = function(){
				openDialog('directives/formats/forms/national-assessment', 'edit-national-assessment', {})
			}

			$scope.refreshNationaTargets = function(){
				loadNationalTargets();
			}
			$scope.refreshAssessment = function(){
				loadProgressAssessment();
			}
			function loadReferenceRecords(options) {
				
				if(!options.skipLatest && options.latest===undefined)
					options.latest = true;

				options = _.assign({
					schema    : options.schema,
					target    : options.nationaTargetId,
					rows	  : 500,
					government:$scope.document.government.identifier
				}, options || {});

				var query  = [];

				// Add Schema
				query.push("schema_s:" + solr.escape(options.schema));

				if(options.target)
					query.push("nationalTarget_s:"+solr.escape(options.target));

				if(options.government)
						query.push("government_s:"+solr.escape(options.government));

				if(options.identifier)
					query.push("identifier_s:"+solr.escape(options.identifier));

				// Apply ownership
				query.push(["realm_ss:" + realm.toLowerCase(), "(*:* NOT realm_ss:*)"]);

				// Apply ownership
				// query.push(_.map(($rootScope.user||{}).userGroups, function(v){
				// 	return "_ownership_s:"+solr.escape(v);
				// }));

				if(options.latest!==undefined){
					query.push("_latest_s:" + (options.latest ? "true" : "false"));
				}

				// AND / OR everything

				var query =  solr.andOr(query);
				var qsParams =
				{
					"q"  : query,
					"fl" : "identifier_s, schema_t, title_t, summary_t, description_t, reportType_EN_t, " +
						"url_ss, _revision_i, _state_s, version_s, _latest_s, _workflow_s, isAichiTarget_b, aichiTargets_*, otherAichiTargets_*, date_dt, progress_s",
					"sort"  : "updatedDate_dt desc",
					"start" : 0,
					"rows"   : options.rows,
				};

				return $http.get("/api/v2013/index", { params : qsParams }).then(function(res) {

					return _.map(res.data.response.docs, function(v){
						return _.defaults(v, {
							schemaName     : solr.lstring(v, "schema_*_t",     "schema_EN_t",     "schema_s"),
							title          : solr.lstring(v, "title_*_t",      "title_EN_t",      "title_t"),
							summary        : solr.lstring(v, "summary_*_t",    "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t")
						});
					});

				});
			}

			function loadNationalTargets(){
				
				var existingnationalTargets = angular.copy($scope.document.nationalTargets||[]);
				$scope.document.nationalTargets 	= [];
				$scope.nationalTargets = undefined;
				$scope.loadingNationalTargets = true;
				var query = loadReferenceRecords({
									schema : 'nationalTarget', skipLatest:true
								});
				return $q.when(query)
						.then(function(data){
							var indexNationalTargets = [];
							var nationalTargets = [];
							//sort index data so darft reocrds are at top
							data = $filter('orderBy')(data, ['identifier_s', '-_revision_i'])
							//check for existing records, more preference is to drafts
							_.each(existingnationalTargets, function(nationalTarget){
								var indexRecord = _.find(data, function(nt){
													return nt.identifier_s == removeRevisonNumber(nationalTarget.identifier) &&
															(nt.version_s == 'draft' || nt._state_s == 'public')
												});
								if(indexRecord){
									nationalTargets.push({identifier : indexRecord.identifier_s + '@' + indexRecord._revision_i})	
									indexNationalTargets.push(indexRecord);
								}							
							});

							var existingNTIds = _.map(_.pluck(nationalTargets, ['identifier']), removeRevisonNumber);
							var newNationaTargets = _.filter(data, 	function(nationalTarget){ 
														var indexRecord = _.find(data, function(nt){
																			return  !_.contains(existingNTIds, nationalTarget.identifier_s) &&
																					nt.identifier_s == nationalTarget.identifier_s &&
																				(nt.version_s == 'draft' || nt._state_s == 'public')
																		});
														return indexRecord && indexRecord.identifier_s == nationalTarget.identifier_s && 
															   indexRecord._revision_i == nationalTarget._revision_i
													});

							_.map(newNationaTargets||[], function(nt){
								nationalTargets.push({identifier : nt.identifier_s + '@' + nt._revision_i})	
								indexNationalTargets.push(nt);
							});

							$scope.document.nationalTargets = nationalTargets;
							$scope.nationalTargets			= indexNationalTargets;
						})
						.finally(function(){ $scope.loadingNationalTargets = false;}); 
			}

			function loadProgressAssessment(){
				var existingAssesments = angular.copy($scope.document.progressAssessments||[]);

				$scope.document.progressAssessments 	= [];//_.filter(existingAssesments, 	function(assessment){ return !assessment.nationalTarget});

				_.each($scope.nationalTargets, function(nationalTarget){
							
					var existingAssesment = _.find(existingAssesments, function(progress){
												return  progress.nationalTarget && progress.nationalTarget.identifier == nationalTarget.identifier_s;
											});
					if(!existingAssesment)
						existingAssesment = { nationalTarget : { identifier : nationalTarget.identifier_s }   };						
											
					$q.when(loadReferenceRecords({schema:'nationalAssessment', nationaTargetId:nationalTarget.identifier_s, rows:1, skipLatest:true}))
					.then(function(result){
						if(result && result.length>0){
							existingAssesment.assessment = {identifier : result[0].identifier_s};
							if(!_.find(targetAssessments, function(progress){return  progress.identifier_s == existingAssesment.identifier;})){
								targetAssessments.push(result[0]);
							}
						}
						$scope.document.progressAssessments.push(existingAssesment);
						
					});
					
				});
			}
			
			function removeRevisonNumber(identifier){
				if(identifier && identifier.indexOf('@')>0)
					return identifier.substr(0, identifier.indexOf('@'))
				
				return identifier;
			}
			var evtServerPushNotification = $rootScope.$on('event:server-pushNotification', function(evt,data){
				if(data.type == 'workflowActivityStatus'
					&& data.data && data.data.identifier  && (data.data.schema=='nationalTarget' || data.data.schema=="nationalAssessment") ){
						
					var options = {
						identifier :  data.data.identifier,
						latest : true,
						schema : data.data.schema
					}
					if(data.data.workflowActivity == 'document-lock')
						options.latest = false;
					if(data.data.workflowActivity == 'document-deleted'){
						
					}
					else{
						if(data.data.schema=='nationalTarget'){ 							
							
							 $timeout(function(){
								 $q.when(loadReferenceRecords(options))
								   .then(function(data){
										if(data.length > 0){
												var document = _.findWhere($scope.nationalTargets, {identifier_s: _.head(data).identifier_s})
												if(document){
													_assign(document, _.head(data))
												}
												else{
													$scope.nationalTargets.push(_.head(data));
													if(!$scope.document.progressAssessments)
														$scope.document.progressAssessments = [];
													$scope.document.progressAssessments.push({ nationalTarget : { identifier : _.head(data).identifier_s }});
												}
										}
									});
							 }, 1000);
						}
						else if(data.data.schema=='nationalAssessment'){ 							
							 $timeout(function(){
								$q.when(loadReferenceRecords(options))
							  	.then(function(data){
								  if(data.length > 0){
									var newDoc = _.head(data);
									var document = _.find($scope.document.progressAssessments, function(assessment){ return assessment.nationalTarget.identifier == newDoc.nationalTarget_s});
									if(document){
										document.assessment = { identifier : newDoc.identifier_s };
										var assessment = _.findWhere(targetAssessments, {identifier_s: newDoc.identifier_s})
										_assign(assessment, newDoc);
									}
									else{
										targetAssessments.push(newDoc)
										$scope.document.progressAssessments.push({ nationalTarget : { identifier : newDoc.nationalTarget_s },
																				assessment 	  : { identifier : newDoc.identifier_s}});
									}
								  }
							   });
							}, 1000);
						}
					}

				}
			});


			$scope.$on('$destroy', function(){
				evtServerPushNotification();
			})

			$scope.closeall = function(section){
				
				$(section).parent().find('.openall').css('display', 'block');
				$(section).parent().find('.closeall').css('display', 'none');
				$(section + ' .panel-body.collapse.in')
					.collapse('hide');
			};
			$scope.openall = function(section){
				$(section).parent().find('.openall').css('display', 'none');
				$(section).parent().find('.closeall').css('display', 'block');
				$(section + ' .panel-body.collapse:not(".in")')
					.collapse('show');
			};


			//===========================
			//
			//===========================
			// function openDialog(name, directiveName, options) {

			// 	options = options || {};

			// 	return $q(function(resolve, reject) {

			// 		require([name], function() {

			// 			var directiveHtml = '<DIRECTIVE ></DIRECTIVE>'.replace(/DIRECTIVE/g, directiveName);

			// 			$scope.$apply(function(){
			// 				options.template = directiveHtml;//$compile(directiveHtml)($scope);
			// 			});

			// 			options.plain = true;
			// 			options.closeByDocument = false;
			// 			options.showClose = false;

			// 			var dialogWindow = ngDialog.open(options);

			// 			dialogWindow.closePromise.then(function(res){

			// 				if(res.value=="$escape")      delete res.value;
			// 				if(res.value=="$document")    delete res.value;
			// 				if(res.value=="$closeButton") delete res.value;

			// 				return res;
			// 			});

			// 			resolve(dialogWindow);

			// 		}, reject);
			// 	});
			// }
        }
    };
}]);
});
