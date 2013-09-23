var express = require('express');
var fs = require('fs');
var http = require('http');
var httpProxy = require('http-proxy');

// Create server
        
var app = express();
var server = http.createServer(app);

// Configure local paths

app.use(express.compress());
app.use(express.static(__dirname));

app.get('/', function(req, res) {
	fs.readFile(__dirname + '/app/index.html', 'utf8', function(err, text) {
    	res.send(text);
	});
});

// Configure proxy

var proxy = new httpProxy.RoutingProxy();

app.use(function (req, res, next) {
    return proxy.proxyRequest(req, res, { changeOrigin: true, host: 'chm.cbd.int', port: 80 } );
});

// Start server

server.listen(3000);