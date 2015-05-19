define(["lodash", 'app', 'authentication', "utilities/km-utilities", "filters/moment"], function(_) { 'use strict';

    return ['$scope', '$route', '$http', '$location', '$q', 'solr', 'user', 'navigation', function($scope, $route, $http, $location, $q, solr, user, navigation) {

        var pageSize = 15;

        $scope.schema      = _.camelCase($route.current.params.schema);
        $scope.subSchema   = $route.current.params.type;
        $scope.facets      = undefined;
        $scope.records     = null;
        $scope.status      = "";
        $scope.currentPage = 0;
        $scope.pages       = [];
        $scope.onPage      = loadPage;
        $scope.onEdit      = edit;
        $scope.onText      = _.debounce(function(){
            loadPage(0, true);
        }, 500);

        refreshPager();
        loadPage(0);

        //======================================================
        //
        //
        //======================================================
        function loadPage(pageIndex, refreshFacets) {

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
                "fl" : "identifier_s, schema_s, schema_EN_t, title_EN_t, summary_EN_t, description_EN_t, createdBy_s, createdDate_dt, updatedBy_s, updatedDate_dt, reportType_EN_t, url_ss, _revision_i, _state_s, _latest_s, _workflow_s",
                "sort"  : "updatedDate_dt desc",
                "start" : pageIndex*pageSize,
                "row"   : pageSize,
            };

            var qRecords = $http.get("/api/v2013/index", { params : qsParams }).then(function(res) {

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
                        isPublic : v._state_s,
                        isDraft  : v.version_s == "draft",
                        isLocked : v.version_s == "draft-lock",
                        url      : toLocalUrl(v.url_ss)
                    });
                });

                refreshPager(pageIndex);

            });

            var qFacets;

            if(!$scope.facets || refreshFacets)
            {
                // Execute facets query
                var qsFacetParams =
                {
                    "q"  : buildQuery({ status : undefined, latest : undefined }),
                    "row"   : 0,
                    "facet" : true,
                    "facet.field" : "_state_s",
                };

                qFacets = $http.get("/api/v2013/index", { params : qsFacetParams }).then(function(res) {

                    var documentState = _(res.data.facet_counts.facet_fields._state_s).chunk(2).zipObject().value();

                    $scope.facets = _.defaults(documentState, {
                        public   : 0,
                        draft    : 0,
                        workflow : 0,
                        total    : res.data.response.numFound
                    });
                });
            }


            return $q.all([qRecords, qFacets]).catch(function(res){

                $scope.records     = [];
                $scope.recordCount = -1;
                $scope.error       = res.data || res;

                console.error($scope.error);

            }).finally(function(){
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

            options = _.assign({
                schema    : $scope.schema,
                subSchema : $scope.subSchema,
                status    : $scope.status,
                latest    : true,
                freetext  : $scope.freetext
            }, options || {});

            var query  = [];


            // Add Schema

            query.push("schema_s:" + solr.escape(options.schema));

            if(options.subSchema) {

                var nbsap = [ 'B0EBAE91-9581-4BB2-9C02-52FCF9D82721' ]; //NBSAP
                var nr    = [ 'F27DBC9B-FF25-471B-B624-C0F73E76C8B3',   //1st NR
                              'A49393CA-2950-4EFD-8BCC-33266D69232F',   //2nd NR
                              'DA7E04F1-D2EA-491E-9503-F7923B1FD7D4',   //3rd NR
                              '272B0A17-5569-429D-ADF5-2A55C588F7A7',   //4th NR
                              'B3079A36-32A3-41E2-BDE0-65E4E3A51601'    //5th NR
                ];

                if(options.subSchema=="nr")    query.push("    reportType_s:("+ _(nr   ).map(solr.escape).values().join(', ') +")");
                if(options.subSchema=="nbsap") query.push("    reportType_s:("+ _(nbsap).map(solr.escape).values().join(', ') +")");
                if(options.subSchema=="other") query.push("NOT reportType_s:("+ _(nbsap).union(nr).map(solr.escape).values().join(', ') +")");
            }

            // Apply ownership

            query.push(["realm_ss:chm", "(*:* NOT realm_ss:*)"]);

            // Apply ownership

            query.push(_.map(user.userGroups, function(v){
                return "_ownership_s:"+solr.escape(v);
            }));

            // Status

            if(options.status) {
                query.push("_state_s:" + solr.escape(options.status));
            }
            else if(options.latest!==undefined){
                query.push("_latest_s:" + (options.latest ? "true" : "false"));
            }

            // freetext

            if(options.freetext)
            {
                var escapedWords = _(_.words(options.freetext)).map(function(w){
                    return solr.escape(w)+"*";
                }).value();

                query.push([
                    'title_t:('       +escapedWords.join(' AND ')+ ')',
                    'description_t:(' +escapedWords.join(' AND ')+ ')',
                    'text_EN_txt:('   +escapedWords.join(' AND ')+ ')',
                    'title_EN_t:('    +escapedWords.join(' AND ')+ ')',
                    'summary_EN_t:('  +escapedWords.join(' AND ')+ ')',
                ]);
            }

            // AND / OR everything

            return solr.andOr(query);
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
