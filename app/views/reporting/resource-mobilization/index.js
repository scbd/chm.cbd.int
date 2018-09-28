define(['app', 'angular', 'lodash', './rmHelpers', './modalComments', 'directives/forms/form-controls', './linechart', 'ngDialog'], function(app, angular, _) { 'use strict';

    return ['$scope', '$http', '$filter', '$q', 'realm', '$document', function($scope, $http, $filter, $q, realm, $document) {

        //============================================================
        //
        //============================================================
        $scope.chartOptions = {
            title : 'Trend',
            yTitle: 'USD in thousands'
        };

        //============================================================
        //
        //============================================================
        $scope.loadChart = function (event, Q, key, country, isTotal) {
            if(isTotal)
                $scope.getChartTotal(Q, key);
            else
                $scope.getChartData(Q, key, country);

            $scope.chartOptions.title = $scope.getCountryName(country);

            if(key==="progressIndicators")
                $scope.chartOptions.yTitle = 'Coefficient';

            angular.element('#hiddenChart').contents().appendTo(event.currentTarget);
        };

        //============================================================
        //
        //============================================================
        $scope.loadChart2 = function (event, Q, key, subkey, country) {
            $scope.getChartData2(Q, key, subkey, country);

            angular.element('#hiddenChart').contents().appendTo(event.currentTarget);
        };

        //============================================================
        //
        //============================================================
        $scope.unloadChart = function () {
            if(angular.element($document[0].querySelector("a span#chartContainer")).length > 0){
            	angular.element($document[0].querySelector("span#chartContainer")).detach().appendTo('#hiddenChart');
            }
        };

        //============================================================
        //
        //============================================================
        $scope.getChartTotal = function (Q, key) {
            $scope.chartData = [];
            var years;

            if(key ==="baselineFlows")      years = $scope.options.baselineYears;
            if(key ==="progressFlows")      years = $scope.options.progressYears;
            if(key ==="progressIndicators") years = $scope.options.progressYears;

            if(key ==="baselineFlows" || key ==="progressFlows"){
                _.forEach(years, function (year) {
                    var total = $scope.getTotal(Q, key, year);
                    $scope.chartData.push({'year': year, 'value':total});
                });
            }

            if(key ==="progressIndicators") {
                _.forEach(years, function (year) {
                    var total = $scope.getAggregateTotalCoefficient(year);
                    $scope.chartData.push({'year': year, 'value':total});
                });
            }
        };

        //============================================================
        //
        //============================================================
        $scope.getChartData = function (Q, key, country) {
            $scope.chartData = [];

            if(!$scope.records || !Q || !country)
                return;

            var rec = _.find($scope.records, {government_s: country});

            if(!rec) return;

            var years;

            if(key ==="baselineFlows")      years = $scope.options.baselineYears;
            if(key ==="progressFlows")      years = $scope.options.progressYears;
            if(key ==="progressIndicators") years = $scope.options.progressYears;
            if(key ==="expenditures")       years = $scope.options.domesticYears;
            if(key ==="contributions")      years = $scope.options.domesticYears;

            if(rec[Q] && rec[Q][key]){

                _.forEach(years, function(year){
                    var value = 0;

                    if(rec[Q][key] && rec[Q][key][year])
                        value = rec[Q][key][year];

                    $scope.chartData.push({'year': year, 'value':value});
                });

            }
        };

        //============================================================
        //
        //============================================================
        $scope.getChartData2 = function (Q, key, subkey, country) {
            $scope.chartData = [];

            if(!$scope.records || !Q || !country || !subkey)
                return;

            var rec = _.find($scope.records, {government_s: country});

            if(!rec) return;

            var years = $scope.options.fundingNeedsYears;


            if(rec[Q] && rec[Q][key]){
                _.forEach(years, function (year) {
                    var value = 0;

                    if(rec[Q][key] && rec[Q][key][year] && rec[Q][key][year][subkey])
                        value = rec[Q][key][year][subkey];

                    $scope.chartData.push({'year': year, 'value': value});
                });
            }
        };

        $scope.title = 'Financial Reporting Framework Analyzer';
        $scope.criteria = {};
        $scope.options = {
            elements: [ { identifier: '1',       name: '1. International financial resource flows'},
                        { identifier: '1.1',     name: '1.1. Amount provided by countries in support of biodiversity in developing countries'},
                        { identifier: '1.1.1',   name: '1.1.1. Baseline information'},
                        { identifier: '1.1.2',   name: '1.1.2. Monitoring progress in mobilizing international financial flows.'},
                        { identifier: '1.2',     name: '1.2 Measures taken by countries to encourage the private sector and CSO to provide international support for the implementation of the Strategic Plan for Biodiversity 2011-2020'},
                        { identifier: '2',       name: '2. Inclusion of biodiversity in priorities or plans'},
                        { identifier: '3',       name: '3.  Assessment and/or evaluation of values'},
                        { identifier: '4',       name: '4. Reporting current domestic biodiversity expenditures'},
                        { identifier: '4.1',     name: '4.1. Annual financial support provided to domestic biodiversity-related activities  '},
                        { identifier: '4.2',     name: '4.2.  Information on sources and categories'},
                        { identifier: '4.3',     name: '4.3. Role of collective action and non-market approaches'},
                        { identifier: '4.3.1',   name: '4.3.1. Assessments undertaken of the role of collective action for achieving the objectives of the Convention'},
                        { identifier: '4.3.2',   name: '4.3.2. Additional information on the assessment'},
                        { identifier: '5',       name: '5. Reporting funding needs, gaps, and priorities'},
                        { identifier: '6',       name: '6. National finance plans'},
                        { identifier: '7',       name: '7. Measures taken by countries to encourage the private sector and CSO to provide domestic support for the implementation of the Strategic Plan for Biodiversity 2011-2020'},
                        { identifier: '8',       name: '8. Availability of financial resources for achieving targets'},],

            baselineYears 	  : _.range(2006, 2011),
            progressYears 	  : _.range(2011, 2016),
            domesticYears 	  : _.range(2006, 2016),
            fundingNeedsYears : _.range(2014, 2021),

            financialPlans : [{ identifier: 'expectedGap', title: 'Expected funding gap'},
                              { identifier: 'domesticTotal', title: 'Domestic sources'},
                              { identifier: 'internationalTotal', title: 'International sources'},
                              { identifier: 'remainingGap', title: 'Remaining gap'}]
        };

        //============================================================
        //
        //============================================================
        $scope.getFinanacialPlanTitle = function (code) {

            if($scope.options && $scope.options.financialPlans){

                var item =  _.find($scope.options.financialPlans, {identifier: code});

                if(item)
                    return item.title;
            }
            return '';
        };

        //============================================================
        //
        //============================================================
        $scope.init = function () {

            $http.get('/api/v2013/thesaurus/domains/countries/terms', { cache : true }).then(function(response) {
                var allCountries =  _.map(response.data, function (c) {
                                            return { identifier:c.identifier, name:c.title.en };
                                    });

                $scope.allCountries = $filter('orderBy')(allCountries, 'name');

                initData();
            });

            $http.get("/api/v2013/thesaurus/domains/regions/terms?relations", { cache: true }).then(function(o){

                var allRegions =  _.filter(o.data, function (region) {
                                    return (region.name).indexOf('CBD Regional Groups') !== -1 && (region.name).indexOf('sub-region') === -1 ;
                                });

                $scope.cbdRegionsAll = allRegions;

                var cbdRegions = _.map(allRegions , function (region) {
                    return { identifier:region.identifier, name: region.name.replace('CBD Regional Groups - ', '') };
                });

                $scope.cbdRegions = $filter('orderBy')(cbdRegions, 'name');
            });
        };

        //============================================================
        //
        //============================================================
        $scope.setRegionCountries = function (identifier) {

            if(!_.isEmpty(identifier)){
                var regionCountries = [];
                var region =_.find($scope.cbdRegionsAll, {identifier:identifier});

                regionCountries = _.union(regionCountries, region.expandedNarrowerTerms);

                var docCountries = _.intersection($scope.docCountries, regionCountries);

                $scope.reportCountries = _.filter($scope.allCountries, function (ctr) {
                                               return _.includes(docCountries, ctr.identifier);
                                         });
           }
           else {
                $scope.reportCountries = _.filter($scope.allCountries, function (ctr) {
                                               return _.includes($scope.docCountries, ctr.identifier);
                                         });
           }
        };

        //============================================================
        //
        //============================================================
        $scope.filterByRegions = function (identifier) {

            $scope.criteria.selectedCountries = undefined;

            if(!_.isEmpty(identifier))
            {
                $scope.records = [];
                var region =_.find($scope.cbdRegionsAll, {identifier:identifier});
                $scope.setRegionCountries(identifier);

                _.forEach($scope.documents, function (doc) {
                    if(_.includes(region.expandedNarrowerTerms, doc.government_s)){
                        $scope.records.push(doc);
                    }
                });
                $scope.records = $filter('orderBy')($scope.records, 'government_EN_s');
                loadComments();
            }
            else {
                $scope.records = $filter('orderBy')($scope.documents, 'government_EN_s');
                $scope.setRegionCountries();
                loadComments();
            }
        };

        //============================================================
        //
        //============================================================
        $scope.filterByCountries = function (identifier) {

            if(!_.isEmpty(identifier))
            {
                $scope.records = [];

                _.forEach($scope.documents, function (doc) {
                    if(doc.government_s === identifier)
                        $scope.records.push(doc);
                });
                loadComments();
            }
            else {
                $scope.filterByRegions($scope.criteria.selectedRegions);
                loadComments();
            }
        };

        //============================================================
        //
        //============================================================
        $scope.$watch('criteria.selectedRegions', function(newValue, oldValue) {
            if(newValue !== oldValue){
                $scope.filterByRegions(newValue);
            }
        });

        //============================================================
        //
        //============================================================
        $scope.$watch('criteria.selectedCountries', function(newValue, oldValue) {
            if(newValue !== oldValue){
                $scope.filterByCountries(newValue);
            }
        });

        //============================================================
        //
        //============================================================
        $scope.getTotal = function (Q, key, year) {

            if(!$scope.records || !Q || !year || !key)
                return 0;

            var yearTotals = _.map($scope.records, function (rec) {
                    if(rec[Q] && rec[Q][key] && rec[Q][key][year])
                        return (rec[Q][key][year]);
                    else
                        return 0;
                });

            return _.sum(yearTotals);
        };

        //============================================================
        //
        //============================================================
        $scope.getTotal2 = function (Q, key, year, subkey) {

            if(!$scope.records || !Q || !year || !key || !subkey)
                return 0;

            var yearTotals =     _.map($scope.records, function (rec) {
                    if(rec[Q] && rec[Q][key] && rec[Q][key][year] && rec[Q][key][year][subkey])
                        return (rec[Q][key][year][subkey]);
                    else
                        return 0;
                });

            return _.sum(yearTotals);
        };

        //============================================================
        //
        //============================================================
        $scope.getAverageTotal = function (Q, key) {

            if(!$scope.records || !Q || !key)
                return 0;

            var total =     _.map($scope.records, function (rec) {

                    if(rec[Q] && rec[Q][key])

                        return rec[Q][key];
                    else
                        return 0;
                });

            return _.sum(total);
        };

        //============================================================
        //
        //============================================================
        $scope.getAggregateTotalCoefficient = function (year) {

                if(!$scope.records || !year) return 0;

                var Q   = 'Q1';
                var key = 'progressFlows';

                var progressYearTotal = $scope.getTotal('Q1', 'progressFlows', year) ;

                var pCountries = _.map($scope.records, function (rec) {

                                        if(rec[Q] && rec[Q][key] && rec[Q][key] && rec[Q][key][year])
                                            if(rec[Q][key][year] > 0)
                                                return rec.government_s;
                                    });

                var baselineAverageTotal = _.sum(_.map($scope.records, function (rec) {
                                                if(_.includes(pCountries, rec.government_s) && rec[Q].baselineFlows_average)
                                                    return rec[Q].baselineFlows_average;

                                                })
                                            );
                if(baselineAverageTotal>0)
                    return progressYearTotal/baselineAverageTotal;

                return 0;
        };


        //============================================================
        //
        //============================================================
        $scope.getCount = function (Q, key, answer) {

            if(!$scope.records || !Q || !key || (answer === undefined))
                return 0;

            var recs = _.filter($scope.records, function (rec) {

                            if(rec[Q] && (rec[Q][key] || _.isBoolean(rec[Q][key])))
                                return rec[Q][key] === answer;
                        });
            return recs.length;
        };

        //============================================================
        //
        //============================================================
        $scope.getCountM = function (Q, key, answers) {

            if(!$scope.records || !Q || !key || _.isEmpty(answers))
                return 0;


            var recs = _.filter($scope.records, function (rec) {
                            if(rec[Q] && (rec[Q][key] || _.isBoolean(rec[Q][key])))
                                return _.includes(answers, rec[Q][key]);
                        });
            return recs.length;
        };

        //============================================================
        //
        //============================================================
        $scope.getCountKey = function (Q, key) {

            if(!$scope.records || !Q || !key)
                return 0;

            var recs = _.filter($scope.records, function (rec) {
                            if(rec[Q] && rec[Q][key])
                                return (rec[Q][key]);
                        });

            return recs.length;
        };

        //============================================================
        //
        //============================================================
        $scope.getPercentage = function (Q, key, answer) {

            if(!$scope.records || !Q || !key || (answer === undefined))
                return 0;

            var recs = _.filter($scope.records, function (rec) {
                            if(rec[Q] && rec[Q][key])
                                return rec[Q][key] === answer;
                        });
            return (recs.length/$scope.getCountryCount(Q, key).length)*100;
        };

        //============================================================
        //
        //============================================================
        $scope.getCountryName = function (code) {

            var country = _.find($scope.allCountries, {identifier:code});

            if(country)
                return country.name;

            return '';
        };

        //============================================================
        //
        //============================================================
        $scope.isElementVisible = function (element) {
            if($scope.criteria && $scope.criteria.selectedElements){
                return _.isEqual($scope.criteria.selectedElements, element);
            }

            return true;
        };

        //============================================================
        //
        //============================================================
        $scope.isTotalVisible = function () {
            console.log();
            if($scope.records && $scope.records.length < 2)
                return false;
            else
                return true;
        };


        $scope.baselineRows_show         = true;
        $scope.progressRows_show         = true;
        $scope.domesticActivityRows_show = true;
        $scope.contributionsRows_show    = true;
        $scope.estimateRows_show         = true;
        $scope.planRows_show             = true;

        //============================================================
        //
        //============================================================
        $scope.isElemCollapsed = function (elem) {
            $scope[elem+"_show"] = angular.element($document[0].querySelector('#'+elem)).hasClass('in');
        };

        //============================================================
        //
        //============================================================
        $scope.getComments = function (Q, key, answer) {

            if(!Q && !key) return;

            var records = _.filter($scope.records, function (rec) {

                                if(rec[Q] && rec[Q][key])
                                    return rec[Q][key] === answer;
                            });

            if(records)
                return _.compact(
                                _.map(records, function (rec) {
                                    var countryName = $scope.getCountryName(rec.government_s);
                                    if(rec[Q] && rec[Q][key+'Comments'])
                                        return {country: countryName, comment: rec[Q][key+'Comments']};
                                }));
        };

        //============================================================
        //
        //============================================================
        $scope.getComments2 = function (Q, key) {

            if(!Q && !key) return;

            var records = _.filter($scope.records, function (rec) {

                                if(rec[Q] && rec[Q][key])
                                    return rec[Q][key];
                            });

            if(records)
                return _.compact(
                                _.map(records, function (rec) {
                                    var countryName = $scope.getCountryName(rec.government_s);
                                    if(rec[Q] && rec[Q][key])
                                        return {country: countryName, comment: rec[Q][key]};
                                }));
        };

        //============================================================
        //
        //============================================================
        var loadComments = function () {

            $scope.comments_Q1_2_some          = $scope.getComments('Q1', 'hasPrivateSectorMeasures', 'some');
            $scope.comments_Q1_2_comprehensive = $scope.getComments('Q1', 'hasPrivateSectorMeasures', 'comprehensive');
            $scope.comments_Q2_some            = $scope.getComments('Q2', 'hasNationalBiodiversityInclusion', 'some');
            $scope.comments_Q2_comprehensive   = $scope.getComments('Q2', 'hasNationalBiodiversityInclusion', 'comprehensive');
            $scope.comments_Q3_some            = $scope.getComments('Q3', 'hasBiodiversityAssessment', 'some');
            $scope.comments_Q3_comprehensive   = $scope.getComments('Q3', 'hasBiodiversityAssessment', 'comprehensive');
            $scope.comments_Q7_some            = $scope.getComments('Q7', 'hasDomesticPrivateSectorMeasures', 'some');
            $scope.comments_Q7_comprehensive   = $scope.getComments('Q7', 'hasDomesticPrivateSectorMeasures', 'comprehensive');

            // getComments2
            $scope.comments_Q1_methodologicalComments                       = $scope.getComments2('Q1', 'methodologicalComments');
            $scope.comments_Q4_sourcesAdditionalComments                    = $scope.getComments2('Q4', 'sourcesAdditionalComments');
            $scope.comments_Q4_domesticCollectiveActionMethodologyComments  = $scope.getComments2('Q4', 'domesticCollectiveActionMethodologyComments');
            $scope.comments_Q5_fundingNeedsDataAdditionalComments           = $scope.getComments2('Q5', 'fundingNeedsDataAdditionalComments');
        };

        //============================================================
        //
        //============================================================
        $scope.getCountryCount = function (Q, key) {

            if(!$scope.records) return 0;

            var recs = _.filter($scope.records, function (rec) {
                    return (rec[Q] && rec[Q][key] && !_.isEmpty(rec[Q][key]));
            });
            return recs.length;
        };

        //============================================================
        //
        //============================================================
        var initData = function () {

            // NOT version_s:* remove non-public records from resultset
            var q = 'NOT version_s:* AND realm_ss:' + realm.toLowerCase() + ' AND schema_s:resourceMobilisation'; // +

            var queryParameters = {
                'q'    : q,
                'sort' : 'createdDate_dt desc',
                'fl'   : 'id, url_ss, government_s, government_EN_s, Q1_s, Q2_s, Q3_s, Q4_s, Q5_s, Q6_s, Q7_s, Q8_s',
                'wt'   : 'json',
                'start': 0,
                'rows' : 1000,
                'cb'   : new Date().getTime(),
            };

            $http.get('/api/v2013/index/select', { params: queryParameters}).success(function (data) {
                $scope.documents    = data.response.docs;

                $scope.documents = _.map($scope.documents, function (doc) {

                    var removeQ1Countries = ['co', 'ec', 'nu']; // colombia, ecuador, niue
                    
                    if(doc.Q1_s) { 
                        if(!_.includes(removeQ1Countries, doc.government_s)){
                            _.assign(doc, { Q1 : JSON.parse(doc.Q1_s) }); 
                            delete doc.Q1_s;
                        }
                    }
                    if(doc.Q2_s) { _.assign(doc, { Q2 : JSON.parse(doc.Q2_s) }); delete doc.Q2_s;}
                    if(doc.Q3_s) { _.assign(doc, { Q3 : JSON.parse(doc.Q3_s) }); delete doc.Q3_s;}
                    if(doc.Q4_s) { _.assign(doc, { Q4 : JSON.parse(doc.Q4_s) }); delete doc.Q4_s;}
                    if(doc.Q5_s) { _.assign(doc, { Q5 : JSON.parse(doc.Q5_s) }); delete doc.Q5_s;}
                    if(doc.Q6_s) { _.assign(doc, { Q6 : JSON.parse(doc.Q6_s) }); delete doc.Q6_s;}
                    if(doc.Q7_s) { _.assign(doc, { Q7 : JSON.parse(doc.Q7_s) }); delete doc.Q7_s;}
                    if(doc.Q8_s) { _.assign(doc, { Q8 : JSON.parse(doc.Q8_s) }); delete doc.Q8_s;}

                    return doc;
                });

                $scope.records      = $scope.documents;
                $scope.docCountries = _.map(data.response.docs, 'government_s');

                $scope.setRegionCountries();
                loadComments();

            }).error(function (error) { console.log('onerror'); console.log(error); });
        };

        //============================================================
        //
        //============================================================
        $scope.init();

    }];
});
