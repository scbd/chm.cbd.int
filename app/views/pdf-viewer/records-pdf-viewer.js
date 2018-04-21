define(['app', 'pdf-object', 'scbd-angularjs-services/locale'], function (app, pdfObject) {
    return ["$scope", "$http", "$q", "$location", '$sce', 'locale', '$route', 'realm', '$timeout',
    function ($scope, $http, $q, $location, $sce, locale, $route, realm, $timeout) {

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

        $scope.loadLangPdf = function(lang){
            $scope.loading = true;
            $scope.unloadPdf = true;
            $scope.pdf.src = getPdfSrc(lang);
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

        $scope.trustSrc = function(src) {
            return $sce.trustAsResourceUrl(src);
        }
        
        function getPdfSrc(pdfLocale){
            $scope.pdf.fileName = uniqueId + '-' + pdfLocale + '.pdf';
            var src = '/api/v2017/generate-pdf/{{realm}}/{{type}}/{{locale}}?documentID={{documentId}}&revision={{revision}}&schema={{schema}}';
            if($route.current.params.code){
                src = '/api/v2017/generate-pdf/{{realm}}/{{type}}/{{locale}}?code={{code}}';
            }
            return src .replace("{{realm}}", realm)
                                 .replace("{{locale}}", pdfLocale)
                                 .replace("{{type}}", $route.current.params.type)
                                 .replace("{{documentId}}", $route.current.params.documentId)
                                 .replace("{{revision}}", $route.current.params.revision)
                                 .replace("{{schema}}", $route.current.params.schema)
                                 .replace("{{code}}", $route.current.params.code);
        }
        $scope.loadLangPdf(locale||'en');

        //document.getElementsByTagName('iframe')[1].contentWindow.document.body.scrollHeight
    }]

})
