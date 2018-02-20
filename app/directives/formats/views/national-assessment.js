define(['app', 'text!./national-assessment.html', "lodash"], function(app, template, _){

app.directive('viewNationalAssessment', ["$q", "$http", "IStorage", "$location", function ($q, $http, storage, $location) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope: {
			document: "=ngModel",
			locale  : "=",
			target  : "@linkTarget",
			allowDrafts : "@"
		},
		link : function ($scope)
		{
			//===============
			//
			//===============
			$scope.$watch("document.nationalTarget", function(refs) {
				if(refs){
					$q.when(loadReferences([refs], { info : true })).then(function(result){
						$scope.nationalTarget = result;
					});
				}
			});

			//===============
			//
			//===============
			$scope.$watch("document.strategicPlanIndicators", function(refs) {
				if(refs){
					$q.when(loadReferences(refs, { info : true })).then(function(result){
						$scope.strategicPlanIndicators = result;
					});
				}
			});

			//===============
			//
			//===============
			function loadReferences(refs, options) {

				if (!refs)
					return;

				options = _.extend(options || {}, { cache: true });

				return $q.all(_.map(refs, function(ref) {
					return storage.documents.get(ref.identifier, options)
						.then(function(res) {
							return res.data;
						})
						.catch(function(e) {
							if (e.status == 404 && $location.path() != '/database/record') {
								return storage.drafts.get(ref.identifier)
								.then(function(res) {return res.data;}).catch(function(e) {});
							}
						});;
				}));
			}

			//==================================
			//
			//==================================
			var docCache = {};

			$scope.docInfo = function (item) {

				if(docCache[item.identifier])
					return docCache[item.identifier];

				docCache[item.identifier] = item;

				var params = buidQuery({
					schema_s: "nationalIndicator",
					identifier_s: item.identifier,
					_latest_s : true
				});

				return $http.get("/api/v2013/index", { params: params }).then(mapResult).then(function(records){
					docCache[item.identifier] = _.first(records) || item;
				});
			};

			//==================================
			//
			//==================================
			function buidQuery(options) {

				return {
					fl: "identifier_s,title_t,description_t",
					sort: "title_s ASC",
					rows:99999999,
					q: _.reduce(options, function(acc, value, key){
						if(acc)
							acc += " AND ";

						return acc + key + ":" + value;
					}, "")
				};
			}

			//==================================
			//
			//==================================
			function mapResult(res) {
				return _.map(res.data.response.docs, function(o) {
					return {
						identifier: o.identifier_s,
						title: o.title_t,
						description : o.description_t
					};
				});
			}

		}
	};
}]);
});
