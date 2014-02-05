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

    app.use(function (req, res, next) {
		if(req.url.match(/^\/activate=3Fkey/g)) {
	  		var fixedUrl = req.url.replace('/activate=3Fkey', '/activate?key');
	  		res.writeHead(302, { 'Location': fixedUrl });
			res.end();
	  	}
	  	else {
	  		next();
	  	}
	});
});

console.log("api-proto", app.get("api-proto"));
console.log("api-host",  app.get("api-host"));
console.log("api-port",  app.get("api-port"));

// Configure routes

var proxy = new httpProxy.RoutingProxy();

app.get   ('/app/*'   , function(req, res) { res.send('404', 404); } );
app.get   ('/public/*', function(req, res) { res.send('404', 404); } );

app.get   ('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'api.cbd.int', port: 80,  } ) } );
app.put   ('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'api.cbd.int', port: 80,  } ) } );
app.post  ('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'api.cbd.int', port: 80,  } ) } );
app.delete('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'api.cbd.int', port: 80,  } ) } );

// Configure index.html

app.get('/*', function(req, res) {

	if(req.headers.host=='accounts.cbd.int') {
		fs.readFile(__dirname + '/app/accounts.cbd.int.html', 'utf8', function (error, text) { 
			res.send(text); 
		});
	}
	else if(req.url.match(/^\/business/g)) {
		fs.readFile(__dirname + '/app/www.cbd.int-business.html', 'utf8', function (error, text) { 
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