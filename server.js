/* jshint node: true, browser: false */
'use strict';

require("console-stamp")(console, "HH:MM:ss.l");

// LOG UNHANDLED EXCEPTION AND EXIT
process.on('uncaughtException', function (err) {
  console.error('uncaughtException:', err.message);
  console.error(err.stack);
  process.exit(1);
});

/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

// CREATE HTTP SERVER AND PROXY

var app     = require('express')();
var proxy   = require('http-proxy').createProxyServer({});

// LOAD CONFIGURATION

var oneDay = 86400000;

app.use(require('morgan')('dev'));
app.use(require('compression')());

app.set('port', process.env.PORT || 2000);
app.use('/app',         require('serve-static')(__dirname + '/app'));
app.use('/favicon.ico', require('serve-static')(__dirname + '/favicon.ico', { maxAge:    oneDay }));

// Configure routes

app.all   ('/app/*', function(req, res) { res.status(404).send(); } );

app.get   ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.put   ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.post  ('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );
app.delete('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );

// Configure index.html

app.get('/*', function (req, res) { res.sendfile(__dirname + '/app/index.html'); });

// Start server

app.listen(app.get('port'), function () {
	console.log('Server listening on %j', this.address());
});

// LOG PROXY ERROR & RETURN http:500

proxy.on('error', function (e, req, res) {
    console.error('error proxying: '+req.url);
    console.error('proxy error:', e);
    res.send( { code: 500, source:'chm/proxy', message : 'proxy error', proxyError: e }, 500);
});
