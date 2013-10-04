var express = require('express');
var fs = require('fs');
var http = require('http');
var https = require('https');
var httpProxy = require('http-proxy');

var httpsOptions = {
  key: fs.readFileSync('../certificates/cbd_int.pem'),
  cert: fs.readFileSync('../certificates/cbd_int.pem')
};

// Create server
        
var app = express();
var server1 = http.createServer(app);
var server2 = https.createServer(httpsOptions, app);

// Configure local paths

app.use(express.compress());
app.use(express.static(__dirname));

app.get('/app/*', function(req, res) { res.send('404', 404); } );

app.get('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );
app.put('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );
app.post('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );
app.delete('/api/*', function(req, res) { proxy.proxyRequest(req, res, { changeOrigin: true, host: 'bch.cbd.int', port: 80 }); } );

app.get('/*', function(req, res) { fs.readFile(__dirname + '/app/index.html', 'utf8', function(err, text) { res.send(text); }) });

// Configure proxy

var proxy = new httpProxy.RoutingProxy();

// Start server
console.log("listening on port 2000/2001")
server1.listen(2000);
server2.listen(2001);