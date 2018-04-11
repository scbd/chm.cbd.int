define(['text!./document-sharing.html', 'app', 'angular', 'lodash', 'ngDialog', 'scbd-angularjs-services/generic-service'], function(template, app, angular, _) { 'use strict';

    app.directive('documentSharing', ["$http", "$q", "$route", 'ngDialog', '$timeout', 'IGenericService', '$document', '$window', '$rootScope',
     function ($http, $q, $route, ngDialog, $timeout, genericService, $document, $window, $rootScope) {
        return {
            restrict   : 'E',
            template   : template,
            replace    : true,
            transclude : false,
            scope      : {
                title : '@',
                identifier : '=',
                restrictionField : '@',
                restrictionFieldValue : '='
            },
            link : function($scope, $element)
            {
                $scope.self = $scope;
                $scope.status   = "";
                $scope.error    = null;
                

                $scope.shareDocument = function(){
                    
                    ngDialog.open({
                        template: 'shareDocumentTemplate.html',													
                        closeByDocument: true,
                        closeByEscape: true,
                        showClose: true,
                        closeByNavigation: false,
                        scope: $scope
                    
                    });
                }

                $scope.createLink = function(){
                                      
                    var newDocument = angular.copy($scope.document || {});                   
                     if(newDocument.sharedWith && newDocument.sharedWith.link)
                        return;
                    if(!newDocument.sharedWith)
                        newDocument.sharedWith = {};

                    newDocument.sharedWith["link"] = true;
                    
                    saveLink(newDocument);
                }

                $scope.shareEmail = function(){                     
                    saveLink($scope.document);
                }

                function saveLink(document){

                    var operation;

                    if(document._id)
                        operation = genericService.update('v2018', 'document-sharing', document._id, document);
                    else
                        operation = genericService.create('v2018', 'document-sharing', document);

                    $scope.status = "creatingLink";
                    $q.when(operation)
                    .then(function(response){
                        var id= response.id || document._id;
                        $q.when(get(id))
                        .then(function(data){                            
                            $scope.document = data;
                        })
                    })
                    .finally(function(){
                        $scope.status = '';
                    })

                }

                $scope.loadDocument = function(){

                    var q = {
                        "sharedData.identifier"            : $scope.identifier,
                        "sharedData.restrictionField"      : $scope.restrictionField,
                        "sharedData.restrictionFieldValue" : $scope.restrictionFieldValue.toString(),
                        "sharedBy"                         : $rootScope.user.userID
                    }        
                    $q.when(genericService.query('v2018', 'document-sharing', q))
                    .then(function(response){
                        if(response && response.length > 0){
                            $scope.document = _.head(response);
                        }
                        else{
                            $scope.document = {}
                            $scope.document = $scope.document || {};
                            $scope.document.storageType = "km-document"
                                // "sharedWith":   { 
                                //         "email" :           "blaisefonseca@gmail.com"
                                // },
                            $scope.document.sharedData = {
                                "identifier"            : $scope.identifier,
                                "restrictionField"      : $scope.restrictionField,
                                "restrictionFieldValue" : $scope.restrictionFieldValue
                            };
                        }
                    })
                   
                }

                $scope.getUrl = function(hash){

                    return location.origin + '/database/share/' + hash;
                }

                $scope.copyUrl = function(){
                    var body = angular.element($window.document.body);
                    var textarea = angular.element('<textarea/>');
                    textarea.css({
                        position: 'fixed',
                        opacity: '0'
                    });
                    textarea.val($document.find('#shareUrl').val());
                    body.append(textarea);
                    textarea[0].select();

                    try {
                        var successful = $window.document.execCommand('copy');
                        if (!successful) throw successful;
                    } catch (err) {
                    } finally {
                        textarea.remove();
                    }
                }

                function get(id, count){
                    count = count || 0;
                    return $q.when(genericService.get('v2018', 'document-sharing',id))
                            .then(function(response){
                                return response
                            })
                            .catch(function(error){
                                if(error.status == 404 && count < 10)
                                    return $timeout(function(){return get(id, count++)}, 2000);
                            })
                }
                $scope.loadDocument();
            }
        };
    }]);
});
