define(['app', 'pdf-object', 'scbd-angularjs-services/locale'], function (app, pdfObject) {
    return ["$scope", "$http", "$q", "$location", '$sce', 'locale', '$route', 'realm', '$timeout',
    function ($scope, $http, $q, $location, $sce, locale, $route, realm, $timeout) {
        var identifier;
        $scope.pdfLocale = locale;
        $scope.pdf = {};
        $scope.loading = true;
        
        var uniqueId = $route.current.params.documentId;
        if(!$route.current.params.code && $route.current.params.revision)
            uniqueId += '-' + ($route.current.params.revision||'')

        $scope.pdf.uniqueId = uniqueId;
        $scope.pdf.src = getPdfSrc($scope.pdfLocale);


        $scope.pageLoaded = function(){
            $scope.loading = false;
        }

        $scope.finishLoading = function(){
            $scope.loading=false;
        }

        $scope.loadLangPdf = function(lang, force){
            $scope.loading = true;
            $scope.unloadPdf = true;

            var operation = false;
            var qs = $location.search();
            if(qs.shareId){
                operation = $http.get('/api/v2018/document-sharing/'+ qs.shareId)
                                .then(function(result){
                                    var link = result.data;
                                    identifier = link.sharedData.identifier;
                                    return !(link && !link.revoked && (!link.expiry || new Date(link.expiry) > new Date()))
                                })
            }
            $q.when(operation)
            .then(function(expired){
                if(expired){
                    $scope.linkExpired = true;
                    $scope.loading = false;
                    $scope.alertSeconds = 10;
                    time();
                }
                else{
                    $scope.pdf.src = getPdfSrc(lang, force);
                    $scope.pdfLocale = lang;
                    if($route.current.params.type=='draft-documents')
                        window.location = $scope.pdf.src;

                    var options = {
                        pdfOpenParams: {
                            navpanes: 1,
                            toolbar: 1,
                            statusbar: 1,
                            view: "FitV",
                            pagemode: "thumbs",
                            page: 1
                        },
                        forcePDFJS: true,
                        PDFJS_URL: "/app/views/pdf-viewer/pdfjs/web/viewer.html", height:'100%'
                    };
                    pdfObject.embed($scope.pdf.src, '#viewPdf', options)
                    
                    $timeout(function(){
                        $scope.unloadPdf = false;
                    }, 500)
                }
            })
            .catch(function(err){
                $scope.loading  = false;
                $scope.error    = true;
            });
            
        }

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
        
        function getPdfSrc(pdfLocale, force){
           
            var isMixLocale = false;
            var baseApiUrl = ''    
            if($location.search().mixLocale=='true')
                isMixLocale = true;

            if(/cbd\.int$/.test($location.host()))
                baseApiUrl = 'https://api-direct.cbd.int'

            $scope.pdf.fileName = uniqueId + '-' + (!isMixLocale && pdfLocale ? pdfLocale : 'all') + '.pdf';
            var src = '/api/v2017/generate-pdf/{{realm}}/{{type}}/{{locale}}?documentID={{documentId}}&revision={{revision}}&schema={{schema}}';
            
            if($route.current.params.code){
                src = '/api/v2017/generate-pdf/{{realm}}/{{type}}/{{locale}}?code={{code}}';
            }
            if(isMixLocale || !pdfLocale){
                src += '&mixLocale=true'
            }
            if(force){
                src += '&force=true&t=' + new Date().getTime();
            }

            return baseApiUrl + src .replace("{{realm}}", realm)
                                 .replace("{{locale}}", pdfLocale||locale)
                                 .replace("{{type}}", $route.current.params.type)
                                 .replace("{{documentId}}", $route.current.params.documentId)
                                 .replace("{{revision}}", $route.current.params.revision)
                                 .replace("{{schema}}", $route.current.params.schema)
                                 .replace("{{code}}", $route.current.params.code);
        }
        $scope.loadLangPdf(locale||'en');

        $scope.redirectNow = function(){
            if(identifier)
                $location.url('/pdf-links/draft-documents/' + identifier)
        }

        function time(){
            $timeout(function(){
                if($scope.alertSeconds == 1){																	
                    $scope.redirectNow();
                }
                else{
                    $scope.alertSeconds--;																
                    time()
                }
            }, 1000)
        }
        //document.getElementsByTagName('iframe')[1].contentWindow.document.body.scrollHeight
    }]

})
