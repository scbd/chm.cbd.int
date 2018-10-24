define(['app','text!./km-rich-textbox.html','angular','textAngular',
'css!/app/directives/forms/km-control.css', 
'css!/app/libs/textAngular/dist/textAngular.css'], 
function(app,template,angular) {
	//============================================================
	//
	//
	//============================================================
	app.directive('kmRichTextbox', ["IStorage", function(storage) {
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
						
						$scope.maxFileSize = attrs.maxFileSize || 1500000;
						$scope.editorHeightClass = attrs.editorHeightClass||'ta-editor-height-100';	

						$scope.isUploadingImage = {};
						var activeLocale;
						if(!$scope.toolbar)
							$scope.toolbar = "[['bold','italics', 'underline'],['ul', 'ol', 'undo', 'redo', 'clear'], ['insertImage', 'insertLink', 'uploadCustomImage', 'uploadCustomFile'], ['wordcount', 'charcount'], ['editorHelp']]";
								// ['justifyLeft','justifyCenter','justifyRight','justifyFull','indent','outdent'], 'html',						
						
						//==============================
						//
						//==============================
						$scope.$watch('binding', function(text) {

							text = text || {};

							_.forEach($scope.locales || _.keys(text), function(l){
								text[l] = text[l] || "";
							});

							$scope.text = _.defaults(text, $scope.text||{});

							updateText();

						}, true);

						//==============================
						//
						//==============================
						$scope.$watch('text',    updateText, true);
						$scope.$watch('locales', updateText, true);

						//==============================
						//
						//==============================
						function updateText(){

							var text = _(angular.extend($scope.binding || {}, $scope.text || {})).pick($scope.locales||[]).forEach(function(value, key, text){
								if(!value || $("<i>").html(text[key]).text().trim() == "")
									delete text[key];
							}).value();

							if(_.isEmpty(text))
								text = undefined;

							try { ngModelController.$setViewValue(text); } catch(e) {}
						}

						//==============================
						//
						//==============================
						$scope.isRequired = function()
						{
							return $scope.required!=undefined && $.isEmptyObject($scope.binding); // jshint ignore:line
						};

						//==============================
						//
						//==============================
						$scope.isShowLocale = function()
						{
							return $scope.locales && $scope.locales.length>1;
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

						$scope.onFocus = function(locale) {
							activeLocale = locale;
						}

						$scope.onFileDrop = function( file, insertAction, a, b ) {

							if(!$scope.identifier){
								alert("Associated document identifier not set, cannot upload file");
								return true;
							}

							var fileType = file.type.substring( 0, 5 );
							var mimeType = storage.attachments.getMimeType(file);
							if (storage.attachments.mimeTypeWhitelist.indexOf(mimeType) < 0) {
								alert("File type not supported: " + mimeType);
								return true;
							}
							if(file.size > 20000000 ) { //max 20mb attachments allowed by cbd
								alert( "file size cannot exceed 20MB");
								return true;
							}
							
							var acLocale = angular.copy(activeLocale);
							$scope.isUploadingImage[acLocale] = true;
							storage.attachments.put($scope.identifier, file)
							.then(function(data){
								var action = "insertImage"
								var actionData = data.url;

								if(fileType !== 'image' || mimeType=='image/tiff' || file.size > $scope.maxFileSize ){
									action = 'inserthtml'
									actionData = '<a target="_blank" href="'+data.url+'">'+data.filename+ '</a>'
								}
								insertAction(action , actionData, true );
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
						
						$scope.stripFormat = function($html){
							// console.log($html)
						}
					}
			};
	}]);
});
