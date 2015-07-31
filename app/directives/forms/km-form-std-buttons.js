define(['app', 'angular', 'text!./km-form-std-buttons.html','jquery'], function(app, angular, template) { 'use strict';

	app.directive('kmFormStdButtons', ["$q", function ($q)
	{
		return {
			restrict: 'EAC',
			template: template,
			replace: true,
			transclude: true,
			scope: {
				getDocumentFn     : '&document',
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
				$scope.errors              = null;

				//BOOTSTRAP Dialog handling

				var qSaveDialog   = $element.find("#dialogSave");
				var qCancelDialog = $element.find("#dialogCancel");

				$scope.saveDialogDefered = [];
				$scope.cancelDialogDefered = [];

				$scope.showSaveDialog = function(visible) {

					var isVisible = qSaveDialog.css("display")!='none';

					if(visible == isVisible)
						return $q.when(isVisible);

					if(visible)
						$scope.updateSecurity();

					var defered = $q.defer();

					$scope.saveDialogDefered.push(defered);

					qSaveDialog.modal(visible ? "show" : "hide");

					return defered.promise;
				};

				$scope.showCancelDialog = function(visible) {

					var isVisible = qCancelDialog.css("display")!='none';

					if(visible == isVisible)
						return $q.when(isVisible);

					var defered = $q.defer();

					$scope.cancelDialogDefered.push(defered);

					qCancelDialog.modal(visible ? "show" : "hide");

					return defered.promise;
				};

				qSaveDialog.on('shown.bs.modal' ,function() {

					$scope.safeApply(function(){

						var promise = null;
						while((promise=$scope.saveDialogDefered.pop()))
							promise.resolve(true);
					});
				});

				qSaveDialog.on('hidden.bs.modal' ,function() {

					$scope.safeApply(function(){

						var promise = null;
						while((promise=$scope.saveDialogDefered.pop()))
							promise.resolve(false);
					});
				});

				qCancelDialog.on('shown.bs.modal' ,function() {

					$scope.safeApply(function(){

						var promise = null;
						while((promise=$scope.cancelDialogDefered.pop()))
							promise.resolve(true);
					});
				});

				qCancelDialog.on('hidden.bs.modal' ,function() {

					$scope.safeApply(function(){

						var promise = null;
						while((promise=$scope.cancelDialogDefered.pop()))
							promise.resolve(false);
					});
				});
			},
			controller: ["$scope", "IStorage", "editFormUtility", function ($scope, storage, editFormUtility)
			{
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

				//====================
				//
				//====================
				$scope.updateSecurity = function()
				{
					$scope.security = {};

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
					});
				};

				//====================
				//
				//====================
				$scope.publish = function()
				{
					$q.when($scope.onPrePublishFn()).then(function(result) {

						return $scope.closeDialog().then(function() {
							return result;
						});

					}).then(function(canceled) {

						if(canceled)
							return;

						var document = $scope.getDocumentFn();

						if(!document)
							throw "Invalid document";

						return editFormUtility.publish(document).then(function(documentInfo) {

							$scope.onPostPublishFn({ data: documentInfo });

							return documentInfo;
						});

					}).catch(function(error){

						$scope.onErrorFn({ action: "publish", error: error });
						$scope.closeDialog();

					});
				};

				//====================
				//
				//====================
				$scope.publishRequest = function()
				{
					$q.when($scope.onPrePublishFn()).then(function(result) {

						return $scope.closeDialog().then(function() {
							return result;
						});

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
						$scope.closeDialog();

					});
				};

				//====================
				//
				//====================
				$scope.saveDraft = function()
				{
					$q.when($scope.onPreSaveDraftFn()).then(function(result) {

						return $scope.closeDialog().then(function() {
							return result;
						});
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
						$scope.closeDialog();
					});
				};

				//====================
				//
				//====================
				$scope.close = function()
				{
					$q.when($scope.onPreCloseFn()).then(function(result) {

						return $scope.closeDialog().then(function() {
							return result;
						});
					}).then(function(result) {
							if(result)
								return;

							$scope.onPostCloseFn();

					}).then(null, function(error){
						$scope.onErrorFn({ action: "close", error: error });
						$scope.closeDialog();
					});
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
				$scope.closeDialog = function()
				{
					return $q.all([$scope.showSaveDialog(false), $scope.showCancelDialog(false)]);
				};

				//====================
				//
				//====================
				$scope.clone = function(data)
				{
					if(data)
						return angular.fromJson(angular.toJson(data));
				};
			}]
		};
	}]);
});
