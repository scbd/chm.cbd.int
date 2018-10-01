define(['app', 'angular', 'text!./km-form-material-buttons.html','json!app-data/workflow-button-messages.json', 'moment', 'jquery', './document-sharing'],
 function(app, angular, template, messages, moment) { 'use strict';

	app.directive('kmFormMaterialButtons', ["$q", function ($q)
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: true,
			scope: {
				formStatus     	  : "=status",
				getDocumentFn     : "&document",
				onPreCloseFn      : "&onPreClose",
				onPostCloseFn     : "&onPostClose",
				onPreRevertFn     : "&onPreRevert",
				onPostRevertFn    : "&onPostRevert",
				onPreSaveDraftFn  : "&onPreSaveDraft",
				onPostSaveDraftFn : "&onPostSaveDraft",
				onPrePublishFn    : "&onPrePublish",
				onPostPublishFn   : "&onPostPublish",
				onPostWorkflowFn  : "&onPostWorkflow",
				onErrorFn: "&onError",
				disabled		  : "=?ngDisabled",
				onPreSaveDraftVersionFn	: "&onPreSaveDraftVersion"
			},
			link: function ($scope, $element, $attr)
			{
				$scope.errors = null;
				$scope.status = "loading buttons";
				$scope.getContainer = function(){return $attr.container;}
			},
			controller: ["$scope", "$rootScope", "IStorage", "authentication", "editFormUtility", "$mdDialog", "$timeout", "$location", "$route", '$http',
			 function ($scope, $rootScope, storage, authentication, editFormUtility, $mdDialog, $timeout, $location, $route, $http)
			{
				if ($route.current.params && $route.current.params.workflowId)
					$scope.hideSave = true;

				var next_url;
				var destroyTimer;
				var saveDraftVersionTimer;
				var previousDraftVersion;

				$scope.new_close = function(){

					var formChanged = !angular.equals($scope.getDocumentFn(), $rootScope.originalDocument);

					if(!$rootScope.originalDocument || !formChanged){
						return $scope.close();
					}
					
					$scope.new_cancel();
				}
				//====================
				//
				//====================
				$scope.new_saveDraft = function()
				{
					$scope.status = "saving";
					$scope.disabled = true;
					$q.when($scope.onPreSaveDraftFn()).then(function(result) {
							return result;
					}).then(function(cancel) {
						if(cancel)
							return;

						var document = $scope.getDocumentFn();

						if(!document)
							throw "Invalid document";

						return editFormUtility.saveDraft(document).then(function(draftInfo) {
							$scope.onPostSaveDraftFn({ data: draftInfo });
							$scope.status = "";
							$rootScope.originalDocument = document;

							showShareDocument(draftInfo)
						});
					}).catch(function(error){
						$scope.onErrorFn({ action: "saveDraft", error: error });
					})					
					.finally(function(){
						timer(true);$scope.disabled = false;
					});;
				};

				//====================
				//
				//====================
				$scope.new_cancel = function(ev) {

					var confirm = $mdDialog.confirm({
							onComplete: function afterShowAnimation() {
								var $dialog = angular.element(document.querySelector('md-dialog'));
								var $actionsSection = $dialog.find('md-dialog-actions');
								var $cancelButton = $actionsSection.children()[0];
								var $confirmButton = $actionsSection.children()[1];
								angular.element($confirmButton).removeClass('md-primary md-button')
									.addClass('btn btn-warning');
								angular.element($cancelButton).removeClass('md-primary md-button').addClass('btn btn-primary btn-space');
							}
						})
						.title(messages.title)
						.content(messages.content)
						.ariaLabel('close form')
						.ok(messages.ok)
						.cancel(messages.cancel)
						.targetEvent(ev);

						if($scope.getContainer())
							confirm.parent($scope.getContainer());

						$mdDialog.show(confirm).then(function(a,b) {
							
							$rootScope.originalDocument = undefined;
							$rootScope.isFormLeaving = false;
							if(next_url){
								var url = angular.copy(next_url);
								next_url = undefined;
								$timeout(function(){
									var absHosts = ['https://chm.cbddev.xyz/', 'https://chm-training.cbd.int/',
										'https://chm.staging.cbd.int/',
										'http://localhost:8000/', 'https://chm.cbd.int/'
									]
									url = url.replace($location.$$protocol + '://' +
										$location.$$host + ($location.$$host != 'chm.cbd.int' ? ':' + $location.$$port : '') + '/', '');
									_.each(absHosts, function(host) {
										url = url.replace(host, '');
									});
									url = url.replace(/^(en|ar|fr|es|ru|zh)\//, '/');
									$location.url(url);
								},1);
							}
							else
								$scope.close();
						}, function() {
							$rootScope.isFormLeaving = false;
						});
				};

				$scope.validateForPublishing = function(ev) {

					// load the review page
					$q.when($scope.onPrePublishFn()).then(function(result) {
						return result;
					}).then(function(result) {

							if(result)
								return;

					}).then(null, function(error){
						$scope.onErrorFn({ action: "close", error: error });
					});

				}


				//====================
				//
				//====================
				$scope.new_publish = function()
				{
					$scope.disabled = true;
					$q.when($scope.onPrePublishFn()).then(function(result)
					{
						return result;

					}).then(function(canceled) {

						if(canceled)
							return;

						var document = $scope.getDocumentFn();

						$scope.status = "publishing";

						if(!document)
							throw "Invalid document";

						return editFormUtility.publish(document).then(function(documentInfo) {
							$scope.onPostPublishFn({ data: documentInfo });


							var identifier = document.header.identifier;
							var schema     = document.header.schema;
							$rootScope.originalDocument = document;

							$rootScope.$broadcast("ProcessingRecord", identifier, schema);


							return documentInfo;
						});

					}).catch(function(error){

						$scope.onErrorFn({ action: "publish", error: error });
					})
					.finally(function(){
						$scope.disabled = false;
					});
				};

				//====================
				//
				//====================
				$scope.new_publishRequest = function()
				{
					$scope.disabled = true;
					$q.when($scope.onPrePublishFn()).then(function(result) {
						return result;
					}).then(function(canceled) {

						if(canceled)
							return;

						var document = $scope.getDocumentFn();
						$scope.status = "publishing";

						if(!document)
							throw "Invalid document";

						return editFormUtility.publishRequest(document).then(function(workflowInfo) {

							$scope.onPostWorkflowFn({ data: workflowInfo });
							$rootScope.originalDocument = document;
							return workflowInfo;
						});

					}).catch(function(error){
						$scope.onErrorFn({ action: "publishRequest", error: error });

					})
					.finally(function(){
						$scope.disabled = false;
					});
				};



				//====================
				//
				//====================
				$scope.close = function()
				{
					$q.when($scope.onPreCloseFn()).then(function(result) {
						return result;
					}).then(function(result) {

							if(result)
								return;

							$scope.onPostCloseFn();

					}).then(null, function(error){
						$scope.onErrorFn({ action: "close", error: error });
					});
				};

				//++++++++++++++++++++++++++++++++++++++++++++++++++
				//++++++++++++++++++++++++++++++++++++++++++++++++++
				//++++++++++++++++++++++++++++++++++++++++++++++++++

				//====================
				//
				//====================
				$scope.safeApply = function(fn)
				{
					var phase = this.$root.$$phase;

					if (phase == '$apply' || phase == '$digest') {
						if (fn && (typeof (fn) === 'function')) {
							fn();
						}
					} else {
						this.$apply(fn);
					}
				};



				//==================================
				//
				//==================================
				$scope.$watch('formStatus', function(status) {

					if(!status) return;

					if(status =="ready"){
						$scope.updateSecurity();
						$scope.status = "ready";

						$rootScope.originalDocument = $scope.getDocumentFn();
						showShareDocument({identifier:$rootScope.originalDocument.header.identifier});

						saveDraftVersion();
					}
				});


				//====================
				//
				//====================
				$scope.updateSecurity = function()
				{
					$scope.security = {};

					$scope.formStatus = "loading";

					$q.when($scope.getDocumentFn()).then(function(document){

						if(!document || !document.header)
							return;

						var identifier = document.header.identifier;
						var schema     = document.header.schema;

						storage.documents.exists(identifier).then(function(exist){

							var q = exist ?
									storage.documents.security.canUpdate(document.header.identifier, schema) :
									storage.documents.security.canCreate(document.header.identifier, schema);

							q.then(function(allowed) {
								$scope.security.canSave = allowed;
							});
						});

						storage.drafts.exists(identifier).then(function(exist){

							var q = exist ?
									storage.drafts.security.canUpdate(document.header.identifier, schema) :
									storage.drafts.security.canCreate(document.header.identifier, schema);

							q.then(function(allowed) {
								$scope.security.canSaveDraft = allowed;
							});
						});
					}).finally(function(){
						$scope.formStatus = "ready";
						timer(true);
					});;
				};



				//====================
				//
				//====================
				$scope.checkErrors = function()
				{
					$scope.errors = "";

					if($scope.errors.trim()=="")// jshint ignore:line
						$scope.errors = null;
				};


				//====================
				//
				//====================
				$scope.clone = function(data)
				{
					if(data)
						return angular.fromJson(angular.toJson(data));
				};

				$rootScope.isFormLeaving = false;
				function confirmLeaving(evt, next, current) {
					if($rootScope.isFormLeaving)
						return;
					var formChanged = !angular.equals($scope.getDocumentFn(), $rootScope.originalDocument);

					if(!$rootScope.originalDocument || !formChanged){
						return;
					}
					$rootScope.isFormLeaving = true; 				
					evt.preventDefault();
					
					next_url = next;
					$scope.new_cancel();
				}

				$scope.$on('$locationChangeStart', confirmLeaving);
				
                function timer(startNew){
                    if(startNew){
                        $scope.lastSaved = '';
                        $scope.lastSavedTime = moment();
                    }
                    var duration = moment.duration(moment() - $scope.lastSavedTime)
                    $scope.lastSaved = duration._data.hours + ':' + duration._data.minutes + ':' + duration._data.seconds
                    destroyTimer = $timeout(function(){timer();},1000);
				}
				
				function showShareDocument(document){
					if(document && !$scope.documentShare){
						if(document.workingDocumentID){
							$scope.documentShare = {
								workingDocumentID : document.workingDocumentID, 
								identifier: document.identifier,
								title: document.title
							};
						}
						else{
							storage.drafts.get(document.identifier, {info:true})
							.then(function(response){
								if(response.data && response.data.workingDocumentID){
									$scope.documentShare = {
										workingDocumentID : response.data.workingDocumentID, 
										identifier: response.data.identifier,
										title: response.data.title
									};
								}
							})
							.catch(function(err){
								console.log(err);
							});
						}
					}
				}

                function saveDraftVersion(){
					
					$q.when($scope.onPreSaveDraftVersionFn())
					.then(function(doc){

						doc = doc || $scope.getDocumentFn();

						$q.when(doc).then(function(document){
					
							if(document && !angular.equals(document, previousDraftVersion)){
								var userId = $rootScope.user.userID;
								var identifier = document.header.identifier;
								var schema     = document.header.schema;

								var key = schema+'_'+identifier+'_'+userId;

								$http.put('/api/v2018/temporary-documents/'+key, {data: document})
								.then(function(result){
									previousDraftVersion = document;
									saveDraftVersionTimer = $timeout(function(){saveDraftVersion();},100000);
								})
								.catch(function(err){
									console.log(err);
									saveDraftVersionTimer = $timeout(function(){saveDraftVersion();},5000);
								});
							}
							else{
								saveDraftVersionTimer = $timeout(function(){saveDraftVersion();},100000);
							}
						});
					});
				}

				$scope.$watch('disabled', function(newVal, oldVal){
					if(oldVal!=newVal && newVal===false){
						timer(true);
					}
				});

				$scope.$on('$destroy', function(){
					$timeout.cancel(destroyTimer);
					$timeout.cancel(saveDraftVersionTimer);
				});

			}]
		};
	}]);
});
