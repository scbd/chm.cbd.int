angular.module('kmApp').compileProvider // lazy
.directive('search', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search.partial.html?'+(new Date().getTime()),
        replace: true,
        // require : "?ngModel",
        scope: {
              // placeholder: '@',
              // ngDisabledFn : '&ngDisabled',
              // binding    : '=ngModel',
              // locales    : '=',
              // required   : "@"
        },
        link: function ($scope, element, attrs, ngModelController)
        {
            //ngProgress.start();
        },
        controller: ['$scope', '$q', '$timeout', '$location', 'ngProgress', function ($scope, $q, $timeout, $location, ngProgress)
        {
            var self = this;

            this.xhr = null;

            var iconMap = {
                'focalPoint'            : 'icon-user',
                'notification'          : 'icon-envelope',
                'pressRelease'          : 'icon-bullhorn',
                'statement'             : 'icon-microphone',
                'announcement'          : 'icon-rss',
                'event'                 : 'icon-calendar',
                'organization'          : 'icon-building',
                'resource'              : 'icon-book',
                'aichiTarget'           : 'icon-flag',
                'strategicPlanIndicator': 'icon-signal',
                'marineEbsa'            : 'icon-map-marker',
                'meeting'               : 'icon-calendar',
                'meetingDocument'       : 'icon-file',
                'decision'              : 'icon-legal',
                'recommendation'        : 'icon-legal',
                'nationalReport'        : 'icon-quote-left',
                'nationalTarget'        : 'icon-flag',
                'nationalIndicator'     : 'icon-signal',
                'progressAssessment'    : 'icon-eye-open',
                'implementationActivity': 'icon-retweet',
                'nationalSupportTool'   : 'icon-wrench'
            };

            $scope.icon = function (schema) {
                return iconMap[schema];
            }

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
            }

            $scope.fixHtml = function (htmlText) {
                htmlText = (htmlText || "").replace(/\r\n/g, '<br>')
            	htmlText = (htmlText || "").replace(/href="\//g, 'href="http://www.cbd.int/')
            	htmlText = (htmlText || "").replace(/href='\//g, "href='http://www.cbd.int/");

            	var qHtml = $('<div/>').html(htmlText);

            	qHtml.find("script,style").remove();

            	return qHtml.html();
            };

            $scope.fixUrl = function (url) {
                if(url) {
                         if(url.indexOf( "http://chm.cbd.int/")==0) url = url.substr("http://chm.cbd.int".length);
                    else if(url.indexOf("https://chm.cbd.int/")==0) url = url.substr("https://chm.cbd.int".length);
                }

                return url;
            }


            function readFacets(solrArray) {

                var facets = [];

                for (var i = 0; i < solrArray.length; i += 2) {

                    var facet = JSON.parse(solrArray[i]);

                    facets.push({ symbol: facet.symbol, title: facet.en, count: solrArray[i + 1] });
                }

                return facets;
            };         


            function readFacets2(solrArray) {

                var facets = [];

                for (var i = 0; i < solrArray.length; i += 2) {

                    var facet = solrArray[i];

                    facets.push({ symbol: facet, title: facet, count: solrArray[i + 1] });
                }

                return facets;
            };              

            self.query = function () {

                console.log("QUERY at " + new Date().toISOString());

                var q = 'realm_ss:chm AND schema_s:* AND ' + $scope.querySchema + ' AND ' + $scope.queryGovernment + ' AND ' + $scope.queryTheme + ' AND ' + $scope.queryTargets +' AND ' + $scope.queryDate + ' AND ' + $scope.queryKeywords;

                var queryParameters = {
                    'q': q,
                    'sort': 'createdDate_dt desc, title_t asc',
                    'fl': 'id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s,number_d,aichiTarget_ss,reference_s,sender_s,meeting_ss,recipient_ss,symbol_s,eventCity_EN_t,eventCountry_EN_t,startDate_s,endDate_s,body_s,code_s,meeting_s,group_s,function_t,department_t,organization_t,summary_EN_t,reportType_EN_t,completion_EN_t,jurisdiction_EN_t,development_EN_t',
                    'wt': 'json',
                    'start': $scope.currentPage * $scope.itemsPerPage,
                    'rows': 25,
                    'cb': new Date().getTime()
                };

                if (self.canceler != null) {
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

                    //ngProgress.complete();

                    if(!$scope.schemas) {
                        var queryFacetsParameters = {
                            'q': 'realm_ss:chm',
                            'fl': '',
                            'wt': 'json',
                            'rows': 0,
                            'facet': true,
                            'facet.field': ['schema_REL_ss', 'government_REL_ss', 'aichiTarget_REL_ss', 'thematicArea_REL_ss'],
                            'facet.limit': 512
                        };

                        $http.get('/api/v2013/index/select', { params: queryFacetsParameters }).success(function (data) {

                            $scope.schemas = readFacets2(data.facet_counts.facet_fields.schema_REL_ss);
                            $scope.governments = readFacets2(data.facet_counts.facet_fields.government_REL_ss);
                            $scope.regions = readFacets2(data.facet_counts.facet_fields.government_REL_ss);
                            $scope.aichiTargets = readFacets2(data.facet_counts.facet_fields.aichiTarget_REL_ss);
                            $scope.thematicAreas = readFacets2(data.facet_counts.facet_fields.thematicArea_REL_ss);
console.log($scope.aichiTargets);
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
                //ngProgress.reset();
                //ngProgress.start();

                if($scope.queryScheduled)
                    $timeout.cancel($scope.queryScheduled);

                $scope.queryScheduled = $timeout(function () { self.query(); }, 200);
            }

            $scope.$watch('currentPage',     search);
            $scope.$watch('querySchema',     function() { $scope.currentPage=0; search(); });
            $scope.$watch('queryGovernment', function() { $scope.currentPage=0; search(); });
            $scope.$watch('queryTargets',    function() { $scope.currentPage=0; search(); });
            $scope.$watch('queryTheme',      function() { $scope.currentPage=0; search(); });
            $scope.$watch('queryDate',       function() { $scope.currentPage=0; search(); });
            $scope.$watch('queryKeywords',   function() { $scope.currentPage=0; search(); });
        }]
    }
})

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider // lazy
.directive('bindIndeterminate', [function () {
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
angular.module('kmApp').compileProvider // lazy
.directive('searchFilterDates', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-filter-dates.partial.html?'+(new Date().getTime()),
        replace: true,
        scope: {
              title: '@title',
              query: '=query'//,
              //since: '=since',
              //until: '=until'
        },
        link: function ($scope, element, attrs, ngModelController) {
        },
        controller : ["$scope", function ($scope) {

            var now = new Date();

            $scope.dates = [
                { text: 'Any', date: '' },
                { text: 'Last day', date: new Date(new Date(now).setDate(now.getDate()-1)).toISOString() },
                { text: 'Last week', date: new Date(new Date(now).setDate(now.getDate()-7)).toISOString() },
                { text: 'Last two weeks', date: new Date(new Date(now).setDate(now.getDate()-14)).toISOString() },
                { text: 'Last month', date: new Date(new Date(now).setMonth(now.getMonth()-1)).toISOString() },
                { text: 'Last two months', date: new Date(new Date(now).setMonth(now.getMonth()-2)).toISOString() },
                { text: 'Last six months', date: new Date(new Date(now).setMonth(now.getMonth()-6)).toISOString() },
                { text: 'Last year', date: new Date(new Date(now).setMonth(now.getMonth()-12)).toISOString() },
            ];

            $scope.since = null;
            $scope.until = null;
            $scope.selectedDate = '';

            $scope.$watch('since', updateQuery);
            $scope.$watch('until', updateQuery);

            function updateQuery () {

                if($scope.since || $scope.until) {
                    var since = $scope.since ? $scope.since + 'T00:00:00.000Z' : '*';
                    var until = $scope.until ? $scope.until + 'T23:59:59.999Z' : '*';

                    $scope.query = ' ( createdDate_s:[ ' + since + ' TO ' + until + ' ] ) ';
                } else {
                    $scope.query = '*:*';
                }
                
                console.log($scope.query);
            };

            $scope.$watch('selectedDate', function (value) {
                $scope.since = $scope.selectedDate.date ? new Date($scope.selectedDate.date).toISOString().substr(0, 10) : null;
                $scope.until = null;
            });

            $scope.updateQuery = updateQuery;
        }]
    }
})

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('rowAichiTarget', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/row-aichi-target.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('rowProgressAssessment', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/row-progress-assessment.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('rowNotification', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/row-notification.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {
            $scope.formatDate = function formatDate (date) {
                return moment(date).format('MMMM Do YYYY');
            };
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('rowPressRelease', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/row-press-release.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {
            $scope.formatDate = function formatDate (date) {
                return moment(date).format('MMMM Do YYYY');
            };
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('rowMeeting', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/row-meeting.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {
            $scope.formatDate = function formatDate (date) {
                return moment(date).format('MMMM Do YYYY');
            };
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('rowStatement', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/row-statement.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {
            $scope.formatDate = function formatDate (date) {
                return moment(date).format('MMMM Do YYYY');
            };
            $scope.cleanTitle = function cleanTitle (text) {
                //text = text.replace('Braulio F. de Souza Dias', 'Braulio Ferreira de Souza Dias');
                //text = text.replace('Braulio F. de Souza Dias', 'Braulio Ferreira de Souza Dias');
                //text = text.replace('Braulio F. de Souza Dias', 'Braulio Ferreira de Souza Dias');

               return text;
            };
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('rowAnnouncement', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/row-announcement.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {
            $scope.formatDate = function formatDate (date) {
                return moment(date).format('MMMM Do YYYY');
            };
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('searchResult', function () {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-result.partial.html?'+(new Date().getTime()),
        controller: ["$scope", function ($scope) {

            var formatDate = function formatDate (date) {
                return moment(date).format('MMMM Do YYYY');
            };

            $scope.schema      = $scope.document.schema_EN_t.toUpperCase();
            $scope.title       = $scope.document.title_t;
            $scope.description = $scope.document.description_t;
            $scope.source      = $scope.document.government_EN_t;

            if($scope.document.schema_s=='focalPoint') {
                $scope.description  = $scope.document.function_t||'';
                $scope.description += ($scope.document.function_t && $scope.document.department_t) ? ', ' : '';
                $scope.description += $scope.document.department_t||'';
                $scope.description2 = $scope.document.organization_t||'';
            }

            if($scope.document.schema_s=='decision' && $scope.document.body_s=='XXVII8-COP' ) $scope.source = 'COP TO THE CONVENTION';
            if($scope.document.schema_s=='decision' && $scope.document.body_s=='XXVII8b-MOP') $scope.source = 'COP-MOP TO THE CARTAGENA PROTOCOL ON BIOSAFETY';
            if($scope.document.schema_s=='decision') $scope.title       = 'Decision ' + $scope.document.code_s;
            if($scope.document.schema_s=='decision') $scope.description = $scope.document.title_t;

            if($scope.document.schema_s=='recommendation' && $scope.document.body_s=='XXVII8-SBSTTA') { $scope.source = 'SBSTTA'; $scope.sourceTooltip = 'Subsidiary Body on Scientific, Technical and Technological Advice'; }
            if($scope.document.schema_s=='recommendation' && $scope.document.body_s=='XXVII8-WGRI'  ) { $scope.source = 'WGRI';   $scope.sourceTooltip = 'Working Group on the Review of Implementation'; }
            if($scope.document.schema_s=='recommendation' && $scope.document.body_s=='XXVII8b-ICCP' ) { $scope.source = 'ICCP';   $scope.sourceTooltip = 'Intergovernmental Committee for the Cartagena Protocol on Biosafety'; }
            if($scope.document.schema_s=='recommendation' && $scope.document.body_s=='XXVII8c-ICNP' ) { $scope.source = 'ICNP';   $scope.sourceTooltip = 'Intergovernmental Committee for the Nagoya Protocol on ABS'; }
            if($scope.document.schema_s=='recommendation') $scope.title       = 'Recommendation ' + $scope.document.code_s;
            if($scope.document.schema_s=='recommendation') $scope.description = $scope.document.title_t;

            if($scope.document.schema_s=='meetingDocument') $scope.source      = $scope.document.meeting_s;
            if($scope.document.schema_s=='meetingDocument') $scope.title       = $scope.document.symbol_s;
            if($scope.document.schema_s=='meetingDocument') $scope.description = $scope.document.title_t;
            if($scope.document.schema_s=='meetingDocument' && $scope.document.group_s=='INF') $scope.source += ' - INFORMATION';
            if($scope.document.schema_s=='meetingDocument' && $scope.document.group_s=='OFC') $scope.source += ' - PRE-SESSION';

            if($scope.document.schema_s=='nationalReport') $scope.description = $scope.document.summary_EN_t;
            if($scope.document.schema_s=='nationalReport') $scope.type        = $scope.document.reportType_EN_t;

            if($scope.document.schema_s=='implementationActivity') $scope.type = $scope.document.jurisdiction_EN_t + ' - ' + $scope.document.completion_EN_t;
            
            if($scope.document.schema_s=='marineEbsa') $scope.schema = 'ECOLOGICALLY OR BIOLOGICALLY SIGNIFICANT AREA';

            if($scope.document.schema_s=='event') {
                $scope.dates = formatDate(document.startDate_s) + ' to ' + formatDate(document.endDate_s);
                $scope.venue = document.eventCity_EN_t + ', ' + document.eventCountry_EN_t;
            }
        }]
    };
});

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider.directive('toggle', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            if(attrs.toggle=='tooltip')
                element.tooltip();
        }
    };
}]);