define(['text!./search.html',
		'app',
		"utilities/km-utilities",
		"./search-result",
		"./search-filter-keywords",
		"./search-filter-schemas",
		"./search-filter-countries",
		"./search-filter-regions",
		"./search-filter-facets",
		"./search-filter-themes",
		"./search-filter-dates",
		"./row-aichi-target",
		"./row-announcement",
		"./row-meeting",
		"./row-notification",
		"./row-press-release",
		"./row-national-assessment",
		"./row-statement"

	], function(template, app) { 'use strict';

	app.directive('search', ['$http', 'realm', function ($http, realm) {
	    return {
	        restrict: 'EAC',
	        template: template,
	        replace: true,
	        scope: {
	        },
	        controller: ['$scope', '$q', '$timeout', '$location', function ($scope, $q, $timeout, $location)
	        {
	            var self = this;

	            this.xhr = null;

	            var iconMap = {
	                'focalPoint'            : 'fa fa-user',
	                'notification'          : 'icon-envelope',
	                'pressRelease'          : 'icon-bullhorn',
	                'statement'             : 'icon-microphone',
	                'announcement'          : 'icon-rss',
	                'event'                 : 'icon-calendar',
	                'organization'          : 'icon-building',
	                'resource'              : 'fa fa-book',
	                'aichiTarget'           : 'fa fa-flag',
	                'strategicPlanIndicator': 'icon-signal',
	                'marineEbsa'            : 'icon-map-marker',
	                'meeting'               : 'icon-calendar',
	                'meetingDocument'       : 'fa fa-file-o',
	                'decision'              : 'icon-legal',
	                'recommendation'        : 'icon-legal',
	                'nationalReport'        : 'icon-quote-left',
	                'nationalTarget'        : 'fa fa-flag',
	                'nationalIndicator'     : 'icon-signal',
	                'nationalAssessment'    : 'icon-eye-open',
	                'implementationActivity': 'icon-retweet',
	                'nationalSupportTool'   : 'icon-wrench',
					'resourceMobilisation'  : 'fa fa-university'
	            };

	            $scope.icon = function (schema) {
	                return iconMap[schema];
	            };

	            $scope.actionSetPage = function (pageNumber) {
	                $scope.currentPage = Math.min($scope.pageCount-1, Math.max(0, pageNumber));
	            };

	            $scope.loaded          = false;
	            $scope.itemsPerPage    = 25;
	            $scope.pageCount       = 0;
	            $scope.currentPage     = 0;
	            $scope.querySchema     = '*:*';
	            $scope.queryGovernment = '*:*';
	            $scope.queryTargets    = '*:*';
	            $scope.queryTheme      = '*:*';
	            $scope.queryDate       = '*:*';
	            $scope.queryKeywords   = '*:*';

	            if($location.search().q) {
	                $scope.keywords = $location.search().q;
	                $location.replace();
	                $location.search({});
	            }

	            $scope.fixHtml = function (htmlText) {
	                htmlText = (htmlText || "").replace(/\r\n/g, '<br>');
					htmlText = (htmlText || "").replace(/href="\//g, 'href="http://www.cbd.int/');
					htmlText = (htmlText || "").replace(/href='\//g, "href='http://www.cbd.int/");

					var qHtml = $('<div/>').html(htmlText);

					qHtml.find("script,style").remove();

					return qHtml.html();
	            };

	            $scope.fixUrl = function (url) {
	                if(url) {
						     if(url.indexOf( "http://chm.cbd.int/")==0) url = url.substr("http://chm.cbd.int" .length); // jshint ignore:line
	                    else if(url.indexOf("https://chm.cbd.int/")==0) url = url.substr("https://chm.cbd.int".length); // jshint ignore:line
	                }

	                return url;
	            };


	            function readFacets2(solrArray) {

	                var facets = [];

	                for (var i = 0; i < solrArray.length; i += 2) {

	                    var facet = solrArray[i];

	                    facets.push({ symbol: facet, title: facet, count: solrArray[i + 1] });
	                }

	                return facets;
	            }

	            self.query = function () {

	                // NOT version_s:* remove non-public records from resultset
	                var q = 'NOT version_s:* AND realm_ss:' + realm.toLowerCase() + ' AND schema_s:* AND ' + $scope.querySchema + ' AND ' + $scope.queryGovernment + ' AND ' + $scope.queryTheme + ' AND ' + $scope.queryTargets +' AND ' + $scope.queryDate + ' AND ' + $scope.queryKeywords;

	                var queryParameters = {
	                    'q': q,
	                    'sort': 'createdDate_dt desc, title_t asc',
	                    'fl': 'id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
	                    'wt': 'json',
	                    'start': $scope.currentPage * $scope.itemsPerPage,
	                    'rows': 25,
	                    'cb': new Date().getTime()
	                };

	                if (self.canceler) {
	                    console.log('trying to abort pending request...');
	                    self.canceler.resolve(true);
	                }

	                self.canceler = $q.defer();

	                $http.get('/api/v2013/index/select', { params: queryParameters, timeout: self.canceler.promise }).success(function (data) {

	                    self.canceler = null;

	                    $scope.count = data.response.numFound;
	                    $scope.start = data.response.start;
	                    $scope.stop  = data.response.start+data.response.docs.length-1;
	                    $scope.rows  = data.response.docs.length;

	                    $scope.documents = data.response.docs;

	                    $scope.pageCount = Math.ceil(data.response.numFound / $scope.itemsPerPage);

	                    if(!$scope.schemas) {
	                        var queryFacetsParameters = {
	                            'q': 'NOT version_s:* AND realm_ss:'+ realm,
	                            'fl': '',
	                            'wt': 'json',
	                            'rows': 0,
	                            'facet': true,
	                            'facet.field': ['schema_s', 'government_REL_ss', 'aichiTarget_REL_ss', 'thematicArea_REL_ss'],
	                            'facet.limit': 512
	                        };

	                        $http.get('/api/v2013/index/select', { params: queryFacetsParameters }).success(function (data) {
	                            $scope.schemas = readFacets2(data.facet_counts.facet_fields.schema_s);
	                            $scope.governments = readFacets2(data.facet_counts.facet_fields.government_REL_ss);
	                            $scope.regions = readFacets2(data.facet_counts.facet_fields.government_REL_ss);
	                            $scope.aichiTargets = readFacets2(data.facet_counts.facet_fields.aichiTarget_REL_ss);
	                            $scope.thematicAreas = readFacets2(data.facet_counts.facet_fields.thematicArea_REL_ss);

	                        }).error(function (error) { console.log('onerror'); console.log(error); } );
	                    }
	                }).error(function (error) { console.log('onerror'); console.log(error); });
	            };

	            $scope.range = function (start, end) {

	                var ret = [];
	                if (!end) {
	                    end = start;
	                    start = 0;
	                }

	                var maxCount = 10;
	                var middle = 5;
	                var count = end - start;

	                if (count > maxCount) {
	                    if ($scope.currentPage > middle)
	                        start = $scope.currentPage - middle;

	                    end = Math.min(count, start + maxCount);
	                    start = Math.max(0, end - maxCount);
	                }

	                for (var i = start; i < end; i++) {
	                    ret.push(i);
	                }
	                return ret;
	            };

	            $scope.queryScheduled = null;
	            function search() {

	                if($scope.queryScheduled)
	                    $timeout.cancel($scope.queryScheduled);

	                $scope.queryScheduled = $timeout(function () { self.query(); }, 100);
	            }

	            $scope.$watch('currentPage',     search);
	            $scope.$watch('querySchema',     function() { $scope.currentPage=0; search(); });
	            $scope.$watch('queryGovernment', function() { $scope.currentPage=0; search(); });
	            $scope.$watch('queryTargets',    function() { $scope.currentPage=0; search(); });
	            $scope.$watch('queryTheme',      function() { $scope.currentPage=0; search(); });
	            $scope.$watch('queryDate',       function() { $scope.currentPage=0; search(); });
	            $scope.$watch('queryKeywords',   function() { $scope.currentPage=0; search(); });
	        }]
	    };
	}]);

	//============================================================
	//
	//
	//============================================================
	app.directive('bindIndeterminate', [function () {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            scope.$watch(attrs.bindIndeterminate, function (value) {
	                element[0].indeterminate = value;
	            });
	        }
	    };
	}]);

	//============================================================
	//
	//
	//============================================================
	app.directive('toggle', [function () {
	    return {
	        restrict: 'A',
	        link: function (scope, element, attrs) {
	            if(attrs.toggle=='tooltip')
	                element.tooltip();
	        }
	    };
	}]);
});
