define(['require', 'app', 'text!./form-loader.html','lodash', 'authentication', 
'utilities/km-storage', 'utilities/km-utilities', 'scbd-angularjs-services/locale', 'services/realmConfig',
'./directives/document-date'], function(require, app, template,_){

app.directive('viewFormLoader', ["$rootScope", 'IStorage', "authentication", "locale", "$q", "$location", "$compile", "$route", 
"navigation","$http", '$timeout', 'realmConfig',
function ($rootScope,    storage,   authentication,   locale,   $q,   $location,   $compile, $route, navigation,$http, $timeout, realmConfig) {
	return {
		restrict: 'E',
		template: template,
		replace: true,
		transclude: false,
		scope: {
			linkTarget: "@",
			hideButtons: "@",
			document: "=",
			locale  : "=",
			documentId  : "@"
		},
		link: function($scope, $element) {
			$scope.options = { locale : $scope.locale||locale };

			var queryString = $location.search();
			if(queryString && queryString.print){
				$scope.printMode = true;
				require(['css!/app/css/print-friendly'])
			}
			var formHolder = $element.find("#form-placeholder:first");

			$scope.internalDocument     = undefined;
			$scope.internalDocumentInfo = undefined;

			$scope.$watch("document", function(_new) { $scope.error=null; $scope.internalDocument = _new; });
			$scope.$watch("internalDocument", function(doc) {

				formHolder.empty();

				if(doc && doc.header)
				{

					var name = snake_case(doc.header.schema );

					require(['./'+name], function(){

						var directiveHtml = '<DIRECTIVE ng-model="internalDocument" locale="getLocale()" header="false" link-target={{linkTarget}}></DIRECTIVE>'.replace(/DIRECTIVE/g, 'view-' + name);

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

				var documentID  = $route.current.params.documentid || $route.current.params.documentID || $scope.documentId;
				var documentRevision  = $route.current.params.documentRevision || $route.current.params.documentRevision || $scope.documentRevision;
				if(documentRevision)
					documentID += '@'+documentRevision;

				if (documentID)
					$scope.load(documentID);
				else
					$scope.error = "documentID not specified";
			};

			//==================================
			//
			//==================================
			$scope.getLocale = function () {
				return $scope.locale || $scope.options.locale || locale;
			};
			//==================================
			//
			//==================================
			$scope.load = function (identifier) {

				if($location.search().schema==='bbiRequest') return $scope.loadBbiRequest(identifier);
				$scope.error = undefined;

				var qDocument     = storage.documents.get(identifier)                .then(function(result) { return result.data || result; });
				var qDocumentInfo = storage.documents.get(identifier, { info: true }).then(function(result) { return result.data || result; });

				$q.all([qDocument, qDocumentInfo]).then(function(results) {

					$scope.internalDocument = results[0];
					$scope.internalDocumentInfo = results[1];

					if(results[1].type=='nationalIndicator' || results[1].type=='nationalTarget' || results[1].type=='nationalAssessment'){
						$scope.hideButtons = 'true';
					}
				}).then(null, function(error) {

					$scope.errorNotFound = error && error.status==404;

					$scope.error = (error||{}).Message || error || ("Http Error: " + error.status);
				});
			};
			//==================================
			//
			//==================================
			$scope.loadBbiRequest = function (identifier) {

				var params = {

						f:{history:0}
				};
					return $http.get('/api/v2016/bbi-requests/' +identifier, {'params': params}).then(function(response){

						if(!isEmpty(response.data)){

							$scope.internalDocument=response.data;
							$scope.internalDocument.header={};
							$scope.internalDocument.header.schema='bbiRequest';
						}else
							$scope.internalDocument=false;

					});
			};

			function isEmpty(item) {
				if((typeof item === "object" && !Array.isArray(item) && item !== null))
    			return Object.keys(item).length === 0;
				else if (Array.isArray(item))
				  return item.length;
				else
					return item;
			}

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
				if($location.search().schema==='bbiRequest' && $scope.canEdit())
					$location.path(navigation.editUrl('bbiRequest', identifier));
				if (!$scope.canEdit())
					throw "Cannot edit form";

				var schema     = $scope.internalDocumentInfo.type ;
				var identifier = $scope.internalDocumentInfo.identifier;

				$location.search({ returnUrl : $location.url() });

				$location.path(navigation.editUrl(schema, identifier));
			};


			//==================================
			//
			//==================================
			$scope.delete = function() {
				if($scope.internalDocument && $scope.internalDocument.header.schema==='bbiRequest' && canEditBbiRequest()) return delMongo($scope.internalDocument);
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
				if($scope.internalDocument && $scope.internalDocument.header && $scope.internalDocument.header.schema==='bbiRequest') return canEditBbiRequest();
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
			function canEditBbiRequest() {
					if (!$scope.user().isAuthenticated || !$scope.internalDocument)
						return false;

					if($scope.internalDocument.meta.createdBy===$scope.user().userID ||(!!_.intersection($scope.user().roles, ["Administrator","ChmAdministrator", "BBiAdministrator","ChmDocumentValidationTeamMember"]).length))
								return true;
					else 	return false;

			}
			//==================================
			//
			//==================================
			$scope.canDelete = function() {
				if($scope.internalDocument && $scope.internalDocument.header && $scope.internalDocument.header.schema==='bbiRequest')return  canEditBbiRequest();
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

			//======================================================
			//
			//
			//======================================================
			function delMongo(record) {

				if (confirm("Delete the document?")) {
							var meta ={status:'deleted'};
										return $http.put('/api/v2016/bbi-requests/'+record._id,{meta:meta,'_id':record._id}).then(function() {
												$scope.$emit('showSuccess', 'Assitance Request ' + record.identifier_s + ' Deleted');
												$location.url("/database");
										}).catch(	$scope.onError);

				}

			}
			//==================================
			//
			//==================================
			function snake_case(name, separator) {
			  separator = separator || '-';
			  return name.replace(/[A-Z]|\d+/g, function(letter, pos) {
			    return (pos ? separator : '') + letter.toLowerCase();
			  });
			}

			$scope.init();


			$scope.print = function(){
				$scope.printing = true;
				require(['printThis', 'text!./print-header.html', 'text!./print-footer.html'], function(printObj, header, footer){						
					$element.parent().parent().parent().find('#schemaView').printThis({
						debug:false,
						printContainer:true,
						importCSS:true,
						importStyle : true,
						pageTitle : $('title').text(),
						loadCSS : '/app/css/print-friendly.css?v='+window.appVersion,
						header : header,
						footer : footer
					});	
					$timeout(function(){$scope.printing = false;},500);
				});				
			}
			function loadDocumentHistory(){
				$q.when($scope.user())
				.then(function(user){
					if(user && realmConfig.isChmAdministrator(user)){
						require(['./directives/document-history'], function(){
							
							var historyHolder = $element.find("#history-placeholder:first");
							historyHolder.empty();
							var directiveHtml = '<document-history ng-model="internalDocument" locale="getLocale()"></document-history>';	
							$scope.$apply(function(){
								historyHolder.append($compile(directiveHtml)($scope));
							});
						});
					}
				})
			}
			loadDocumentHistory();
		}
	};
}]);
});
