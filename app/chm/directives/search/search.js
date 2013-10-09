angular.module('kmApp').compileProvider // lazy
.directive('search', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search.partial.html',
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
        },
        controller: ['$scope', '$q', function ($scope, $q)
        {
            var self = this;

            this.xhr = null;

            $scope.actionSetPage = function (pageNumber) {
                $scope.currentPage = Math.min($scope.pageCount-1, Math.max(0, pageNumber));
            };

            $scope.loaded = false;
            $scope.itemsPerPage = 25;
            $scope.pageCount = 0;
            $scope.currentPage = 0;
            $scope.querySchema = '*:*';
            $scope.queryGovernment = '*:*';
            $scope.queryTheme    = '*:*';
            $scope.queryBody     = '*:*';
            $scope.queryDate     = '*:*';
            $scope.queryKeywords = '*:*';
            $scope.query07 = '*:*';
            $scope.query08 = '*:*';
            $scope.query09 = '*:*';
            $scope.query10 = '*:*';
            $scope.query11 = '*:*';
            $scope.query12 = '*:*';
            $scope.query13 = '*:*';

            $scope.fixHtml = function (htmlText) {
                htmlText = (htmlText || "").replace(/\r\n/g, '<br>')
            	htmlText = (htmlText || "").replace(/href="\//g, 'href="http://www.cbd.int/')
            	htmlText = (htmlText || "").replace(/href='\//g, "href='http://www.cbd.int/");

            	var qHtml = $('<div/>').html(htmlText);

            	qHtml.find("script,style").remove();

            	return qHtml.html();
            };

            function readFacets(solrArray) {

                var facets = [];

                for (var i = 0; i < solrArray.length; i += 2) {

                    var facet = JSON.parse(solrArray[i]);

                    facets.push({ symbol: facet.symbol, title: facet.en, count: solrArray[i + 1] });
                }

                return facets;
            };         

            function search() {
                $scope.currentPage = 0;
                query();
            }

            function query() {

                console.log("QUERY");

                var q = 'realm_ss:chm AND ' + $scope.querySchema + ' AND ' + $scope.queryGovernment + ' AND ' + $scope.queryTheme + ' AND ' + $scope.queryBody + ' AND ' + $scope.queryDate + ' AND ' + $scope.queryKeywords + ' AND ' + $scope.query07 + ' AND ' + $scope.query08 + ' AND ' + $scope.query09 + ' AND ' + $scope.query10 + ' AND ' + $scope.query11 + ' AND ' + $scope.query12 + ' AND ' + $scope.query13;

                var queryParameters = {
                    'q': q,
                    'fl': 'id,title_t,description_t,url_ss,schema_EN_t,date_dt,government_EN_t,schema_s',
                    'wt': 'json',
                    'start': $scope.currentPage * $scope.itemsPerPage,
                    'rows': 25
                };

                if (self.canceler != null)
                    self.canceler.resolve();

                self.canceler = $q.defer();

                self.xhr = $http.get('/api/v2013/index/select', { params: queryParameters, timeout: self.canceler.promise }).success(function (data) {

                    $scope.count = data.response.numFound;
                    $scope.start = data.response.start;
                    $scope.stop  = data.response.start+data.response.docs.length-1;
                    $scope.rows  = data.response.docs.length;

                    $scope.documents = data.response.docs;

                    $scope.pageCount = Math.ceil(data.response.numFound / $scope.itemsPerPage);

                    queryParameters['facet'] = true;
                    queryParameters['facet.field'] = ['schema_CEN_s', 'government_CEN_s', 'thematicArea_CEN_ss', 'body_CEN_s', 'measureType_CEN_s', 'measureStatus_CEN_s', 'measureScope_CEN_ss', 'organizationType_CEN_s', 'geneticResourceType_CEN_ss', 'geneticResourceArea_CEN_ss', 'libraryResourceType_CEN_ss'];
                    queryParameters['facet.limit'] = 256;

                    self.canceler = $q.defer();

                    $http.get('/api/v2013/index/select', { params: queryParameters, timeout: self.canceler.promise }).success(function (data) {

                        $scope.schemas = readFacets(data.facet_counts.facet_fields.schema_CEN_s);
                        $scope.governments = readFacets(data.facet_counts.facet_fields.government_CEN_s);
                        $scope.thematicAreas = readFacets(data.facet_counts.facet_fields.thematicArea_CEN_ss);
                        $scope.bodies = readFacets(data.facet_counts.facet_fields.body_CEN_s);
                        $scope.measureTypes = readFacets(data.facet_counts.facet_fields.measureType_CEN_s);
                        $scope.measureStatuses = readFacets(data.facet_counts.facet_fields.measureStatus_CEN_s);
                        $scope.measureScopes = readFacets(data.facet_counts.facet_fields.measureScope_CEN_ss);
                        $scope.organizationTypes = readFacets(data.facet_counts.facet_fields.organizationType_CEN_s);
                        $scope.geneticResourceTypes = readFacets(data.facet_counts.facet_fields.geneticResourceType_CEN_ss);
                        $scope.geneticResourceAreas = readFacets(data.facet_counts.facet_fields.geneticResourceArea_CEN_ss);
                        $scope.libraryResourceTypes = readFacets(data.facet_counts.facet_fields.libraryResourceType_CEN_ss);

                        $scope.showMeasureTypes = $scope.isRelevant($scope.measureTypes);
                        $scope.showMeasureStatuses = $scope.isRelevant($scope.measureStatuses);
                        $scope.showMeasureScopes = $scope.isRelevant($scope.measureScopes);
                        $scope.showOrganizationTypes = $scope.isRelevant($scope.organizationTypes);
                        $scope.showGeneticResourceTypes = $scope.isRelevant($scope.geneticResourceTypes);
                        $scope.showGeneticResourceAreas = $scope.isRelevant($scope.geneticResourceAreas);
                        $scope.showLibraryResourceTypes = $scope.isRelevant($scope.libraryResourceTypes);

                        self.canceler = null;

                    }).error(function (data) { console.log('ABORTED'); } );
                }).error(function (data) { console.log('ABORTED'); });
            };

            $scope.isRelevant = function (facets) {
                
                if(facets.length==0 || $scope.count==0)
                    return false;

                var sum = _.reduce(_.pluck(facets, 'count'), function (a, b) { return a + b; } );

                return (sum / $scope.count) > 0.8;
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

            $scope.$on('refresh', function () {
                console.log(123);
                query();
            });

            $scope.makeRelativeUrl = function (url) {
                if(url.indexOf("http://chm.cbd.int/" )==0) return url.substr("http://chm.cbd.int".length);
                if(url.indexOf("https://chm.cbd.int/")==0) return url.substr("https://chm.cbd.int".length);

                return url;
            }

            $scope.$watch('currentPage', function (newValue, oldValue) { if (newValue != oldValue) query(); });
            $scope.$watch('querySchema', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('queryGovernment', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('queryTheme', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('queryBody', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('queryDate', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('queryKeywords', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('query07', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('query08', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('query09', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('query10', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('query11', function (newValue, oldValue) { if (newValue != oldValue) search(); });
            $scope.$watch('query12', function (newValue, oldValue) { if (newValue != oldValue) search(); });

            query(); // init
        }]
    }
})

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider // lazy
.directive('searchFacet', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-facet.partial.html',
        replace: true,
        // require : "?ngModel",
        scope: {
              // placeholder: '@',
              // ngDisabledFn : '&ngDisabled',
              title: '@title',
              items: '=ngModel',
              field: '@field',
              query: '=query',
              // locales    : '=',
              // rows       : '=',
              // required   : "@"
        },
        link: function ($scope, element, attrs, ngModelController)
        {
        },
        controller : ['$scope', '$window', function ($scope, $window)
        {
            $scope.expanded = false;
            $scope.selectedItems = [];
            $scope.facet = $scope.field.replace('_s', ''); // TODO: replace @field by @facet

            var parameters = $window.URI().search(true);

            if (parameters[$scope.facet]) {
                $scope.selectedItems.push(parameters[$scope.facet]);
                $scope.$broadcast('refresh');
            }

            $scope.isSelected = function(item) {
                return $.inArray(item.symbol, $scope.selectedItems) >= 0;
            };

            $scope.actionSelect = function(item) {

                if($scope.isSelected(item)) {
                    $scope.selectedItems.splice($.inArray(item.symbol, $scope.selectedItems), 1);
                } else {
                    $scope.selectedItems.push(item.symbol);
                }

                $scope.updateQuery();
            };

            $scope.actionExpand = function() {
                if(!$scope.expanded)
                    $scope.$parent.$broadcast('onExpand', $scope);

                $scope.expanded = !$scope.expanded;
            };

            $scope.$on('onExpand', function(scope) {
                if(scope!=$scope && $scope.expanded)
                    $scope.expanded = false;
            });

            $scope.filterx = function(item) {
                return $scope.isSelected(item) || $scope.expanded;
            };

            $scope.ccc = function(item) {
                return $scope.isSelected(item) ? 'facet selected' : 'facet unselected';
            };

            $scope.updateQuery = function() {

                console.log($scope.query);
                
                $scope.query = '';

                $scope.selectedItems.forEach(function(item) {
                    $scope.query += ($scope.query=='' ? '' : ' OR ') + $scope.field+':' + item;
                });

                if($scope.query!='')
                    $scope.query = '(' + $scope.query + ')';
                else
                    $scope.query = '*:*';

                console.log($scope.query);
            };
        }]
    }
})

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider // lazy
.directive('searchDate', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-date.partial.html',
        replace: true,
        scope: {
              title: '@title',
              query: '=query',
        },
        link: function ($scope, element, attrs, ngModelController)
        {
        },
        controller : ["$scope", function ($scope)
        {
            var now = new Date();

            $scope.dates = [
                { text: 'date of record...', date: '' },
                { text: 'Last day', date: new Date(new Date(now).setDate(-1)).toISOString() },
                { text: 'Last week', date: new Date(new Date(now).setDate(-7)).toISOString() },
                { text: 'Last two weeks', date: new Date(new Date(now).setDate(-14)).toISOString() },
                { text: 'Last month', date: new Date(new Date(now).setMonth(-1)).toISOString() },
                { text: 'Last two months', date: new Date(new Date(now).setMonth(-1)).toISOString() },
                { text: 'Last six months', date: new Date(new Date(now).setMonth(-6)).toISOString() },
                { text: 'Last year', date: new Date(new Date(now).setYear(-1)).toISOString() }
            ];

            $scope.value = $scope.dates[0];

            $scope.updateQuery = function() {

                $scope.query.q = '';
            };

            $scope.$watch('value', function (newValue, oldValue) {

                if (newValue == oldValue) return;

                $scope.query = $scope.value.date == '' ? '*:*' : '(date_dt:[' + $scope.value.date + ' TO *])';

                console.log($scope.query);
            });
        }]
    }
})

//============================================================
//
//
//============================================================
angular.module('kmApp').compileProvider // lazy
.directive('searchKeywords', function ($http, $window) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-keywords.partial.html',
        // replace: true,
        // require : "?ngModel",
        scope: {
            // placeholder: '@',
            // ngDisabledFn : '&ngDisabled',
            title: '@title',
            items: '=ngModel',
            query: '=query',
            // locales    : '=',
            // rows       : '=',
            // required   : "@"
        },
        link: function ($scope, element, attrs, ngModelController) {
        },
        controller: ["$scope", function ($scope) {
            
            $scope.value = '';

            $scope.updateQuery = function () {

                $scope.query.q = '';
            };

            $scope.$watch('value', function (newValue, oldValue) {

                if (newValue == oldValue) return;

                $scope.query = $scope.value == '' ? '*:*' : '(title_t:' + $scope.value + '* OR description_t:' + $scope.value + '* OR text_EN_txt:' + $scope.value + '*)';

                console.log($scope.query);
            });

            var parameters = $window.URI().search(true);

            if (parameters['q']) {
                $scope.value = parameters['q'];
                $scope.query = $scope.value == '' ? '*:*' : '(title_t:' + $scope.value + '* OR description_t:' + $scope.value + '* OR text_EN_txt:' + $scope.value + '*)';
                $scope.$emit('refresh');
            }
        }]
    }
})