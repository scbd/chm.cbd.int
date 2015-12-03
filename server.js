/* jshint node: true, browser: false */
'use strict';

// CREATE HTTP SERVER AND PROXY

var app     = require('express')();
var proxy   = require('http-proxy').createProxyServer({});

proxy.on('error', function(e) {
    console.error(e);
}); //ignore errors

// LOAD CONFIGURATION

var oneDay   = 86400000;
var cacheTag = Math.random() * 0x80000000 | 0;

app.use(require('morgan')('dev'));

app.set('port', process.env.PORT || 2000);
app.use('/favicon.ico', require('serve-static')(__dirname + '/favicon.ico', { maxAge:    oneDay }));

// Configure routes

app.use('/app',   require('serve-static')(__dirname + '/app'));
app.all('/app/*', function(req, res) { res.status(404).send(); } );
app.all('/api/*', function(req, res) { proxy.web(req, res, { target: 'https://api.cbd.int:443', secure: false } ); } );

// Configure index.html

app.get('/*', function (req, res) {
    res.cookie('cachetag', cacheTag);
    res.sendFile(__dirname + '/app/index.html');
});

// Start server

app.listen(app.get('port'), function () {
	console.log('Server listening on %j', this.address());
});
