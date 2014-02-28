/* jshint node: true */
var fs = require('fs');
var http = require('http');
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
    app.use('/app', express.static(__dirname + '/app'));//, { maxAge: oneDay }));
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

// Configure routes

var proxy = httpProxy.createProxyServer({});

app.get   ('/app/*'   , function(req, res) { res.send('404', 404); } );
app.get   ('/public/*', function(req, res) { res.send('404', 404); } );

app.get   ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int', secure: false } ); } );
app.put   ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int', secure: false } ); } );
app.post  ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int', secure: false } ); } );
app.delete('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int', secure: false } ); } );

// Configure index.html

app.get('/*', function(req, res) {

	fs.readFile(__dirname + '/app/index.html', 'utf8', function (error, text) {
		res.send(text);
	});
});

// Start server

console.log('Server listening on port ' + app.get('port'));
server.listen(app.get('port'));