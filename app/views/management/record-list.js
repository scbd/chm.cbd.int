define(["lodash", 'app', 'authentication', "utilities/km-utilities", "filters/moment"], function(_) { 'use strict';

    return ['$scope', '$route', '$http', '$location', '$q', 'solr', 'user', 'navigation', function($scope, $route, $http, $location, $q, solr, user, navigation) {

        var pageSize = 15;

        $scope.schema      = _.camelCase($route.current.params.schema);
        $scope.subSchema   = $route.current.params.type;
        $scope.facets      = {};
        $scope.records     = null;
        $scope.status      = "";
        $scope.currentPage = 0;
        $scope.pages       = [];
        $scope.onPage      = loadPage;
        $scope.onEdit      = edit;
        $scope.onText      = _.debounce(loadPage, 500);

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

            $scope.loading = true;

            // Execute query

            var qsParams =
            {
                "q"  : buildQuery(),
                "fl" : "identifier_s, schema_s, schema_EN_t, title_EN_t, summary_EN_t, description_EN_t, createdDate_dt, updatedDate_dt, reportType_EN_t, version_s, url_ss",
                "sort"  : "updatedDate_dt desc",
                "start" : pageIndex*pageSize,
                "row"   : pageSize,
            };

            var q1 = $http.get("/api/v2013/index", { params : qsParams }).then(function(res) {

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
                        isPublic : !v.version_s,
                        isDraft  :  v.version_s == "draft",
                        isLocked :  v.version_s == "draft-lock",
                        url      : toLocalUrl(v.url_ss)
                    });
                });

                refreshPager(pageIndex);

            }).catch(function(res){

                $scope.records     = [];
                $scope.recordCount = -1;
                $scope.error       = res.data || res;

                console.error($scope.error);
            });

            // Execute facets query

            var qsFacetParams =
            {
                "q"  : buildQuery({ status : "" }),
                "row"   : 0,
                "facet" : true,
                "facet.field" : "version_s",
            };

            var q2 = $http.get("/api/v2013/index", { params : qsFacetParams }).then(function(res) {

                var versions = _(res.data.facet_counts.facet_fields.version_s).chunk(2).zipObject().value();

                versions = _.defaults(versions, {
                    draft   : 0,
                    request : 0,
                });

                $scope.facets = _.defaults(versions, {
                    public  : res.data.response.numFound - versions.draft - versions.request,
                });

            }).catch(function(res){

                $scope.records     = [];
                $scope.recordCount = -1;
                $scope.error       = res.data || res;

                console.error($scope.error);
            });

            return $q.all([q1, q2]).finally(function(){
                delete $scope.loading;
            });
        }

        //======================================================
        //
        //
        //======================================================
        function toLocalUrl(urls) {

            var url = _.first(urls);

            if(_(url).startsWith("http://chm.cbd.int/" )) url = url.substr("http://chm.cbd.int" .length);
            if(_(url).startsWith("https://chm.cbd.int/")) url = url.substr("https://chm.cbd.int".length);

            if(_(url).startsWith('/') && _(url).endsWith('=null'))
                return null;

            return url;
        }


        //======================================================
        //
        //
        //======================================================
        function buildQuery(options) {

            options = _.defaults(options || {}, {
                schema    : $scope.schema,
                subSchema : $scope.subSchema,
                status    : $scope.status,
                freetext  : $scope.freetext
            });

            var query = "schema_s:" + solr.escape(options.schema) + " AND (realm_ss:chm OR (*:* NOT realm_ss:*))";

            // Add subSchema

            if(options.subSchema) {

                var nbsap = [ 'B0EBAE91-9581-4BB2-9C02-52FCF9D82721' ]; //NBSAP
                var nr    = [ 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3',   //1st NR
                              'A49393CA-2950-4EFD-8BCC-33266D69232F',   //2nd NR
                              'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4',   //3rd NR
                              '272B0A17-5569-429D-ADF5-2A55C588F7A7',   //4th NR
                              'B3079A36-32A3-41E2-BDE0-65E4E3A51601'    //5th NR
                ];

                if(options.subSchema=="nr")    query += " AND     reportType_s:("+ _(nr   ).map(solr.escape).values().join(', ') +")";
                if(options.subSchema=="nbsap") query += " AND     reportType_s:("+ _(nbsap).map(solr.escape).values().join(', ') +")";
                if(options.subSchema=="other") query += " AND NOT reportType_s:("+ _(nbsap).union(nr).map(solr.escape).values().join(', ') +")";
            }

            // filter

            if(options.status) {
                if(options.status=="public")     query += " AND  (*:* NOT version_s:*)";
                if(options.status=="draft")      query += " AND  version_s:" + solr.escape("draft");
                if(options.status=="draft-lock") query += " AND  version_s:" + solr.escape("draft-lock");
            }

            // freetext

            if(options.freetext)
            {
                var escapedWords = _(_.words(options.freetext)).map(function(w){
                    return solr.escape(w)+"*";
                }).value();

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
                securityGroups.push("securityGroup_ss:" + solr.escape(v));
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
        function edit(schema, id)
        {
            $location.url(navigation.editUrl(schema, id));
        }
    }];
});
