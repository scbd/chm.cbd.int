define(['app', 'angular', 'lodash', 'text!./marine-ebsa.html', 'leaflet', 'leaflet-directive', 'utilities/km-storage'], function(app, angular, _, template, L){

app.directive('viewMarineEbsa', ['$http', '$q', "IStorage", function ($http, $q, storage) {
	return {
		restrict : 'E',
		template : template,
		scope: {
			document: "=ngModel",
			locale: "=",
			allowDrafts : "@",
			target : "@linkTarget"
		},
		link : function ($scope) {

   			$scope.fixDate = function(date) {

   				if(date && date.indexOf('0001')===0)
   					date = undefined;

   				return date;
   			};

			$scope.gisMapLayers = null;
			$scope.gisMapCenter = null;

			$scope.$watch("document.gisMapCenter", function(gisMapCenter) {
				$scope.gisMapCenter = angular.fromJson(angular.toJson(gisMapCenter));
			});

			$scope.$watch("document.gisFiles", function(gisFiles) {
				var qLinks = gisFiles || [];
				var qGis = [];

				angular.forEach(qLinks, function(link) {
					qGis.push($http.get(link.url, { headers: {Authorization:undefined}}).then(function (res) { return L.geoJson(res.data); }));
				});

				$q.all(qGis).then(function (layers) {
					$scope.gisMapLayers = layers;
				});
			});

			$scope.$watch("document.approvedByCopDecision", function(approvedByCopDecision) {

				$scope.approvedByCopDecision = undefined;

				if(approvedByCopDecision) {

					$q.when($http.get("/api/v2013/index/select", { params : { q : 'schema_s:decision AND decision_s:'+approvedByCopDecision.identifier, fl : "decision_s,title_t" } }, { cache: true })).then(function(res) {

						var count = res.data.response.numFound;
						var docs = res.data.response.docs;
						if(count)
						$scope.approvedByCopDecision = {
					 			identifier: docs[0].decision_s,
					 			title: (docs[0].decision_s + " - " + docs[0].title_t)
					 		};
					 	else
						$scope.approvedByCopDecision = {
					 			identifier: approvedByCopDecision.identifier,
					 			title: approvedByCopDecision.identifier
					 		};
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
		}
	};
}]);
});
