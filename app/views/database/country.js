define(["utilities/solr"], function() {
    'use strict';
    return ['$scope', '$route', '$http', 'solr', function($scope, $route, $http, solr) {



        $http.get('/api/v2013/countries/' + $route.current.params.code.toUpperCase()).then(function(response) {
            $scope.country = response.data
            
            _.extend($scope.country.treaties['XXVII8']  , { sort: 1, name : 'Convention on Biological Diversity' });
            _.extend($scope.country.treaties['XXVII8a'] , { sort: 2, name : 'Cartagena Protocol on Biosafety to the Convention on Biological Diversity' });
            _.extend($scope.country.treaties['XXVII8b'] , { sort: 3, name : 'Nagoya Protocol on Access to Genetic Resources and the Fair and Equitable Sharing of Benefits Arising from their Utilization to the Convention on Biological Diversity' });
            _.extend($scope.country.treaties['XXVII8c'] , { sort: 4, name : 'Nagoya - Kuala Lumpur Supplementary Protocol on Liability and Redress to the Cartagena Protocol on Biosafety' });
        });

        //============================================================
        //
        //============================================================
        function loadReferenceRecords(code) {

        

            var query = [];

            query.push("_latest_s:true");
            query.push("government_s:"+code);
            query.push("NOT schema_s:contact");

            var query = solr.andOr(query);
            var qsParams = {
                "q": query,
                "fl": "identifier_s, government_s,uniqueIdentifier_s, schema_EN_t,schema_s, ctgList_ss, addressCountry_s:addressCountry_EN_t, title_t,description:description_t, summary_t, description_t, reportType_EN_t, " +
                    "url_ss, _revision_i, _state_s, version_s, _latest_s, _workflow_s, isAichiTarget_b, aichiTargets_*, otherAichiTargets_*, date_dt, progress_s,"+
                    "rec_date:updatedDate_dt, rec_meta1:meta1_EN_txt, rec_meta2:meta2_EN_txt, rec_meta3:meta3_EN_txt,rec_meta4:meta4_EN_txt,rec_meta5:meta5_EN_txt",
                "sort": "updatedDate_dt desc",
                "start": 0,
                "rows": 500,
            };

            return $http.get("/api/v2013/index", {
                params: qsParams
            }).then(function(res) {

                return _.map(res.data.response.docs, function(v) {
                    return _.defaults(v, {
                        schemaName: solr.lstring(v, "schema_*_t", "schema_EN_t", "schema_s"),
                        title: solr.lstring(v, "title_*_t", "title_EN_t", "title_t"),
                        summary: solr.lstring(v, "summary_*_t", "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t")
                    });
                });

            });
        }

        loadReferenceRecords( $route.current.params.code.toLowerCase())
        .then(function(data){
            $scope.records = data;
            console.log(data);
        })
    }]

});