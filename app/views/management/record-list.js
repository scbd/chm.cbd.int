define(["lodash", 'app', 'authentication', "utilities/km-utilities", "filters/moment"], function(_) { 'use strict';

    return ['$scope', '$route', '$http', '$location', 'user', function($scope, $route, $http, $location, user) {

console.log("user", user);

        var pageSize = 15;

        var reportTypes = {
            nbsap : [ 'B0EBAE91-9581-4BB2-9C02-52FCF9D82721' ], //NBSAP
            nr    : [ 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3',   //1st NR
                      'A49393CA-2950-4EFD-8BCC-33266D69232F',   //2nd NR
                      'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4',   //3rd NR
                      '272B0A17-5569-429D-ADF5-2A55C588F7A7',   //4th NR
                      'B3079A36-32A3-41E2-BDE0-65E4E3A51601'    //5th NR
            ]
        };

        $scope.schema      = _.camelCase($route.current.params.schema);
        $scope.subType     = $location.search().type;
        $scope.facets      = {};
        $scope.records     = null;
        $scope.status      = "";
        $scope.currentPage = 0;
        $scope.pages       = [];
        $scope.onPage      = loadPage;
        $scope.onText      = _.debounce(loadPage, 250);

        refreshPager();
        loadPage();

        //======================================================
        //
        //
        //======================================================
        function loadPage(pageIndex) {

            pageIndex = pageIndex || 0;

            if(pageIndex <0)
                return;

            if(pageIndex>0 && pageIndex >= $scope.pages.length)
                return;

            delete $scope.error;

            // Execute query

            var qsParams =
            {
                "q"  : buildQuery(),
                "fl" : "identifier_s, schema_s, schema_EN_t, title_EN_t, summary_EN_t, description_EN_t, createdDate_dt, updatedDate_dt, reportType_EN_t, version_s",
                "start" : pageIndex*pageSize,
                "row"   : pageSize,
                "facet" : true,
                "facet.field" : "version_s",
            };

            $http.get("/api/v2013/index", { params : qsParams }).then(function(res) {

                $scope.recordCount = res.data.response.numFound;
                $scope.records     = _.map(res.data.response.docs, function(v){
                    return _.defaults(v, {
                        schemaName : {
                            en : v.schema_EN_t || v.schema_s,
                            es : v.schema_ES_t || v.schema_EN_t || v.schema_s,
                            fr : v.schema_FR_t || v.schema_EN_t || v.schema_s,
                            ru : v.schema_RU_t || v.schema_EN_t || v.schema_s,
                            zh : v.schema_ZH_t || v.schema_EN_t || v.schema_s,
                            ar : v.schema_AR_t || v.schema_EN_t || v.schema_s,
                        },
                        title : {
                            en : v.title_EN_t   || v.title_t,
                            es : v.title_ES_t   || v.title_EN_t   || v.title_t,
                            fr : v.title_FR_t   || v.title_EN_t   || v.title_t,
                            ru : v.title_RU_t   || v.title_EN_t   || v.title_t,
                            zh : v.title_ZH_t   || v.title_EN_t   || v.title_t,
                            ar : v.title_AR_t   || v.title_EN_t   || v.title_t,
                        },
                        summary : {
                            en : v.summary_EN_t || v.description_EN_t || v.summary_t    || v.description_t,
                            es : v.summary_ES_t || v.description_ES_t || v.summary_EN_t || v.description_EN_t || v.summary_t || v.description_t,
                            fr : v.summary_FR_t || v.description_FR_t || v.summary_EN_t || v.description_EN_t || v.summary_t || v.description_t,
                            ru : v.summary_RU_t || v.description_RU_t || v.summary_EN_t || v.description_EN_t || v.summary_t || v.description_t,
                            zh : v.summary_ZH_t || v.description_ZH_t || v.summary_EN_t || v.description_EN_t || v.summary_t || v.description_t,
                            ar : v.summary_AR_t || v.description_AR_t || v.summary_EN_t || v.description_EN_t || v.summary_t || v.description_t,
                        },
                        reportTypeName : {
                            en : v.reportType_EN_t,
                            es : v.reportType_ES_t || v.reportType_EN_t,
                            fr : v.reportType_FR_t || v.reportType_EN_t,
                            ru : v.reportType_RU_t || v.reportType_EN_t,
                            zh : v.reportType_ZH_t || v.reportType_EN_t,
                            ar : v.reportType_AR_t || v.reportType_EN_t,
                        },
                        createdOn : new Date(v.createdDate_dt),
                        updatedOn : new Date(v.updatedDate_dt),
                        isPublic : !v.version_s,
                        isDraft  :  v.version_s == "draft",
                        isLocked :  v.version_s == "draft-lock",
                    });
                });

                $scope.facets = _(res.data.facet_counts.facet_fields.version_s).chunk(2).zipObject().value();

                refreshPager(pageIndex);

            }).catch(function(res){

                $scope.records     = [];
                $scope.recordCount = -1;
                $scope.error       = res.data || res;

                console.error($scope.error);
            });

        }

        //======================================================
        //
        //
        //======================================================
        function buildQuery() {

            var query = "schema_s:" + solrEscape($scope.schema) + " AND realm_ss:chm";

            // Add subtype

            if($scope.subType=="nr")    query += " AND     reportType_s:("+ _(reportTypes.nr   ).map(solrEscape).values().join(', ') +")";
            if($scope.subType=="nbsap") query += " AND     reportType_s:("+ _(reportTypes.nbsap).map(solrEscape).values().join(', ') +")";
            if($scope.subType=="other") query += " AND NOT reportType_s:("+ _(reportTypes.nbsap).union(reportTypes.nr).map(solrEscape).values().join(', ') +")";

            // filter

            if($scope.status=="public")     query += " AND  (*:* NOT version_s:*)";
            if($scope.status=="draft")      query += " AND  version_s:" + solrEscape("draft");
            if($scope.status=="draft-lock") query += " AND  version_s:" + solrEscape("draft-lock");

            // freetext

            if($scope.freetext)
            {
                var escapedWords = _.map($scope.freetext.split(' '), function(w){
                    return solrEscape(w)+"*";
                });

                var criterias = [
                    'title_t:('       +escapedWords.join(' AND ')+ ')',
                    'description_t:(' +escapedWords.join(' AND ')+ ')',
                    'text_EN_txt:('   +escapedWords.join(' AND ')+ ')',
                    'title_EN_t:('    +escapedWords.join(' AND ')+ ')',
                    'summary_EN_t:('  +escapedWords.join(' AND ')+ ')',
                ];

                query += " AND ("+ criterias.join(' OR ') +")";
            }

            // Apply securirty groups

            var securityGroups = [ "(*:* NOT securityGroup_ss:*)"];

            _.each(user.userGroups, function(v) {
                securityGroups.push("securityGroup_ss:" + solrEscape(v));
            });

            query += " AND ("+ securityGroups.join(" OR ") +")";

            return query;
        }

        //======================================================
        //
        //
        //======================================================
        function refreshPager(currentPage)
        {
            currentPage = currentPage || 0;

            var pageCount = Math.ceil(Math.max($scope.recordCount||0, 0) / pageSize);

            $scope.currentPage = currentPage;
            $scope.pages       = [];

            for (var i = 0; i < pageCount; i++) {
                $scope.pages.push(i);
            }
        }

        //======================================================
        //
        //
        //======================================================
        function solrEscape(value) {

            if(value===undefined) throw "Value is undefined";
            if(value===null)      throw "Value is null";
            if(value==="")        throw "Value is null";

            if(_.isNumber(value)) value = value.toString();
            if(_.isDate  (value)) value = value.toISOString();

            //TODO add more types

            value = value.toString();

            value = value.replace(/\\/g,   '\\\\');
            value = value.replace(/\+/g,   '\\+');
            value = value.replace(/\-/g,   '\\-');
            value = value.replace(/\&\&/g, '\\&&');
            value = value.replace(/\|\|/g, '\\||');
            value = value.replace(/\!/g,   '\\!');
            value = value.replace(/\(/g,   '\\(');
            value = value.replace(/\)/g,   '\\)');
            value = value.replace(/\{/g,   '\\{');
            value = value.replace(/\}/g,   '\\}');
            value = value.replace(/\[/g,   '\\[');
            value = value.replace(/\]/g,   '\\]');
            value = value.replace(/\^/g,   '\\^');
            value = value.replace(/\"/g,   '\\"');
            value = value.replace(/\~/g,   '\\~');
            value = value.replace(/\*/g,   '\\*');
            value = value.replace(/\?/g,   '\\?');
            value = value.replace(/\:/g,   '\\:');

            return value;
        }
    }];
});
