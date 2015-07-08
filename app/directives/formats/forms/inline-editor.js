define(['text!./inline-editor.html', 'app', 'angular', 'lodash', 'authentication', 'ngMaterial', 'services/editFormUtility'], function(template, app, angular, _) { 'use strict';

app.factory("inlineEditor", ['$rootScope', '$mdDialog', function ($rootScope,  $mdDialog) {

    var noop = {};
    var controller = ["$scope", "$http", 'editFormUtility', function ($scope, $http, editFormUtility) {

        $scope.save = function () {

            $scope.validationReport = false;

            $http.put("/api/v2013/documents/validate", $scope.document, { params : { schema : $scope.document.header.schema }}).then(function (res) {

                $scope.validationReport = res.data;
                $scope.validationReport.errors   = $scope.validationReport.errors   || [];
                $scope.validationReport.warnings = $scope.validationReport.warnings || [];

                if(!!$scope.validationReport.errors.length || !!$scope.validationReport.warnings.length)
                    throw noop;

            }).then(function(){

                return editFormUtility.canPublish($scope.document);

            }).then(function(canPublish){

                return editFormUtility.saveDraft($scope.document);

                if(canPublish)
                    return editFormUtility.publish($scope.document);
                else
                    return editFormUtility.publishRequest($scope.document);

            }).then(function(){

                $mdDialog.hide($scope.document);

            }).catch(function (error) {

                if(error==noop)
                    return;
            });
        };

        $scope.cancel = function () {
            $mdDialog.cancel();
        };
    }];

    return {
            edit : function(options){

                var scope  = $rootScope.$new(true);
                scope.document = options.document;

                var schema        = scope.document.header.schema;
                var directiveName = 'form-' + _.kebabCase(schema);

                return $mdDialog.show({
                    scope : scope,
                    template: template.replace(/DIRECTIVE/g, directiveName),
                    parent: angular.element(document.body),
                    targetEvent: options.targetEvent,
                    controller : controller
                });
            }
        };
    }]);
});
