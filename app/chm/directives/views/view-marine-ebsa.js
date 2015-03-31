angular.module('kmApp') // lazy
.directive('viewMarineEbsa', [function () {
	return {
		restrict   : 'EAC',
		templateUrl: '/app/chm/directives/views/view-marine-ebsa.partial.html',
		//ERD : This is the only solution I've found to make sure the leaflet displays properly
		//replace    : true,
		//transclude : false,
		scope: {
			document: "=ngModel",
			locale: "=",
			allowDrafts : "@",
			target : "@linkTarget"
		},
		controller: ['$scope', '$http', '$q', "IStorage", function ($scope, $http, $q, storage)
		{
   			$scope.fixDate = function(date) {

   				if(date && date.indexOf('0001')==0)
   					date = undefined;

   				return date;
   			}

			$scope.gisMapLayers = null;
			$scope.gisMapCenter = null;

			$scope.$watch("document.gisMapCenter", function(gisMapCenter) {
				$scope.gisMapCenter = angular.fromJson(angular.toJson(gisMapCenter))
			});

			$scope.$watch("document.gisFiles", function(gisFiles) {
				var qLinks = gisFiles || [];
				var qGis = [];

				angular.forEach(qLinks, function(link) {
					qGis.push($http.get(link.url).then(function (res) { return L.geoJson(res.data) }));
				});

				$q.all(qGis).then(function (layers) {
					$scope.gisMapLayers = layers;
				})
			});

			$scope.$watch("document.approvedByCopDecision", function(approvedByCopDecision) {

				$scope.approvedByCopDecision = undefined;

				if(approvedByCopDecision) {

					$scope.approvedByCopDecision = $http.get("/api/v2013/index/select", { params : { q : 'schema_s:decision AND decision_s:'+approvedByCopDecision.identifier, fl : "decision_s,title_t" } }, { cache: true }).then(function(res) {

						var count = res.data.response.numFound;
						var docs = res.data.response.docs;

						if(count)
					 		return {
					 			identifier: docs[0].decision_s,
					 			title: (docs[0].decision_s + " - " + docs[0].title_t)
					 		}
					 	else
					 		return {
					 			identifier: approvedByCopDecision.identifier,
					 			title: approvedByCopDecision.identifier
					 		}
					 });
				}

			});


			//===============
			//
			//===============
			$scope.$watch("document.recommendedToAnyByOrganizations", function (refs) {
				$scope.recommendedToAnyByOrganizations = loadReferences(refs);
			});

			//===============
			//
			//===============
			$scope.$watch("document.recommendedToWorkshopByOrganizations", function (refs) {
				$scope.recommendedToWorkshopByOrganizations = loadReferences(refs);
			});

			//===============
			//
			//===============
			$scope.$watch("document.resources", function (refs) {
				$scope.resources = loadReferences(refs, { info: true });
			});

			//===============
			//
			//===============
			function loadReferences(refs, options) {

				if (!refs)
					return;

				options = _.extend(options || {}, { cache: true });

				return $q.all(_.map(refs, function (ref) {
					return storage.documents.get(ref.identifier, options)
						.then(function (res) {
							return res.data;
						});
				}));
			}
		}]
	}
}]);
