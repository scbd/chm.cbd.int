define(['app', 'angular', 'text!./km-form-material-buttons.html','jquery'], function(app, angular, template) { 'use strict';

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
				onErrorFn: "&onError"
			},
			link: function ($scope, $element, $attr)
			{
				$scope.errors = null;
				$scope.status = "loading buttons";
				$scope.getContainer = function(){return $attr.container;}
			},
			controller: ["$scope", "$rootScope", "IStorage", "authentication", "editFormUtility", "$mdDialog", "$timeout", "$location", 
			 function ($scope, $rootScope, storage, authentication, editFormUtility, $mdDialog, $timeout, $location)
			{
				var next_url;
				//====================
				//
				//====================
				$scope.new_saveDraft = function()
				{
					$scope.status = "saving";

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
						});
					}).catch(function(error){
						$scope.onErrorFn({ action: "saveDraft", error: error });
					});
				};

				//====================
				//
				//====================
				$scope.new_cancel = function(ev) {

					var confirm = $mdDialog.confirm()
						.title('Close the form?')
						.content('Click "CANCEL" to remain on this record or "CLOSE" to close the form. Changes will be lost if not previously saved.')
						.ariaLabel('close form')
						.ok('CLOSE RECORD')
						.cancel('CANCEL')
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
									var absHosts = ['https://chm.cbddev.xyz/', 'https://chm.staging.cbd.int/',
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
					});
				};

				//====================
				//
				//====================
				$scope.new_publishRequest = function()
				{

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
				// },1);
					evt.preventDefault();
					
					next_url = next;
					$scope.new_cancel();
				}

				$scope.$on('$locationChangeStart', confirmLeaving);
				// $scope.$on('$locationChangeSuccess', function(evt, data){
				// 	next_url = undefined;
				// });
			}]
		};
	}]);
});
