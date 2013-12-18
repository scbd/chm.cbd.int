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
                { identifier: 'authority', title: { en: 'Competent National Authority' } },
                { identifier: 'database', title: { en: 'National Database' } },
                { identifier: 'measure', title: { en: 'National Measure' } },
                { identifier: 'absCheckpoint', title: { en: 'Checkpoint' } },
                { identifier: 'absCheckpointCommunique', title: { en: 'Checkpoint Communiqué' } },
                { identifier: 'absPermit', title: { en: 'Permit' } },
                { identifier: 'notification', title: { en: 'Notification' } },
                { identifier: 'meetingDocument', title: { en: 'Meeting Document' } },
                { identifier: 'pressRelease', title: { en: 'Press Release' } },
                { identifier: 'statement', title: { en: 'Statement' } },
                { identifier: 'meeting', title: { en: 'Meeting' } },
                { identifier: 'event', title: { en: 'Event' } },
                { identifier: 'decision', title: { en: 'Decision' } },
                { identifier: 'recommendation', title: { en: 'Recommendations' } },
        //        { identifier: 'CBD', title: { en: 'Convention on Biological Diversity' } },
        //        { identifier: 'COP', title: { en: 'Conference of the Parties to the Convention on Biological Diversity' } },
                { identifier: 'marineEbsa', title: { en: 'Marine EBSA' } },
                { identifier: 'meetingDocument', title: { en: 'Meeting Document' } },
                { identifier: 'nationalTarget', title: { en: 'National Target' } },
                { identifier: 'nationalIndicator', title: { en: 'National Indicator' } },
                { identifier: 'strategicPlanIndicator', title: { en: 'Strategic Plan Indicator' } },
                { identifier: 'aichiTarget', title: { en: 'Aichi Biodiversity Target' } },
                { identifier: 'implementationActivity', title: { en: 'Implementation Activity' } },
                { identifier: 'progressAssessment', title: { en: 'Progress Assessment' } },
                { identifier: 'nationalReport', title: { en: 'National Report' } },
                { identifier: 'organization', title: { en: 'ABS Related Organization' } },
                { identifier: 'announcement', title: { en: 'Announcement' } },
                { identifier: 'article', title: { en: 'Treaty Article' } },
                { identifier: 'nationalSupportTool', title: { en: 'Guidance and Support Tools' } },

                { identifier: 'XXVII8' , title: { en: 'Convention on Biological Diversity' } },
                { identifier: 'XXVII8a', title: { en: 'Cartagena Protocol on Biosafety to the Convention on Biological Diversity' } },
                { identifier: 'XXVII8b', title: { en: 'Nagoya Protocol on Access to Genetic Resources and the Fair and Equitable Sharing of Benefits Arising from their Utilization to the Convention on Biological Diversity' } },
                { identifier: 'XXVII8c', title: { en: 'Nagoya - Kuala Lumpur Supplementary Protocol on Liability and Redress to the Cartagena Protocol on Biosafety' } },

                { identifier: 'XXVII8-COP' , title: { en: 'Conference of the Parties to the Convention on Biological Diversity' } },
                { identifier: 'XXVII8-SBSTTA' , title: { en: 'Subsidiary Body on Scientific, Technical and Technological Advice' } },
                { identifier: 'XXVII8-WGRI' , title: { en: 'Ad Hoc Open-ended Working Group on the Review of Implementation of the Convention' } },
                 { identifier: 'XXVII8b-ICCP' , title: { en: 'Intergovernmental Committee for the Cartagena Protocol on Biosafety' } },
                 { identifier: 'XXVII8b-MOP' , title: { en: 'Conference of the Parties serving as the Meeting of the Parties (COP-MOP) to the Cartagena Protocol on Biosafety' } },
                 { identifier: 'XXVII8c-ICNP' , title: { en: 'Open-ended Ad Hoc Intergovernmental Committee for the Nagoya Protocol on ABS' } },

                 { identifier: 'CHM-FP'   , title: { en: 'Clearing-House Mechanism National Focal Point' } },
                { identifier: 'CBD-FP1'  , title: { en: 'CBD National Focal Point' } },
                { identifier: 'CBD-FP2'  , title: { en: 'CBD Secondary National Focal Point' } },
                { identifier: 'GTI-FP'   , title: { en: 'Global Taxonomy Initiative National Focal Point' } },
                { identifier: 'SBSTTA-FP', title: { en: 'SBSTTA Focal Point' } },
                { identifier: 'TKBD-FP'  , title: { en: 'Traditional Knowledge National Focal Point' } },
                { identifier: 'RM-FP'    , title: { en: 'Resource Mobilization Focal Point' } },
                { identifier: 'ABS-IC'   , title: { en: 'National Focal Point to the Intergovernmental Committee for the Nagoya Protocol on ABS' } },
                { identifier: 'GSPC-FP'  , title: { en: 'Global Strategy for Plant Conservation National Focal Point' } },
                { identifier: 'PA-FP'    , title: { en: 'Programme of Work on Protected Areas National Focal Point' } },
                { identifier: 'BCH-FP'   , title: { en: 'BCH National Focal Point' } },
                { identifier: 'CPB-FP1'  , title: { en: 'Cartagena Protocol National Focal Point' } },
                { identifier: 'CPB-FP2'  , title: { en: 'Cartagena Protocol Secondary National Focal Point' } }
        	];
		},
		controller : ['$scope', "$location", "IStorage", "ngProgress", "schemaTypes", function ($scope, $location, storage, ngProgress, schemaTypes) 
		{
			//==============================
			//
			//==============================
			$scope.load = function() {
				if(!$scope.loading)
				{
					$scope.loading = true;
					ngProgress.start();

					$scope.__loading = true;
					$scope.__error   = null;

					var sQuery = undefined;

					/*
					if (schemaTypes)
						sQuery = "(type eq '" + schemaTypes.join("' or type eq '") + "')"
					*/
					if ($scope.selectedSchemasList)
					{
						sQuery = "(type eq '" + $scope.selectedSchemasList.join("' or type eq '") + "')"
						//debugger;
					}

					$scope.documents = undefined;

					return storage.documents.query(sQuery, "my", { q: $scope.freetext, sk: $scope.currentPage*$scope.nbItemsPerPage, l: $scope.nbItemsPerPage }).then(function(result) {
						//debugger;
						$scope.pageCount = Math.ceil(result.data.Count / $scope.nbItemsPerPage);
						$scope.pages = [];
						for (var i=0; i<$scope.pageCount; i++)
						{
      						$scope.pages.push(i);
      					}
    					//return input;
						$scope.documents = result.data.Items;
						$scope.__loading = false;

						return result.data.Items;

					}).catch(function(error) {

						$scope.__error   = error;
						$scope.__loading = false;

					}).finally(function(){
						ngProgress.complete();
						$scope.loading = undefined;
					});
				}
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

			$scope.$watch('freetext', $scope.load);
			$scope.$watch('selectedSchemasList', $scope.load);
			$scope.$watch('currentPage', $scope.load);
		}]
	}
}]);
;