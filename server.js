var fs = require('fs');
var http = require('http');
var https = require('https');
var express = require('express');
var httpProxy = require('http-proxy');

// Create server

var app = express();
var server = http.createServer(app);

var oneDay = 86400000;

app.configure(function() {
    app.set('port', process.env.PORT || 2000);
    app.use(express.logger('dev'));
    app.use(express.compress());
    app.use('/app', express.static(__dirname + '/app', { maxAge: oneDay }));
    app.use('/public', express.static(__dirname + '/public', { maxAge: oneDay }));
    app.use('/favicon.ico', express.static(__dirname + '/favicon.ico', { maxAge: oneDay }));
});


// Configure routes

var proxy = new httpProxy.RoutingProxy();

app.get   ('/app/*'   , function(req, res) { res.send('404', 404); } );
app.get   ('/public/*', function(req, res) { res.send('404', 404); } );

app.get   ('/api/v2013/countries'  , function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: '54.208.130.180', port: 8000 }); } );
app.get   ('/api/v2013/countries/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: '54.208.130.180', port: 8000 }); } );

app.get   ('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );
app.put   ('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );
app.post  ('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );
app.delete('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );

// Configure index.html

app.get('/*', function(req, res) {

	if(req.headers.host=='accounts.cbd.int' || req.headers.host=='localhost:2000') {
		fs.readFile(__dirname + '/app/accounts.cbd.int.html', 'utf8', function (error, text) { 
			res.send(text); 
		});
	}
	else {
		fs.readFile(__dirname + '/app/index.html', 'utf8', function (error, text) { 
			res.send(text); 
		});
	}
});

// Start server

console.log('Server listening on port ' + app.get('port'));
server.listen(app.get('port'));