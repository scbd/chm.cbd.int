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
                tooltiptext: 'upload image',
                action: function(){
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

            taRegisterTool('editorHelp', {
                disabled:function(){return false},
                iconclass: "fa fa-question-circle",
                tooltiptext: 'help text',
                action: function(){
                    var editor =  this.$editor();
                    var uploadPlaceholder = $('input[name="' + editor._name + '"]').parent();                    
                    var helpButton = uploadPlaceholder.find('button[name="editorHelp"]');
                    helpButton.attr('data-content', 
                    'Use the image button to upload images.\n Allowed html elements are img,h1, h2, h3, h4, h5, strong,b, i, '+
                    'u, blockquote, em, br, p, div,span, ul, ol, li, a, div, span, table, tbody, th, tr, td \n'+
                    'All other elements will be automatically removed when the record is saved');
                    helpButton.attr('data-title', 'CHM Help: How to use the rich text editor');
                    helpButton.webuiPopover({
                        trigger:'sticky',
                        closeable:true, autoHide:true
                    });
                    helpButton.webuiPopover('show');
                    console.log(editor)
                    // return;
                }
            });
            taOptions.toolbar[1].push('editorHelp');

            return taOptions;
        }]);
    });
    return app;
});
