define(['app','rangy-core', 'rangy-selectionsave', 'textAngular', function(app, rangyCore){
    
    window.rangy = rangyCore;

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

}])
