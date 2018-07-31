define(['angular','rangy-core', 'ngSanitize', 'rangy-selectionsave', 'textAngular',
'ngAnimate' ,'ngAria' ,'ngMaterial', 'ngSmoothScroll'], function(angular, rangyCore) { 'use strict';

 window.rangy = rangyCore;

    var deps = ['ngRoute', 'ngSanitize', 'ngCookies', 'leaflet-directive', 
    'ng-breadcrumbs','ngAnimate' ,'ngAria' ,'ngMaterial', 'smoothScroll', 
    'ngDialog', 'textAngular'];

    angular.defineModules(deps);

    var app = angular.module('kmApp', deps);

    app.config(['$httpProvider', function($httpProvider){

        $httpProvider.useApplyAsync(true);
        $httpProvider.interceptors.push('authenticationHttpIntercepter');
        $httpProvider.interceptors.push('realmHttpIntercepter');
    }]);

    app.config(function($provide){
        $provide.decorator('taOptions', ['taRegisterTool', '$delegate', function(taRegisterTool, taOptions){
            
            taRegisterTool('uploadCustomImage', {
                iconclass: "fa fa-photo",
                action: function(){
                    console.log(this.$editor());
                    this.$editor().wrapSelection('forecolor', 'red');

                    var editor =  this.$editor();
                    var uploadPlaceholder = $('input[name="' + editor._name + '"]').parent();                    
					uploadPlaceholder.children('input[type=file]').remove();
					uploadPlaceholder.prepend("<input type='file' style='display:none' />");

					var qHtmlInputFile = uploadPlaceholder.children("input[type=file]:first");

					qHtmlInputFile.change(function()
					{
                        var file = this.files[0];
                        
                        editor.fileDropHandler(file, editor.wrapSelection);
                        return;
					});

					qHtmlInputFile.click();
                }
            });
            taOptions.toolbar[1].push('uploadCustomImage');
            return taOptions;
        }]);
    });
    return app;
});
