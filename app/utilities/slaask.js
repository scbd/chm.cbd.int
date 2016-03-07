define(['require', 'https://cdn.slaask.com/chat.js'], function(require) {

    // Slaask use 'Pusher' & 'emoji-parser' AMD compatible modules.
    // Since they are not required() 'Pusher' & 'emoji-parser' never get defined
    // 'emoji-parser' is defined inline & 'Pusher' injected using script-tag
    // AMD module never get loaded using require([...]) and the value 'window.Pusher' && 'window.emojiParser' never get defined
    // Overring slaask createScriptTag to use require([]) instead to fix the problem

    window.slaaskApp.prototype.createScriptTag = function (url) {

        var app = this;
        var virtualStriptTag = {};

        require(['emoji-parser', url], function(emoji) {

            if(!app.emoji)
                app.emoji = emoji;

            if(virtualStriptTag.onload)
                virtualStriptTag.onload();
        });

        return virtualStriptTag;
    };

    window._slaask = new window.slaaskApp();

    return window._slaask;
});
