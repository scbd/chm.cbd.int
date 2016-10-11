'use strict';

var express   = require('express');
var httpProxy = require('http-proxy');

// Create server & proxy

var app   = express();
var proxy = httpProxy.createProxyServer({});

// Configure options

app.use(require('morgan')('dev'));

// Configure routes

app.use('/favicon.ico', express.static(__dirname + '/favicon.ico'));
app.use('/app',         express.static(__dirname + '/app'));

app.all('/app/*', (req, res)=>res.status(404).send() );
app.all('/api/*', (req, res)=>proxy.web(req, res, { target: 'https://api.cbd.int', changeOrigin: true }) );

// Configure template

app.get('/*', function (req, res) {
    res.cookie('VERSION', process.env.COMMIT || '');
    res.sendFile(__dirname + '/app/index.html');
});

// Start HTTP server

app.listen(process.env.PORT || 8000, '0.0.0.0', function () {
	console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (error, req, res) {
    console.error('proxy error:', error);
    res.status(502).send();
});

process.on('SIGTERM', ()=>process.exit());
