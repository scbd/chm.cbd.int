define(['app', 'text!./info-bar.html', 'webui-popover'], function(app, template) {
    'use strict';
    app.directive('infoBar', [function() {
        return {
            restrict: 'EA',
            replace: true,
            template: template,
            scope: {
                content: '@',
                width: '@',
                height: '@'
            },
            link: function($scope, $element, attrs) {

                var settings = {
                    trigger: 'hover',
                    title: 'CHM Help: sixth national report',
                    closeable: true,
                    dismissible: true,
                    delay: 0,
                    padding: true,
                    backdrop: false,
                    style: 'popover-style1',
                    delay: {
                        show: null,
                        hide: 500
                    },
                    content: $scope.content || ''
                };
                // width: $scope.width || 600,
                // height: $scope.height || 200,
                $element.find('a.show-pop')
                    .webuiPopover('destroy')
                    .webuiPopover(settings);

            }
        }
    }]);
});