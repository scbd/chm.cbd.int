define(['app', 'angular', 'text!./km-form-material-buttons.html'], function(app, angular, template) { 'use strict';

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
			link: function ($scope, $element)
			{
				$scope.errors = null;
				$scope.status = "loading buttons";
				//$scope.updateSecurity();


			},
			controller: ["$scope", "$rootScope", "IStorage", "authentication", "editFormUtility", "$mdDialog", "$timeout", function ($scope, $rootScope, storage, authentication, editFormUtility, $mdDialog, $timeout)
			{

				//====================
				//
				//====================
				$rootScope.$on("DraftSaved", function(evt) {
					$scope.status = "";
				});

				//====================
				//
				//====================
				$scope.new_saveDraft = function()
				{
					$scope.status = "saving";

					$q.when($scope.onPreSaveDraftFn()).then(function(result) {

						//return $scope.closeDialog().then(function() {
							return result;
						//});
					}).then(function(cancel) {
						if(cancel)
							return;

						var document = $scope.getDocumentFn();

						if(!document)
							throw "Invalid document";

						return editFormUtility.saveDraft(document).then(function(draftInfo) {
							$scope.onPostSaveDraftFn({ data: draftInfo });

						});
					}).catch(function(error){
						$scope.onErrorFn({ action: "saveDraft", error: error });
						//$scope.closeDialog();
					});
				};

				//====================
				//
				//====================
				$scope.new_cancel = function(ev) {

					var confirm = $mdDialog.confirm()
						.title('Close the form without saving?')
						.content('Click "CANCEL" to remain on this record or "CLOSE" to close the form without saving.')
						.ariaLabel('close form')
						.ok('CLOSE RECORD WITHOUT SAVING')
						.cancel('CANCEL')
						.targetEvent(ev);
						$mdDialog.show(confirm).then(function() {
							$scope.close();
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

						if(!document)
							throw "Invalid document";

						return editFormUtility.publishRequest(document).then(function(workflowInfo) {

							$scope.onPostWorkflowFn({ data: workflowInfo });

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


				// $scope.loadSecurity = function(){
				// 	$timeout(function(){$scope.updateSecurity();}, 500);
				// }

				//==================================
				//
				//==================================
				$scope.$watch('formStatus', function(status) {

					if(!status) return;

					if(status =="ready"){
						$scope.updateSecurity();
						$scope.status = "ready";
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
				// $scope.publish = function()
				// {
				// 	$q.when($scope.onPrePublishFn()).then(function(result) {
				//
				// 		return $scope.closeDialog().then(function() {
				// 			return result;
				// 		});
				//
				// 	}).then(function(canceled) {
				//
				// 		if(canceled)
				// 			return;
				//
				// 		var document = $scope.getDocumentFn();
				//
				// 		if(!document)
				// 			throw "Invalid document";
				//
				// 		return editFormUtility.publish(document).then(function(documentInfo) {
				//
				// 			$scope.onPostPublishFn({ data: documentInfo });
				//
				// 			return documentInfo;
				// 		});
				//
				// 	}).catch(function(error){
				//
				// 		$scope.onErrorFn({ action: "publish", error: error });
				// 		$scope.closeDialog();
				//
				// 	});
				// };

				//====================
				//
				//====================
				// $scope.publishRequest = function()
				// {
				// 	$q.when($scope.onPrePublishFn()).then(function(result) {
				//
				// 		return $scope.closeDialog().then(function() {
				// 			return result;
				// 		});
				//
				// 	}).then(function(canceled) {
				//
				// 		if(canceled)
				// 			return;
				//
				// 		var document = $scope.getDocumentFn();
				//
				// 		if(!document)
				// 			throw "Invalid document";
				//
				// 		return editFormUtility.publishRequest(document).then(function(workflowInfo) {
				//
				// 			$scope.onPostWorkflowFn({ data: workflowInfo });
				//
				// 			return workflowInfo;
				// 		});
				//
				// 	}).catch(function(error){
				//
				// 		$scope.onErrorFn({ action: "publishRequest", error: error });
				// 		$scope.closeDialog();
				//
				// 	});
				// };

				//====================
				//
				//====================
				// $scope.saveDraft = function()
				// {
				// 	$q.when($scope.onPreSaveDraftFn()).then(function(result) {
				//
				// 		return $scope.closeDialog().then(function() {
				// 			return result;
				// 		});
				// 	}).then(function(cancel) {
				// 		if(cancel)
				// 			return;
				//
				// 		var document = $scope.getDocumentFn();
				//
				// 		if(!document)
				// 			throw "Invalid document";
				//
				// 		return editFormUtility.saveDraft(document).then(function(draftInfo) {
				// 			$scope.onPostSaveDraftFn({ data: draftInfo });
				// 		});
				// 	}).catch(function(error){
				// 		$scope.onErrorFn({ action: "saveDraft", error: error });
				// 		$scope.closeDialog();
				// 	});
				// };



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
				// $scope.closeDialog = function()
				// {
				// 	return $q.all([$scope.showSaveDialog(false), $scope.showCancelDialog(false)]);
				// };

				//====================
				//
				//====================
				$scope.clone = function(data)
				{
					if(data)
						return angular.fromJson(angular.toJson(data));
				};


				$scope.updateSecurity();

			}]
		};
	}]);
});
