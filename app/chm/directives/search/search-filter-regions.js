var thesaurus = null;

angular.module('kmApp').compileProvider // lazy
.directive('searchFilterRegions', function ($http) {
    return {
        restrict: 'EAC',
        templateUrl: '/app/chm/directives/search/search-filter-regions.partial.html?v'+(new Date()).getTime(),
        replace: true,
        scope: {
              title: '@title',
              items: '=ngModel',
              field: '@field',
              query: '=query',
        },
        link: function ($scope, element, attrs, ngModelController)
        {
        },
        controller : ['$scope', '$element', '$location', 'Thesaurus', function ($scope, $element, $location, thesaurus)
        {
            var self = this;
            self.termsMap = [];

            $scope.terms = [];

            $scope.expanded = false;
            $scope.selectedItems = [];
            $scope.facet = $scope.field.replace('_s', ''); // TODO: replace @field by @facet

            var parameters = $location.search();

            if (parameters[$scope.facet]) {
                $scope.selectedItems.push(parameters[$scope.facet]);
            }

            $scope.isSelected = function(item) {
                return $.inArray(item.symbol, $scope.selectedItems) >= 0;
            };

            $scope.closeDialog = function() {
                $element.find("#dialogSelect").modal("hide");
            };

            $scope.actionSelect = function(item) {

                if($scope.isSelected(item)) {
                    $scope.selectedItems.splice($.inArray(item.symbol, $scope.selectedItems), 1);
                } else {
                    $scope.selectedItems.push(item.symbol);
                }

                buildQuery();
            };

            $scope.ccc = function(item) {
                return $scope.isSelected(item) ? 'facet selected' : 'facet unselected';
            };

            $scope.onclick = function (scope, evt) {
                scope.item.selected = !scope.item.selected;
                buildQuery();
            }

            function buildQuery () {
                var conditions = [];
                buildConditions(conditions, self.termsMap);

                if(conditions.length==0) $scope.query = '*:*';
                else {
                    var query = '';
                    conditions.forEach(function (condition) { query = query + (query=='' ? '( ' : ' OR ') + condition; });
                    query += ' )';
                    $scope.query = query;
                }
            }

            function buildConditions (conditions, items) {
                _.values(items).forEach(function (item) { 
                    if(item.selected)
                        conditions.push($scope.field+':'+item.identifier);
                });
            }

            function dictionarize(items) {
                var dictionary = [];
                (items||[]).forEach(function (item) { 
                    item.selected = false;
                    dictionary[item.identifier] = item;
                });
                return dictionary;
            }

            function flatten(items, collection) {
                items.forEach(function (item) { 
                    item.selected = false;
                    collection[item.identifier] = item;
                    if(item.narrowerTerms) 
                        flatten(item.narrowerTerms, collection);
                });
                return collection;
            }
            $scope.terms = [];
            console.log($scope.terms);
            $scope.terms = $http.get('/api/v2013/thesaurus/domains/regions/terms').then(function (response) {

                var termsTree = thesaurus.buildTree(response.data);
                self.termsMap = flatten(termsTree, {});
                var classes   = _.filter(termsTree, function where (o) { return !!o.narrowerTerms && o.identifier!='1796f3f3-13ae-4c71-a5d2-0df261e4f218'});

                _.values(self.termsMap).forEach(function (term) {
                    term.name = term.name.replace('CBD Regional Groups - ', '');
                    term.name = term.name.replace('Inland water ecosystems - ', '');
                    term.name = term.name.replace('Large marine ecosystems - ', '');

                    term.name = term.name.replace('Mountains - All countries', 'Mountains');
                    term.name = term.name.replace('Global - All countries', 'Global');
                    term.name = term.name.replace('Americas - All countries', 'Americas');
                    term.name = term.name.replace('Africa - All countries', 'Africa');
                    term.name = term.name.replace('Asia - All countries', 'Asia');
                    term.name = term.name.replace('Europe - All countries', 'Europe');
                    term.name = term.name.replace('Oceania - All countries', 'Oceania');

                    term.name = term.name.replace('Mountains - ', '');
                    term.name = term.name.replace('Global - ', '');
                    term.name = term.name.replace('Americas - ', '');
                    term.name = term.name.replace('Africa - ', '');
                    term.name = term.name.replace('Asia - ', '');
                    term.name = term.name.replace('Europe - ', '');
                    term.name = term.name.replace('Oceania - ', '');

                    term.name = term.name.replace('regions', '<All>');
                    term.name = term.name.replace('groups', '<All>');

                    term.selected = false;
                    term.count = 0;
                });

                $scope.allTerms = _.values(self.termsMap);
console.log($scope.items);
                ($scope.items||[]).forEach(function (item) {
                    console.log(item);
                    if(_.has(self.termsMap, item.symbol))
                    {
                        console.log(item);
                        self.termsMap[item.symbol].count = item.count;
                    }
                });
// console.log(classes);
// console.log($scope.terms);
// $scope.blaise = classes
                return classes;
                
            });
            
            $scope.$watch($scope.terms, function(oldValue, newValue){
                    console.log (oldValue + '-' + newValue);

            })


            function onWatch_items(values) {
                console.log('onWatch_items');
                console.log(values);
                (values||[]).forEach(function (item) {
                    if(_.has($scope.termsx, item.symbol))
                        $scope.termsx[item.symbol].count = item.count;
                });
            }

            $scope.refresh = buildQuery;
        }]
    }
});

//============================================================
// TODO: Obtain through 'Thesaurus' REST API
//
//============================================================
function getThesaurus () {

    return [ 
        { symbol:"COUNTRY-GROUP-CLASS-PARTY", title: { en: "Global CBD/CPB" }, terms: [
        { symbol:"G-CBDP"    , title: { en:"CBD Parties"} },
        { symbol:"G-BSPP"    , title: { en:"Biosafety Protocol Parties"} },
        { symbol:"G-BSPS"    , title: { en:"Biosafety Protocol Signatories"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-CBD", title: { en: "CBD Regional Groups" }, terms: [
            { symbol:"CBD-AFR"   , title: { en:"Africa"} },
            { symbol:"CBD-AP"    , title: { en:"Asia and the Pacific"} },
            { symbol:"CBD-LAC"   , title: { en:"Latin America and the Caribbean (GRULAC)"} },
            { symbol:"CBD-CEE"   , title: { en:"Central and Eastern Europe"} },
            { symbol:"CBD-WEOG"  , title: { en:"Western European and Others (WEOG)"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-ECONOMIC", title: { en: "Global Economic" }, terms: [
            { symbol:"G-DEV"     , title: { en:"Developing countries"} },
            { symbol:"G-EIT"     , title: { en:"Countries with Economies in Transition"} },
            { symbol:"G-IND"     , title: { en:"Developed countries"} },
            { symbol:"G-LDC"     , title: { en:"Least Developed Countries"} },
            { symbol:"G-SIDS"    , title: { en:"Small Island Developing States"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-AFRICA", title: { en: "Africa" }, terms: [
            { symbol:"AFR-AU"    , title: { en:"African Union"} },
            { symbol:"AFR-ECA"   , title: { en:"Economic Commission for Africa"} },
            { symbol:"AFR-N"     , title: { en:"North African countries"} },
            { symbol:"AFR-W"     , title: { en:"West African countries"} },
            { symbol:"AFR-E"     , title: { en:"East African countries"} },
            { symbol:"AFR-C"     , title: { en:"Central African countries"} },
            { symbol:"AFR-S"     , title: { en:"Southern African countries"} },
            { symbol:"AFR-I"     , title: { en:"African island countries"} },
            { symbol:"AFR-ECOWAS", title: { en:"Economic Community of West African States"} },
            { symbol:"AFR-IGAD"  , title: { en:"Intergovernmental Authority on Development"} },
            { symbol:"AFR-SADC"  , title: { en:"Southern African Development Community"} },
            { symbol:"AFR-UEMOA" , title: { en:"Union Économique et Monétaire Ouest Africaine"} },
            { symbol:"COMIFAC"   , title: { en:"Commission des Forêts d'Afrique Centrale "} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-AP", title: { en: "Asia-Pacific" }, terms: [
            { symbol:"AP-ESCAP"  , title: { en:"Economic and Social Commission for Asia and the Pacific (except non-regional members)"} },
            { symbol:"AP-ESCWA"  , title: { en:"Economic and Social Commission for Western Asia"} },
            { symbol:"AP-WA"     , title: { en:"West Asian countries"} },
            { symbol:"AP-SA"     , title: { en:"South Asian countries"} },
            { symbol:"AP-CA"     , title: { en:"Central Asian countries"} },
            { symbol:"AP-EA"     , title: { en:"East Asian countries"} },
            { symbol:"AP-SE"     , title: { en:"South East Asian countries"} },
            { symbol:"AP-PI"     , title: { en:"Pacific Island countries (except non-regional members)"} },
            { symbol:"AP-OCE"    , title: { en:"Oceania"} },
            { symbol:"AP-SACEP"  , title: { en:"South Asia Cooperative Environment Programme"} },
            { symbol:"AP-ASEAN"  , title: { en:"Association of Southeast Asian Nations"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-AMERICAS", title: { en: "Americas" }, terms: [
            { symbol:"AM-ECLAC"  , title: { en:"Economic Commission for Latin America and the Caribbean (except non-regional members)"} },
            { symbol:"AM-SAM"    , title: { en:"South American countries"} },
            { symbol:"AM-CAM"    , title: { en:"Central American countries"} },
            { symbol:"AM-CAR"    , title: { en:"Caribbean countries"} },
            { symbol:"AM-NAM"    , title: { en:"North American countries"} },
            { symbol:"AM-MER"    , title: { en:"Mercosur"} },
            { symbol:"AM-AND"    , title: { en:"Andean Pact"} },
            { symbol:"AM-ALADI"  , title: { en:"Asociacion Latinoamericana de Integracion"} },
            { symbol:"AM-ACT"    , title: { en:"Amazon Cooperation Treaty"} },
            { symbol:"AM-CCAD"   , title: { en:"Comision Centroamericana de Ambiente y Desarrollo"} },
            { symbol:"AM-ACS"    , title: { en:"Association of Caribbean States"} },
            { symbol:"AM-CARC"   , title: { en:"The Caribbean Community (Caricom)"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-EURASIA", title: { en: "Eurasia" }, terms: [
            { symbol:"EUR-ECE"   , title: { en:"Economic Commission for Europe (except non-regional members)"} },
            { symbol:"EUR-EUR"   , title: { en:"Europe (all countries)"} },
            { symbol:"EUR-WE"    , title: { en:"Western European countries"} },
            { symbol:"EUR-CEE"   , title: { en:"Central and Eastern European countries"} },
            { symbol:"EUR-EU"    , title: { en:"European Union"} },
            { symbol:"EUR-CIS"   , title: { en:"Commonwealth of Independent States"} },
            { symbol:"EUR-NOR"   , title: { en:"Nordic countries"} },
            { symbol:"ABS-NOR"   , title: { en:"Nordic region"}, class:"Access and Benefit-sharing" },
            { symbol:"ABS-ARIPO" , title: { en:"African Regional Intellectual Property Organization"}, class:"Access and Benefit-sharing" },
            { symbol:"EUR-BEN"   , title: { en:"Benelux countries"} },
            { symbol:"EUR-SEE"   , title: { en:"South Eastern European countries"} },
            { symbol:"EUR-EFTA"  , title: { en:"European Free Trade Association"} },
            { symbol:"EUR-BAL"   , title: { en:"Baltic states"} },
            { symbol:"EUR-VIS"   , title: { en:"Visegrad Group"} },
            { symbol:"EUR-PEBLDS", title: { en:"Pan-European Biological and Landscape Diversity Strategy"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-XREGIONAL", title: { en: "Cross-regional" }, terms: [
            { symbol:"XREG-ARC"  , title: { en:"Arctic countries"} },
            { symbol:"XREG-OECD" , title: { en:"Organisation for Economic Co-operation and Development"} },
            { symbol:"XREG-APEC" , title: { en:"Asia-Pacific Economic Cooperation"} },
            { symbol:"XREG-CMW"  , title: { en:"The Commonwealth"} },
            { symbol:"XREG-FRA"  , title: { en:"La Francophonie"} },
            { symbol:"XREG-CG"   , title: { en:"The Cairns Group"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-MARINES", title: { en: "Large marine ecosystems" }, terms: [
            { symbol:"LME-MED"   , title: { en:"Mediterranean countries"} },
            { symbol:"LME-BLS"   , title: { en:"Black Sea countries"} },
            { symbol:"LME-SCS"   , title: { en:"South China Sea countries"} },
            { symbol:"LME-BAL"   , title: { en:"Baltic Sea countries"} },
            { symbol:"LME-NOR"   , title: { en:"North Sea countries"} },
            { symbol:"LME-ARA"   , title: { en:"Arabian Sea countries"} },
            { symbol:"LME-RED"   , title: { en:"Red Sea countries"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-MOUNTAINS", title: { en: "Mountains" }, terms: [
            { symbol:"MT-ALP"    , title: { en:"Alpine countries"} },
            { symbol:"MT-AND"    , title: { en:"Andean countries"} },
            { symbol:"MT-CAR"    , title: { en:"Carpathian countries"} },
            { symbol:"MT-CAU"    , title: { en:"Caucasus countries"} },
            { symbol:"MT-HIM"    , title: { en:"Himalayan countries"} } ]
        },
        { symbol:"COUNTRY-GROUP-CLASS-INLAND-WATERS", title: { en: "Inland water ecosystems" }, terms: [
            { symbol:"IW-DAN"    , title: { en:"Danube basin countries"} },
            { symbol:"IW-NIL"    , title: { en:"Nile basin countries"} },
            { symbol:"IW-MEK"    , title: { en:"Mekong basin countries"} },
            { symbol:"IW-AMZ"    , title: { en:"Amazon basin countries"} },
            { symbol:"IW-NIG"    , title: { en:"Niger basin countries"} },
            { symbol:"IW-ZAM"    , title: { en:"Zambezi basin countries"} },
            { symbol:"IW-CAS"    , title: { en:"Caspian Sea countries"} },
            { symbol:"IW-BRG"    , title: { en:"Ganges-Brahmaputra basin countries"} } ]
        } 
    ];
}