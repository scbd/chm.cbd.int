define(['require', 'app', 'text!./form-loader.html', 'authentication', 'utilities/km-storage', 'utilities/km-utilities'], function(require, app, template){

app.directive('viewFormLoader', ["$rootScope", 'IStorage', "authentication", "localization", "$q", "$location", "$compile", function ($rootScope,    storage,   authentication,   localization,   $q,   $location,   $compile) {
	return {
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope: {
			linkTarget: "@",
			hideButtons: "@",
			document: "=",
			locale  : "="
		},
		link: function($scope, $element) {

			var formHolder = $element.find("#form-placeholder:first");

			$scope.internalDocument     = undefined;
			$scope.internalDocumentInfo = undefined;

			$scope.$watch("document", function(_new) { $scope.error=null; $scope.internalDocument = _new; });
			$scope.$watch("internalDocument", function(doc) {

				formHolder.empty();

				if(doc)
				{
					var name = snake_case(doc.header.schema);

					require(['./'+name], function(){

						var directiveHtml = '<DIRECTIVE ng-model="internalDocument" locale="getLocale()" link-target={{linkTarget}}></DIRECTIVE>'.replace(/DIRECTIVE/g, 'view-' + name);

						$scope.$apply(function(){
							formHolder.append($compile(directiveHtml)($scope));
						});
					});
				}
			});

			if($rootScope.showAcknowledgement)
			    $scope.showAcknowledgement = true;

			$rootScope.showAcknowledgement = undefined;

			//==================================
			//
			//==================================
			$scope.init = function () {
				if ($scope.internalDocument)
					return;

				if ($scope.document || $scope.schema)
					return;

				var oQsParams = $location.search();

				if (oQsParams.documentID || oQsParams.documentid)
					$scope.load(oQsParams.documentID || oQsParams.documentid);
				else
					$scope.error = "documentID not specified";
			};

			//==================================
			//
			//==================================
			$scope.getLocale = function () {
				return $scope.locale || localization.locale();
			};

			//==================================
			//
			//==================================
			$scope.load = function (identifier) {

				$scope.error = undefined;

				var qDocument     = storage.documents.get(identifier)                .then(function(result) { return result.data || result; });
				var qDocumentInfo = storage.documents.get(identifier, { info: true }).then(function(result) { return result.data || result; });

				$q.all([qDocument, qDocumentInfo]).then(function(results) {

					$scope.internalDocument = results[0];
					$scope.internalDocumentInfo = results[1];
				}).then(null, function(error) {

					$scope.errorNotFound = error && error.status==404;

					$scope.error = (error||{}).Message || error || ("Http Error: " + error.status);
				});
			};

			//==================================
			//
			//==================================
			$scope.user = function() {
				return authentication.user();
			};

			//==================================
			//
			//==================================
			$scope.edit = function() {
				if (!$scope.canEdit())
					throw "Cannot edit form";

				var schema     = $scope.internalDocumentInfo.type;
				var identifier = $scope.internalDocumentInfo.identifier;

				$location.search({ uid: identifier, returnUrl : $location.url() });
				$location.path("/management/edit/" + schema);
			};

			//==================================
			//
			//==================================
			$scope.delete = function() {

				if (!$scope.canDelete())
					throw "Cannot delete";

				var identifier    = $scope.internalDocumentInfo.identifier;
				var schema        = $scope.internalDocumentInfo.type;
				var qDocumentInfo = storage.documents.get(identifier, { info: true }).then(function(result) { return result.data || result; });
				var qCanDelete    = storage.documents.security.canDelete(identifier, schema);

				return $q.all([qDocumentInfo, qCanDelete]).then(function(results) {

					var documentInfo = results[0];
					var canDelete    = results[1];

					if (documentInfo.workingDocumentCreatedOn) {
						alert("There is a pending drafts. Cannot delete.");
						return;
					}

					if (!canDelete) {
						alert("You don't have sufficient privilege to delete this record.");
						return;
					}

					if (confirm("Delete the document?")) {
						return storage.documents.delete(identifier).then(function() {

							$location.url("/database");
						});
					}
				}).then(null, function(error){
					alert("ERROR:"+error);
					throw error;
				});
			};


			//==================================
			//
			//==================================
			$scope.canEdit = function() {
				if (!$scope.user().isAuthenticated)
					return false;

				if (!$scope.internalDocumentInfo)
					return false;

				if ($scope.internalCanEdit === undefined) {

					$scope.internalCanEdit = null; // avoid recall => null !== undefined

					var hasDraft   = !!$scope.internalDocumentInfo.workingDocumentCreatedOn;
					var identifier =   $scope.internalDocumentInfo.identifier;
					var schema     =   $scope.internalDocumentInfo.type;

					var qCanEdit = hasDraft ?
							       storage.drafts.security.canUpdate(identifier, schema): // has draft
								   storage.drafts.security.canCreate(identifier, schema); // has no draft

					qCanEdit.then(function(isAllowed) {

						$scope.internalCanEdit = isAllowed || false;

					}).then(null, function() {

						$scope.internalCanEdit = false;
					});
				}

				return $scope.internalCanEdit===true;
			};

			//==================================
			//
			//==================================
			$scope.canDelete = function() {

				$scope.deleteTooltip = undefined;

				if (!$scope.user().isAuthenticated)
					return false;

				if (!$scope.internalDocumentInfo)
					return false;

				if($scope.internalDocumentInfo.workingDocumentCreatedOn) {
					$scope.deleteTooltip = "Cannot delete record with pending drafts";
					return false;
				}

				if ($scope.internalCanDelete === undefined) {

					$scope.internalCanDelete = null; // avoid recall => null !== undefined

					var identifier =   $scope.internalDocumentInfo.identifier;
					var schema     =   $scope.internalDocumentInfo.type;

					var qCanDelete = storage.documents.security.canDelete(identifier, schema);

					qCanDelete.then(function(isAllowed) {

						$scope.internalCanDelete = isAllowed || false;

					}).then(null, function() {

						$scope.internalCanDelete = false;
					});
				}

				return $scope.internalCanDelete===true;
			};

			//==================================
			//
			//==================================
			function snake_case(name, separator) {
			  separator = separator || '-';
			  return name.replace(/[A-Z]/g, function(letter, pos) {
			    return (pos ? separator : '') + letter.toLowerCase();
			  });
			}

			$scope.init();
		}
	};
}]);
});
