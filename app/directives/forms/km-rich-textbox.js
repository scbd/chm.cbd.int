define(['app','text!./km-rich-textbox.html','angular','textAngular',
'css!/app/directives/forms/km-control.css', 'css!/app/libs/textAngular/dist/textAngular.css'], 
function(app,template,angular) {
	//============================================================
	//
	//
	//============================================================
	app.directive('kmRichTextbox', function() {
			return {
					restrict: 'EAC',
					template: template,
					replace: true,
					require: "?ngModel",
					scope: {
							placeholder: '@',
							ngDisabledFn: '&ngDisabled',
							binding: '=ngModel',
							locales: '=',
							rows: '=',
							required: "@",
							ngChange: "&",
							toolbar : "@?",
							identifier : '=?',
							onFileUpload : '&?'
					},
					link: function($scope, element, attrs, ngModelController) {
							$scope.text = {};
							$scope.$watch('locales', $scope.watchLocales);
							$scope.$watch('binding', $scope.watchBinding);
							$scope.$watch('binding', function() {
									try {
											ngModelController.$setViewValue($scope.binding);
									} catch (e) {}
							});

							$scope.maxFileSize = attrs.maxFileSize || 1000000;
							$scope.editorHeightClass = attrs.editorHeightClass||'ta-editor-height-100';
					},
					controller: ["$scope", "IStorage", function($scope, storage) {
							$scope.isUploadingImage = {};
							var activeLocale;
							if(!$scope.toolbar)
								$scope.toolbar = "[['bold','italics', 'underline'],['ul', 'ol', 'undo', 'redo', 'clear'],['wordcount', 'charcount'], ['insertImage']]";
									// ['justifyLeft','justifyCenter','justifyRight','justifyFull','indent','outdent'],
							//==============================
							//Remove value of not selected languages/empty languages
							//==============================
							$scope.watchLocales = function() {
									var oLocales = $scope.locales || [];
									var oBinding = $scope.binding || {};
									var oText = $scope.text;

									angular.forEach(oLocales, function(locale, i) {
											oText[locale] = oBinding[locale] || oText[locale];
									});
							};

							//==============================
							//Remove value of not selected languages/empty languages
							//==============================
							$scope.watchBinding = function() {
									var oLocales = $scope.locales || [];
									var oBinding = $scope.binding || {};
									var oText = $scope.text;

									angular.forEach(oLocales, function(locale, i) {
											oText[locale] = oBinding[locale];
									});
							};

							//==============================
							//Remove value of not selected languages/empty languages
							//==============================
							$scope.onchange = function() {
									var oLocales = $scope.locales || [];
									var oText = $scope.text || {};
									var oNewBinding = {};

									angular.forEach(oLocales, function(locale, i) {
											if ($("<i>").html(oText[locale]).text().trim() !== "")
													oNewBinding[locale] = oText[locale];
									});

									$scope.binding = !$.isEmptyObject(oNewBinding) ? oNewBinding : undefined;
									$scope.ngChange();
							};

							//==============================
							//
							//==============================
							$scope.isRequired = function() {
									return $scope.required !== undefined && $.isEmptyObject($scope.binding);
							};

							//==============================
							//
							//==============================
							$scope.isShowLocale = function() {
									return $scope.locales && $scope.locales.length > 1;
							};	

							$scope.onFocus = function(locale) {
								activeLocale = locale;
							}

							$scope.onFileDrop = function( file, insertAction, a, b ) {
								
								if( file.type.substring( 0, 5 ) !== "image" ) {
									alert( "only images can be added" );
									return true;
								}
								if( file.size > $scope.maxFileSize ) {
									alert( "file size cannot exceed " + bytesToSize($scope.maxFileSize));
									return true;
								}
								var acLocale = angular.copy(activeLocale);
								$scope.isUploadingImage[acLocale] = true;
								storage.attachments.put($scope.identifier, file)
								.then(function(data){
									insertAction( "insertImage", data.url, true );
									if($scope.onFileUpload && typeof $scope.onFileUpload == 'function'){
										data.locale =  acLocale;
										$scope.onFileUpload({data:data});
									}
								})
								.finally(function(){
									$scope.isUploadingImage[acLocale] = false;
								});

								return true;
							};

							function bytesToSize(bytes) {
								var sizes = ['Bytes', 'KB', 'MB'];
								if (bytes == 0) return '0 Byte';
								var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
								return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
							 };
					}]
			};
	});
});
