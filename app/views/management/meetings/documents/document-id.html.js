define(['underscore', 'jquery', 'app', 'authentication'], function(_, $) { 'use strict';

    return ['$scope', '$route', 'authHttp', '$q', '$location', function($scope, $route, $http, $q, $location) {

        var symbolsDB;
        var meeting;

        load();

        $scope.save = save;

        //==================================================
        //
        //
        //==================================================
        $scope.$watch('component', function(component) {

            $scope.component = null;

            if(!component)              return;
            if(!$scope.document.symbol) return;

            $('#symbol').focus();

            var prefix = meeting.documentSymbolPrefix.replace(/\/$/g, ''); // trimEnd /
            var symbol = $scope.document.symbol      .replace(/\/$/g, ''); // trimEnd /

            if(component.ignore && component.ignore.test(symbol))
                return;

            $scope.document.symbol = component.value.replace(/\{\{prefix\}\}/g, prefix).
                                                     replace(/\{\{symbol\}\}/g, symbol);
        });

        //==================================================
        //
        //
        //==================================================
        $scope.$watch('document.symbol', function(symbol) {

            console.log(symbol);

            if(!symbol)               return;
            if(!$scope.document)      return;

            if(/\d+\*$/i.test(symbol)) { // remove *
                $scope.document.symbol = symbol.replace(/\*+$/g, '');
                return;
            }

            if(/\*$/i.test(symbol)) { // generate new id

                var prefix    = symbol.replace(/\*+$/g, '');
                var predicate = function(s){
                    return s==prefix +       value ||
                           s==prefix + '0' + value ||
                           s.indexOf(prefix +       value + '/')===0 ||
                           s.indexOf(prefix + '0' + value + '/')===0;
                };

                var value  = 200;

                for(; value>0; --value) {
                    if(_.find(symbolsDB, predicate))
                        break;
                }

                $scope.document.symbol = (prefix + (value+1)).toUpperCase();

                return;
            }
        });


        //==================================================
        //
        //
        //==================================================
        $scope.$watch('document.serie', function(serie) {

            if(!serie)              return;
            if(!meeting)            return;
            if(!$scope.document)    return;
            if( $scope.document._id)return; //not new document;

            var prefix = meeting.documentSymbolPrefix;
            var symbol = $scope.document.symbol;

            var hasPrefix = (symbol+'/').indexOf(prefix+'/')===0;

            if(hasPrefix || symbol==='')
            {
                     if(serie=='OFFICIAL') $scope.document.symbol = meeting.documentSymbolPrefix+'/*';
                else if(serie=='INF'     ) $scope.document.symbol = meeting.documentSymbolPrefix+'/INF/*';
                else if(serie=='CRP'     ) $scope.document.symbol = meeting.documentSymbolPrefix+'/CRP*';
                else if(serie=='L'       ) $scope.document.symbol = meeting.documentSymbolPrefix+'/L*';
                else                       $scope.document.symbol = '';
            }
        });

        //==================================================
        //
        //
        //==================================================
        function load() {

            var meetingUrl   = '/api/v2014/meetings/'+encodeURIComponent($route.current.params.meetingId);
            var documentsUrl = '/api/v2014/meetings/'+encodeURIComponent($route.current.params.meetingId)+'/documents';
            var documentUrl  = '/api/v2014/meetings/'+encodeURIComponent($route.current.params.meetingId)+'/documents/'+encodeURIComponent($route.current.params.id);

            var qMeeting         = $http.get(meetingUrl).then(function(res) { return res.data; });
            var qDocumentSymbols = $http.get(documentsUrl, { params: { f : { symbol : 1 } } }).then(function(res) { return _.pluck(res.data, 'symbol'); });

            $q.all([qMeeting, qDocumentSymbols]).then(function(res) {

                meeting   = res[0];
                symbolsDB = res[1];

                if($route.current.params.id!='NEW') {
                    return $http.get(documentUrl).then(function(res) {
                        $scope.document = res.data;
                    });
                }

                // New document!

                $scope.document = {
                    meeting          : meeting._id,
                    meetingSymbol    : meeting.symbol,
                    symbol           : '',
                    serie            : 'OFFICIAL',
                    languages: {
                        en: { title : '' }
                    }
                };
            });
        }

        //==================================================
        //
        //
        //==================================================
        function save() {

            var document = $scope.document;
            var isNew    = !document._id;

            var action  = isNew ? $http.post : $http.put;
            var url     = isNew ? '/api/v2014/meetings/'+encodeURIComponent($route.current.params.meetingId)+'/documents' :
                                  '/api/v2014/meetings/'+encodeURIComponent($route.current.params.meetingId)+'/documents/'+encodeURIComponent(document._id);

            action(url, document).success(function(doc){

            $scope.document = doc;

                if($route.current.params.id != doc._id)
                    $location.path($location.path().replace(/\/NEW$/, '/'+doc._id)); //update URL. replace /NEW by /_id
                    
            }).catch(function(error){
                console.error(error);
            });
        }

        //==================================================
        //
        //
        //==================================================
        $scope.options = {
            series : [
                { code: 'OFFICIAL', title : 'Official'},
                { code: 'INF',      title : 'Information'},
                { code: 'CRP',      title : 'CRP'},
                { code: 'L',        title : 'L'},
                { code: 'NONPAPER', title : 'Non-Paper'},
                { code: 'OTHER',    title : 'Other'}
            ],

            components : {

                OFFICIAL : [
                    { title : "/*",     value : '{{prefix}}/*' },
                    { title : "Add.*",  value : '{{symbol}}/ADD*',  ignore : /\/ADD\d+$/i  },
                    { title : "Rev.*",  value : '{{symbol}}/REV*',  ignore : /\/REV\d+$/i  },
                    { title : "Corr.*", value : '{{symbol}}/CORR*', ignore : /\/CORR\d+$/i }
                ],
                INF : [
                    { title : "/INF/*", value : '{{prefix}}/INF/*' },
                    { title : "Add.*",  value : '{{symbol}}/ADD*',  ignore : /\/ADD\d+$/i  },
                    { title : "Rev.*",  value : '{{symbol}}/REV*',  ignore : /\/REV\d+$/i  },
                    { title : "Corr.*", value : '{{symbol}}/CORR*', ignore : /\/CORR\d+$/i }
                ],
                CRP : [
                    { title : "/CRP.*",       value : '{{prefix}}/CRP*'     },
                    { title : "/WG.1/CRP.*",  value : '{{prefix}}/WG1/CRP*' },
                    { title : "/WG.2/CRP.*",  value : '{{prefix}}/WG2/CRP*' },
                    { title : "Add.*",        value : '{{symbol}}/ADD*',  ignore : /\/ADD\d+$/i  },
                    { title : "Rev.*",        value : '{{symbol}}/REV*',  ignore : /\/REV\d+$/i  },
                    { title : "Corr.*",       value : '{{symbol}}/CORR*', ignore : /\/CORR\d+$/i }
                ],
                L : [
                    { title : "/L.*",   value : '{{prefix}}/L*'   },
                    { title : "Add.*",  value : '{{symbol}}/ADD*',  ignore : /\/ADD\d+$/i  },
                    { title : "Rev.*",  value : '{{symbol}}/REV*',  ignore : /\/REV\d+$/i  },
                    { title : "Corr.*", value : '{{symbol}}/CORR*', ignore : /\/CORR\d+$/i }
                ],
                OTHER : [],
                NONPAPER : []
            }
        };
    }];
});
