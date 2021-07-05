define(['app','text!./export-directive.html', 'lodash', 'ngDialog','moment','filters/moment'], function (app, template, _) {
    app.directive('export', ['$timeout', '$q', 'ngDialog',function ($timeout, $q,ngDialog) {
        return {
            restrict: 'EAC',
            template: template,
            scope: {
                exportData: '&',
                helpTitle: '@'
            },
            link: function ($scope, $element, attrs) {
                    
                $scope.showDialog = function(forTour){
                    var exportData = $scope.exportData;

                    ngDialog.open({
                        showClose : !forTour,
                        closeByEscape : !forTour,
                        closeByNavigation : !forTour,
                        closeByDocument : !forTour,
                        name     : 'exportDialog',
                        className : 'ngdialog-theme-default wide',
                        template : 'exportDialog',
                        controller : ['$scope', '$element', function($scope, $element){
                                var selectedFields;
                                $scope.downloadFormat = 'xlsx';
                                $scope.downloadFormat = downloadFormat = 'xlsx';
                                $scope.downloadData =  function(skipDownload, fieldList){
                                    fieldList = fieldList||selectedFields;
                                    var dowloadButton = $element.find('.' + $scope.downloadFormat)
                                    if(dowloadButton && dowloadButton.length==0){
                                        $scope.loading = true;
                                        $q.when(exportData({options : {initial:skipDownload, fields:fieldList}}))
                                        .then(function(documents){
                                            $scope.downloadDocuments = documents;
                                            if(!skipDownload)
                                                require(['tableexport'], function(){
                                                    $element.find('#datatable').tableExport({
                                                        formats: ["xlsx", "xls", "csv"],
                                                        filename: "Aichi-Targets-data",
                                                    });
                                                    $element.find('.' + $scope.downloadFormat).click();
                                                });     
                                        })
                                        .finally(function(){
                                            $scope.loading = false;
                                        });                
                                    }
                                    else
                                        dowloadButton.click();                        
                                };


                                $scope.customFields = function(){
                                    var customFields = $scope.downloadDocuments.additionalHeaders;
                                    selectedFields = $scope.downloadDocuments.headers;
                                    var fieldsDialog = ngDialog.open({
                                        name     : 'customFields',
                                        template : 'customFieldsDialog',
                                        controller : ['$scope', function($scope){
                                               
                                                $scope.fields = [];
                                                _.each(customFields, function(field, key){
                                                    var lField = _.cloneDeep(field);
                                                    lField.key = key;
                                                    lField.selected = _.some(selectedFields, {title:field.title});
                                                    $scope.fields.push(lField)
                                                });
                                                $scope.closeDialog = function(){
                                                    ngDialog.close(fieldsDialog.id);                                            
                                                }

                                                $scope.done = function(){
                                                    selectedFields = {};
                                                    _.each($scope.fields, function(field){if(field.selected)selectedFields[field.key]=field});
                                                    $scope.closeDialog();
                                                    $element.find('.'+downloadFormat).remove();
                                                    
                                                }                                                
                                        }]
                                    })
                                    fieldsDialog.closePromise.then(function(data){
                                       $scope.downloadData(true, selectedFields);
                                    });
                                }

                                $scope.closeDialog = function(){
                                    ngDialog.close();                                            
                                }

                                $scope.downloadData(true);
                        }]
                    })
                }

                $timeout(function(){
                    $element.find('[data-toggle="tooltip"]').tooltip();
                },50);

                $scope.closeDialog = function(){
                    ngDialog.close();     
                }
            }
        };
    }]);
});

