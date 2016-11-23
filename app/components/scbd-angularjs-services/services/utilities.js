define(['app','linqjs', 'utilities/km-utilities'], function(app, Enumerable) {
    'use strict';

    app.factory('Thesaurus', ['Enumerable', function() {
        return {
            buildTree: function(terms) {
                var oTerms = [];
                var oTermsMap = {};
                
                Enumerable.From(terms).ForEach(function(value) {
                    var oTerm = {
                        identifier: value.identifier,
                        title: value.title,
                        description: value.description,
					    name       : value.name
                    }

                    oTerms.push(oTerm);
                    oTermsMap[oTerm.identifier] = oTerm;
                });

                for (var i = 0; i < oTerms.length; ++i) {
                    var oRefTerm = terms[i];
                    var oBroader = oTerms[i];

                    if (oRefTerm.narrowerTerms && oRefTerm.narrowerTerms.length > 0) {
                        angular.forEach(oRefTerm.narrowerTerms, function(identifier) {
                            var oNarrower = oTermsMap[identifier];

                            if (oNarrower) {
                                oBroader.narrowerTerms = oBroader.narrowerTerms || [];
                                oNarrower.broaderTerms = oNarrower.broaderTerms || [];

                                oBroader.narrowerTerms.push(oNarrower);
                                oNarrower.broaderTerms.push(oBroader);
                            }
                        });
                    }
                }

                return Enumerable.From(oTerms).Where("o=>!o.broaderTerms").ToArray();
            }
        }
    }]);


    app.factory('guid', function() {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return function() {
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4()).toUpperCase();
        }
    });
});