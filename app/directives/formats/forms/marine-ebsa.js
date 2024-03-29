define(['text!./marine-ebsa.html', 'app', 'angular', 'lodash', 'leaflet', 'app-data/maps/nasa-geo/config', 'leaflet-directive', 'authentication', '../views/marine-ebsa', './marine-ebsa-assessment', 'services/editFormUtility', 'directives/forms/form-controls', 'utilities/km-utilities', 'utilities/km-workflows', 'utilities/km-storage', 'services/navigation', 'directives/forms/km-rich-textbox'], function(template, app, angular, _, L, mapConfig) { 'use strict';

app.directive('editMarineEbsa', ["$http", "$q", "$location", "$filter", 'IStorage', "editFormUtility", "navigation", "authentication", "siteMapUrls", "Thesaurus", "guid", "$route", function ($http, $q, $location, $filter, storage, editFormUtility, navigation, authentication, siteMapUrls, Thesaurus, guid, $route) {
	return {
		restrict   : 'E',
		template   : template,
		replace    : true,
		transclude : false,
		scope      : {},
		link : function($scope)
		{
			$scope.status   = "";
			$scope.error    = null;
			$scope.document = null;
			$scope.tab      = "general";
			$scope.review   = { locale : "en" };
			$scope.mapConfig= mapConfig;

			// Ensure user as signed in
			navigation.securize();

			//==================================
			//
			//==================================
			$scope.init = function() {

				if ($scope.document)
					return;

				$scope.status = "loading";

				var promise = null;
				var schema  = "marineEbsa";
				var qs      = $route.current.params;

				if(qs.uid) { // Load
					promise = editFormUtility.load(qs.uid, schema);
				}
				else { // Create

					promise = $q.when(guid()).then(function(identifier) {
						return storage.drafts.security.canCreate(identifier, schema).then(function(isAllowed) {

							if (!isAllowed)
								throw { data: { error: "Not allowed" }, status: "notAuthorized" };

							return identifier;
						})
						;
					}).then(function(identifier) {

						return {
							header: {
								identifier: identifier,
								schema   : schema,
								languages: ["en"]
							}
						};
					});
				}


				return promise.then(function(doc) {

					if(!$scope.options)	{

						var decisionQuery = {
							q    : "schema_s:decision AND treaty_s:XXVII8 AND body_s:COP",
							rows : 999999,
							fl   : "title_t,symbol_s,event_s"
						};

						$scope.options  = {
							countries     : $http.get("/api/v2013/thesaurus/domains/countries/terms",                            { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
							ebsaRegions   : $http.get("/api/v2013/thesaurus/domains/0AE91664-5C43-46FB-9959-0744AD1B0E91/terms", { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
							libraries     : $http.get("/api/v2013/thesaurus/domains/cbdLibraries/terms",         { cache: true }).then(function(o){ return $filter('orderBy')(o.data, 'name'); }),
							copDecisions  : $http.get("/api/v2013/index/select", { params: decisionQuery, cache: true })
												 .then(function(res) {
												 	return _(res.data.response.docs).map(function(o) {
												 		return {
												 			identifier: o.symbol_s,
															title: (o.symbol_s + " - " + o.title_t),
															sortKey1:  (o.event_s ||'').replace(/\d+/g, pad0000),
															sortKey2:  (o.symbol_s||'').replace(/\d+/g, pad0000)
												 		};
													}).sortByOrder(['sortKey1', 'sortKey2'], ['desc', 'asc']).value();
												})
						};
					}

			        return doc;

				}).then(function(doc) {

					fixHtml(doc.location);
					fixHtml(doc.areaIntroducion);
					fixHtml(doc.areaDescription);
					fixHtml(doc.areaConditions);
					fixHtml(doc.areaFeatures);
					fixHtml(doc.referenceText);
					fixHtml(doc.relevantInformation);

					if(doc.assessments)
						doc.assessments.forEach(function(a) { fixHtml(a.justification) })

					$scope.status = "ready";
	
					$scope.document = doc;

				}).catch(function(err) {

					$scope.onError(err.data, err.status);
					throw err;

				});
			};

			$scope.onEditorFileUpload = function(data){
				if(!$scope.document.relevantDocuments)
					$scope.document.relevantDocuments = [];
				var editorImage = {
					url: data.url,
					name: data.filename,
					tag : 'editorImage'
				};
				$scope.document.relevantDocuments.push(editorImage);

			}

			$scope.onEditorPaste = function(html){

				if(html){
					var localeHtml = $('<div>'+html+'</div>')
					$(localeHtml).find('table').addClass('table');

					return localeHtml.html();

				}
				return html;
			}

			//==================================
			//
			//==================================
			function pad0000(v) {
				v = (v||'').toString();

				while(v.length<4)
					v = '0'+v;

				return v
			}

			//==================================
			//
			//==================================
			$scope.getCleanDocument = function(document) {
				document = document || $scope.document;

				if (!document)
					return;

				document = angular.fromJson(angular.toJson(document));

				if (document.approvedByGovernmentOn && document.approvedByGovernmentOn.indexOf('0001') === 0)
					document.approvedByGovernmentOn = undefined;

				if (document.recommendedToCopByGovernmentOn && document.recommendedToCopByGovernmentOn.indexOf('0001') === 0)
					document.recommendedToCopByGovernmentOn = undefined;

				if (/^\s*$/g.test(document.notes))
					document.notes = undefined;

				return document;
			};

			//==================================
			//
			//==================================
			$scope.validate = function() {

				$scope.validationReport = null;

				var oDocument = $scope.reviewDocument = $scope.getCleanDocument();

				return storage.documents.validate(oDocument).then(function(success) {

					$scope.validationReport = success.data;
					return !!(success.data && success.data.errors && success.data.errors.length);

				}).catch(function(error) {

					$scope.onError(error.data);
					return true;

				});
			};

			//==================================
			//
			//==================================
			$scope.$watch("document.gisFiles", function() {

				var qLinks = [];
				var qGis   = [];

				if ($scope.document)
					qLinks = $scope.document.gisFiles || [];

				angular.forEach(qLinks, function(link){
					qGis.push($http.get(link.url).then(function(res) { return L.geoJson(res.data); }));
				});

				$q.all(qGis).then(function(layers) {
					$scope.gisLayer = layers;
				});
			});

			//==================================
			//
			//==================================
			$scope.$watch('tab', function(tab) {

				if(!tab)
					return;

				if(tab == "general"   ) { $scope.prevTab = "general";    $scope.nextTab = "status"; }
				if(tab == "status"    ) { $scope.prevTab = "general";    $scope.nextTab = "assessment"; }
				if(tab == "assessment") { $scope.prevTab = "status";     $scope.nextTab = "review"; }
				if(tab == "review"    ) { $scope.prevTab = "assessment"; $scope.nextTab = "review"; }

				if (tab == 'review')
					$scope.validate();

			});

			//==================================
			//
			//==================================
			$scope.onPreSaveDraft = function() {
			};

			//==================================
			//
			//==================================
			$scope.onPrePublish = function() {
				return $scope.validate(false).then(function(hasError) {
					if (hasError)
						$scope.tab = "review";
					return hasError;
				});
			};

			//==================================
			//
			//==================================
			$scope.onPostWorkflow = function() {
				$location.url(siteMapUrls.management.workflows);
			};

			//==================================
			//
			//==================================
			$scope.onPostPublish = function() {
				$location.url('/submit/marineEbsa');
			};

			//==================================
			//
			//==================================
			$scope.onPostSaveDraft = function() {
				$location.url('/submit/marineEbsa');
			};

			//==================================
			//
			//==================================
			$scope.onPostClose = function() {
				if($location.search().returnUrl)
					$location.url($location.search().returnUrl);
				else
					$location.url('/submit/marineEbsa');
			};

			//==================================
			//
			//==================================
			$scope.onError = function(error, status)
			{
				$scope.status = "error";

				if (status == "notAuthorized") {
					$scope.status = "hidden";
					$scope.error  = "You are not authorized to modify this record";
				}
				else if (status == 404) {
					$scope.status = "hidden";
					$scope.error  = "Record not found.";
				}
				else if (status == "badSchema") {
					$scope.status = "hidden";
					$scope.error  = "Record type is invalid.";
				}
				else if (error.Message)
					$scope.error = error.Message;
				else
					$scope.error = error;
			};

			//==================================
			//
			//==================================
			$scope.loadRecords = function(identifier, schema) {

				if (identifier) //lookup single record
					return storage.documents.get(identifier, { info: "" })
						                    .then(function(res) {
						                    	return res.data;
						                    });

				//Load all record of specified schema;

				return storage.documents.query("type eq '" + encodeURI(schema) + "'", null, { cache: true })
									    .then(function(res) {
									    	return res.data.Items;
									    });
			};

			$scope.init();
		}
	};
}]);

function fixHtml(ltext) {

	if(!ltext) return ltext;

	if(typeof(ltext) == 'string') 
		return asHtml(ltext);

	for(var locale in ltext)
		ltext[locale] = asHtml(ltext[locale]);

	return ltext;
}

function asHtml(text) {

	if(text && text[0]!='<') {
		text =  '<p>' + text.replace(/\n/g, '<br>\n')
							.replace(/\s{2}/g, '&nbsp; ')
							.replace(/\t/g, '&nbsp; &nbsp; &nbsp; &nbsp; ') +
				'</p>';
	}

	return text;
}

});
