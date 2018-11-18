define(['text!./reference-selector.html','app', 'ngDialog'
], function (template, app, commonjs) { // jshint ignore:line

app.directive("referenceSelector", ["$http",'$rootScope', "$filter", "$q", 'ngDialog', 'IStorage', 'realm',
function ($http, $rootScope, $filter, $q, ngDialog, IStorage, realm) {

	return {
		restrict   : "EA",
		template   : template,
		replace    : true,
		transclude : false,
		scope      : {
			model     : "=ngModel",
			locales   : "=locales",
			caption   : "@caption",
			disabled  : "=ngDisabled",
            government: "=government",
            question  : "@question",
            type     : "@type",
            filter : "@filter",
            hideSelf : "=hideSelf",
		},
		link : function($scope) {
            var dialogId;
            $scope.rawDocuments = [];
            $scope.selectedDocuments=[];
			$scope.areVisible = false;
            $scope.userGov = $scope.$root.user.government;
            $scope.showAddButton = false;

            if(!$scope.type) $scope.type = "checkbox";


            //==================================
            //
            //==================================
			$scope.saveDocuments = function(){

                //$scope.model=undefined;

                _.forEach($scope.rawDocuments.docs, function (doc) {

                    if(doc.__checked === true)
                    {
                        if(!$scope.model && $scope.type != 'radio')
                            $scope.model=[];

                        if(!$scope.isInModel(doc.identifier_s)){
							var document = { identifier: doc.identifier_s };
							if($scope.type == 'radio')
								$scope.model = document;
							else
                            	$scope.model.push(document);
                        }
                    }
                    if(!doc.__checked && $scope.isInModel(doc.identifier_s)){
                        	$scope.removeDocument(doc)
                    }

                });

                $scope.syncDocuments();

                ngDialog.close(dialogId);
				$scope.areVisible = true;
			};


             //==================================
            //
            //==================================
			$scope.syncDocuments = function(){

               $scope.rawDocuments.docs =  _.filter($scope.rawDocuments.docs, function (doc) {
                    doc.__checked = false;

                    if($scope.hideSelf && $scope.hideSelf === doc.identifier_s)
                    {
                        return false;
                    }
                    return doc;

                });


				var docs = []
                if ($scope.model){
                    var realmConfig = {params:{realm:undefined}};                    
                    // if(realm == "CHM-DEV")
                    //    realmConfig.params.realm = 'abs-dev';
                    // else if(realm == "CHM-TRG")
                    //     realmConfig.params.realm = 'abs-trg';
                    // else
                    //    realmConfig.params.realm = 'abs';

					if($scope.type == 'radio'){
						docs.push(IStorage.documents.get($scope.model.identifier, null, realmConfig));
					}
					else{
	                    _.each($scope.model, function (mod) {
							if(mod.identifier)
								docs.push(IStorage.documents.get(mod.identifier, null, realmConfig));
	                    });
					}

					$q.all(docs)
					.then(function(results){
							$scope.selectedDocuments = _.map(results, function(result){
												return result.data || {};
											});
					});

                    if($scope.model.length === 0 || _.isEmpty($scope.model))
                        $scope.model = undefined;
                }

				$scope.areVisible = true;
			};

            //==================================
            //
            //==================================
			$scope.isInModel = function(id){

				if(!$scope.model)
					return false;

				if($scope.type == 'radio')
					return removeRevisonNumber($scope.model.identifier) === id

				return  _.find($scope.model, function (mod) {
		                    return removeRevisonNumber(mod.identifier) === id
		                });

			};

            //==================================
            //
            //==================================
			$scope.isChecked = function(item){
                if(item.__checked){
                    return item;
                }
			};

            //==================================
            //
            //==================================
			$scope.selectDoc = function(document){

                 _.forEach($scope.rawDocuments.docs, function (doc) {
                    doc.__checked = false;

                    if(doc.identifier_s === document.identifier_s ){
                        doc.__checked = true;
                    }
                });
			};


            //==================================
            //
            //==================================
			$scope.removeDocument = function(document){

                var removeId;
				 if(document.identifier)
				   removeId = document.identifier;
                 else if(document.header)
                    removeId = document.header.identifier;
                 else
                    removeId = document.identifier_s;

                 if($scope.rawDocuments){
                    _.forEach($scope.rawDocuments.docs, function (doc) {
                            if(doc.identifier_s === removeId ){
                                doc.__checked = false;
                            }
                    });
                 }

                if($scope.selectedDocuments){
                    $scope.selectedDocuments =  _.filter($scope.selectedDocuments, function (doc) {
                        if(doc.header.identifier !== removeId ){
                        return doc;
                        }
                    });
                }
			   if($scope.type != 'radio')
	               $scope.model =  _.filter($scope.model, function (doc) {
	                    if((doc.identifier !== removeId && removeId.indexOf('@')>=0) || 
                           (removeId.indexOf('@')<0 && removeRevisonNumber(doc.identifier) !== removeRevisonNumber(removeId))){
	                     return doc;
	                    }
	                });
				else
					$scope.model = undefined;

                if($scope.model){
                    if($scope.model.length===0)
                        $scope.model = undefined;
                }

			};

             //==================================
            //
            //==================================
            function getDocs () {
                var searchOperation;
				$scope.isLoading = true;
                var schema = "*";
                if ($scope.schema)
                    schema = $scope.schema;

                var q  = "schema_s:(absPermit absCheckpoint absCheckpointCommunique authority measure database focalPoint)";

                if(realm == "CHM-DEV")
                    q += ' AND realm_ss:abs-dev'
                else if(realm == "CHM-TRG")
                    q += ' AND realm_ss:abs-trg'
                else
                    q += ' AND realm_ss:abs'

                if($scope.government)
                    q  = q + " AND government_s:" + $scope.government.identifier;
                if(!$scope.government &&  $scope.userGov)
                    q  = q + " AND government_s:" + $scope.userGov;

                if($scope.hideSelf){
                    q  = q + " AND NOT (identifier_s:" + $scope.hideSelf + ")";
                }

                var queryParameters = {
                    'q'         : q,
                    'fl'        : 'uniqueIdentifier_s, title_s, identifier_s, _revision_i, rec_countryName:government_EN_t, schema_EN_t,schema_s,'+
                                  ' rec_title:title_EN_t, rec_summary:description_t, rec_type:type_EN_t, rec_meta1:meta1_EN_txt, rec_meta2:meta2_EN_txt,' +
                                  ' rec_meta3:meta3_EN_txt,rec_meta4:meta4_EN_txt,rec_meta5:meta5_EN_txt, url_ss', 
                    'start'     : 0,
                    'rows'      : 1000,
                    'wt'        : 'json',
                };

                searchOperation = $http.get('/api/v2013/index/select', { params: queryParameters});

                return $q.when(searchOperation)
                    .then(function(data) {
                       $scope.rawDocuments = data.data.response;
                    }).catch(function(error) {
                        console.log('ERROR: ' + error);
                    })
                    .finally(function(){
                       $scope.isLoading = false;
                    });

            }

           //==================================
            //
            //==================================
            function load() {
                if(!$scope.rawDocuments || _.isEmpty($scope.rawDocuments.docs))
                {
                    return getDocs();                    
                }
            };



			//==================================
		    //
		    //==================================
		    $scope.$watch('model', function(newValue, oldValue){
		        if(newValue){
                     $scope.syncDocuments();
                     $scope.showAddButton = true;
		        }
		    });


            //==================================
            //
            //==================================
			$scope.openAddDialog = function(){

                var dialog = ngDialog.open({
                    template: 'documentSelectionModal',
                    closeByDocument: false,showClose:false,
                    scope: $scope
                });
                dialogId = dialog.id;
                 $q.when(load())
                    .then(function (){                        
                        //$scope.syncDocuments();
                        _.forEach($scope.rawDocuments.docs, function (doc) {
                            doc.__checked = false;
                            if($scope.isInModel(doc.identifier_s)){
                                doc.__checked = true;
                            }

                        });
                    });
			};

            $scope.closeDialog = function () {
                $scope.syncDocuments();
                ngDialog.close(dialogId);
            };
			function removeRevisonNumber(identifier){
                
                if(identifier.indexOf('@')>=0)
				    return identifier.substr(0, identifier.indexOf('@'))
                
                return identifier;
			}

		},

	};
}]);

});
