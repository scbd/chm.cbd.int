define([], function() { // add https://cdn.slaask.com/chat.js as <script>

    // slaask use AMD compatble modules. since it's not required() the value 'window.Pusher' never get define

    window.slaaskApp.prototype.createScriptTag = createScriptTag;
    window._slaask.createScriptTag = createScriptTag;

    return window._slaask;

    function createScriptTag(url) {

        var virtualDomElement = {};

        require([url], function() {
            if(virtualDomElement.onload) {
                virtualDomElement.onload();
            }
        });

        return virtualDomElement;
    }
});
