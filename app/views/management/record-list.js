define(["lodash", 'app', 'authentication', "utilities/km-utilities", "utilities/km-storage", "filters/moment", "utilities/solr"], function(_) { 'use strict';

    return ['$scope', '$route', '$http', '$location', '$q', 'solr', 'user', 'navigation', 'IStorage', function($scope, $route, $http, $location, $q, solr, user, navigation, storage) {

        var pageSize = 15;

        $scope.schema      = _.camelCase($route.current.params.schema);
        $scope.subSchema   = $route.current.params.type;
        $scope.facets      = undefined;
        $scope.records     = null;
        $scope.status      = "";
        $scope.currentPage = 0;
        $scope.pages       = [];
        $scope.onPage      = loadPage;
        $scope.onText      = _.debounce(function(){ loadPage(0, true); }, 500);
        $scope.onDelete    = del;
        $scope.onEdit      = edit;
        $scope.onWorkflow  = viewWorkflow;
        $scope.qs = $location.search();



        $scope.onAdd       = function() {
            edit({ schema_s : $scope.schema });
        };

        $scope.formatWID   = function (workflowID) {
    		return workflowID ? workflowID.replace(/(?:.*)(.{3})(.{4})$/g, "W$1-$2").toUpperCase() : "";
    	};

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
                "fl" : "identifier_s, schema_*, title_*, summary_*, description_*, created*, updated*, reportType_*_t, url_ss, _revision_i, _state_s, _latest_s, _workflow_s",
                "sort"  : "updatedDate_dt desc",
                "start" : pageIndex*pageSize,
                "row"   : pageSize,
            };

            var qRecords = $http.get("/api/v2013/index", { params : qsParams }).then(function(res) {

                $scope.recordCount = res.data.response.numFound;
                $scope.records     = _.map(res.data.response.docs, function(v){
                    return _.defaults(v, {
                        schemaName     : solr.lstring(v, "schema_*_t",     "schema_EN_t",     "schema_s"),
                        title          : solr.lstring(v, "title_*_t",      "title_EN_t",      "title_t"),
                        summary        : solr.lstring(v, "summary_*_t",    "description_*_t", "summary_EN_t", "description_EN_t", "summary_t", "description_t"),
                        reportTypeName : solr.lstring(v, "reportType_*_t", "reportType_EN_t"),
                        url            : toLocalUrl(v.url_ss),
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

            var url = navigation.toLocalUrl(_.first(urls));

            if(_(url).startsWith('/') && (_(url).endsWith('=null') || _(url).endsWith('=undefined')))
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

                if(options.subSchema=="nr")    query.push("    reportType_s:("+ _(nr   ).map(solr.escape).values().join(' ') +")");
                if(options.subSchema=="nbsap") query.push("    reportType_s:("+ _(nbsap).map(solr.escape).values().join(' ') +")");
                if(options.subSchema=="other") query.push("NOT reportType_s:("+ _(nbsap).union(nr).map(solr.escape).values().join('  ') +")");
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
            var pages     = [];

            for (var i = 0; i < pageCount; i++) {
                pages.push({ index : i, text : i+1 });
            }

            $scope.currentPage = currentPage;
            $scope.pages       = pages;

        }

        //======================================================
        //
        //
        //======================================================
        function edit(record)
        {
            $location.url(navigation.editUrl(record.schema_s, record.identifier_s, $scope.qs.type));
        }


        //======================================================
        //
        //
        //======================================================
        function del(record)
        {

            var repo = null;
            var identifier = record.identifier_s;

            $q.when(record).then(function(r) {

                    if(r._state_s == "public")  repo = storage.documents;
               else if(r._state_s == "draft")   repo = storage.drafts;
               else                             throw new Alert("Cannot delete request");

               return repo.exists(identifier);

           }).then(function(exist) {

                if(!exist)
                    throw new Alert("Record not found.");

                if(!confirm("Are you sure to delete...."))
                    throw new Noop();

                return repo.delete(identifier);

            }).then(function() {

                _.remove($scope.records, function(r){
                    return r==record;
                });

            }).catch(function(e){

                if(e instanceof Noop)
                    return;

                if(e instanceof Alert) {
                    alert(e.message);
                    return;
                }

                $scope.error = e;
            });

            function Alert(msg) { this.message = msg; }
            function Noop()     { }
        }

        //======================================================
        //
        //
        //======================================================
        function viewWorkflow(record)
        {
            $location.url("/management/requests/" + record._workflow_s.replace(/^workflow-/i, ""));
        }
    }];
});
