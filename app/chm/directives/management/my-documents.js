angular.module('kmApp').compileProvider // lazy
.directive("myDocuments", [function () {
	return {
		priority: 0,
		restrict: 'EAC',
		templateUrl: '/app/chm/directives/management/my-documents.partial.html',
		replace: true,
		transclude: false,
		scope: {
		},
		link: function($scope) {
			$scope.documents = null;
			$scope.schemasList = [
                { identifier: 'caseStudy', title: { en: 'Case Studies' } },
                { identifier: 'resource', title: { en: 'Virtual Library Resouces' } },
                { identifier: 'resourceMobilisation', title: { en: 'Resource Mobilisation' } },
                { identifier: 'marineEbsa', title: { en: 'Marine EBSA' } },
                { identifier: 'database', title: { en: 'National Database' } },
                { identifier: 'aichiTarget', title: { en: 'Aichi Biodiversity Target' } },
                { identifier: 'strategicPlanIndicator', title: { en: 'Strategic Plan Indicator' } },
                { identifier: 'nationalReport', title: { en: 'National Reports and Strategic Plans' } },
                { identifier: 'nationalTarget', title: { en: 'National Targets' } },
                { identifier: 'nationalIndicator', title: { en: 'National Indicator' } },
                { identifier: 'progressAssessment', title: { en: 'Progress Assessment' } },
                { identifier: 'nationalSupportTool', title: { en: 'Guidance and Support Tools' } },
                { identifier: 'implementationActivity', title: { en: 'Implementation Activity' } },
                { identifier: 'organization', title: { en: 'Biodiversity Related Organizations' } },
                { identifier: 'contact', title: { en: 'Contacts' } },
        	].sort(function(a,b){
			  var aName = a['title']['en'].toLowerCase();
			  var bName = b['title']['en'].toLowerCase();
			  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
          	});
		},
		controller : ['$scope', "$location", "IStorage", "schemaTypes", '$timeout', '$route', function ($scope, $location, storage, schemaTypes, $timeout, $route)
		{

			if($route.current.params.schema)
				$scope.selectedSchemasList = [$route.current.params.schema];

            $scope.loadScheduled = null;

			//==============================
			//
			//==============================
            $scope.search = function() {
                if($scope.loadScheduled)
                    $timeout.cancel($scope.loadScheduled);

                $scope.loadScheduled = $timeout(function () { $scope.load(); }, 200);
            }

			//==============================
			//
			//==============================
			$scope.load = function() {

				$scope.__loading = true;
				$scope.__error   = null;

				var qAnd = [];

				if (schemaTypes) {
					qAnd.push("(type eq '" + schemaTypes.join("' or type eq '") + "')")
				}

				if ($scope.selectedSchemasList) {
					qAnd.push("(type eq '" + $scope.selectedSchemasList.join("' or type eq '") + "')")
				}

				if($scope.freetext) {
					qAnd.push("(substringof('"+$scope.freetext+"', type) eq true" + " )");
				}

				$scope.documents = undefined;

				return storage.documents.query(qAnd.join(" and ")||undefined, "my", { "$skip": $scope.currentPage*$scope.nbItemsPerPage, "$top": $scope.nbItemsPerPage, "$orderby" : "type,documentID" }).then(function(result) {

					$scope.pageCount = Math.ceil(result.data.Count / $scope.nbItemsPerPage);
					$scope.pages = [];

					for (var i=0; i<$scope.pageCount; i++) {
  						$scope.pages.push(i);
  					}

					$scope.documents = result.data.Items;
					$scope.__loading = false;

					return result.data.Items;

				}).catch(function(error) {

					$scope.__error   = error;
					$scope.__loading = false;

				});
			}

			//==============================
			//
			//==============================
			$scope.edit = function(document)
			{
				$location.url("/management/edit/"+document.type+"?uid="+document.identifier);
			};

			//==============================
			//
			//==============================
			$scope.erase = function(document)
			{
				if(document.workingDocumentUpdatedOn)
				{
					alert("There is a pending documents. Cannot delete.")
					return;
				}

				storage.documents.security.canDelete(document.identifier, document.type).then(
					function(isAllowed) {
						if (!isAllowed) {
							alert("You are not authorized to delete this document?");
							return;
						}

						if (!confirm("Delete the document?"))
							return;

						storage.documents.delete(document.identifier).then(
							function(success) {
								$scope.documents.splice($scope.documents.indexOf(document), 1);
							},
							function(error) {
								alert("Error: " + error);
							});
					});
			};

			//==============================
			//
			//==============================
			function setPage (page) {
				$scope.currentPage = Math.max(0, Math.min($scope.pageCount-1, page|0));
			};

		    $scope.pageCount = 4;
			$scope.currentPage = 0;
    		//$scope.pages = [0, 1, 2, 3];
    		$scope.nbItemsPerPage = 25;

			$scope.actionSetPage = setPage;

			$scope.$watch('freetext', $scope.search);
			$scope.$watch('selectedSchemasList', $scope.search);
			$scope.$watch('currentPage', $scope.search);
		}]
	}
}]);
;
