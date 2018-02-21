'use strict';

var _       = require('lodash');
var fs      = require('co-fs');
var util    = require('util');
var co      = require('co');
var express   = require('express');
var httpProxy = require('http-proxy');
var url     = require('url');
var cookieParser = require('cookie-parser');

var appVersion = process.env.TAG;
if(!appVersion || appVersion.trim()==''){
    appVersion =   process.env.COMMIT
}  
// Create server & proxy

var app   = express();
var proxy = httpProxy.createProxyServer({});

// Configure options
if(!process.env.API_URL) {
    console.error("WARNING: environment API_URL not set. USING default (https://api.cbddev.xyz) ");
}

var apiUrl = process.env.API_URL || 'https://api.cbddev.xyz';
console.info(`info: chm.cbd.int`);
//console.info(`info: Git version: ${gitVersion}`);
console.info(`info: API address: ${apiUrl}`);

app.set('view engine', 'ejs');
app.use(require('morgan')('dev'));
app.use(cookieParser())

// Configure routes

app.use('/favicon.ico', express.static(__dirname + '/favicon.ico', { setHeaders: setCustomCacheControl }));
app.use('/?:lang(ar|en|es|fr|ru|zh)?/app',     translation, express.static(__dirname + '/app', { setHeaders: setCustomCacheControl }));

app.all('/app/*', (req, res)=>res.status(404).send() );

app.all('/?:lang(ar|en|es|fr|ru|zh)?/api/*', (req, res)=>proxy.web(req, res, { target: apiUrl, changeOrigin: true }) );

// Configure template

app.get('/?:lang(ar|en|es|fr|ru|zh)?/*', function (req, res) {
   var urlPreferredLang;
   
   if(req.params.lang)
     urlPreferredLang = ('/'+req.params.lang+'/');
   else{ //temp because the above regex does not work for chm.cbd.int/fr case
        var lang = _.first(_.values(_.omitBy(req.params, _.isNil)))
        var langRegex = /^(ar|en|es|fr|ru|zh)$/
        if(langRegex.test(lang))
            urlPreferredLang = ('/'+lang+'/')
   } 

   res.setHeader('Cache-Control', 'public, max-age=0');

   res.cookie('VERSION', appVersion);
   req.url = '/index.ejs';
   co(function*(){

        var preferredLang = getPreferredLanguage(req);
        var langFilepath = yield getLanguageFile(req, preferredLang);
        var options = { baseUrl: urlPreferredLang || (req.headers.base_url ||  (preferredLang ? ('/'+preferredLang+'/') : '/')), 'appVersion' : appVersion };

        if(langFilepath){
             return res.render(langFilepath, options);
        }

        return res.render(__dirname + '/app/index.ejs', options);
    })
});
// Start HTTP server

app.listen(process.env.PORT || 2000, '0.0.0.0', function () {
	console.log('Server listening on %j', this.address());
});

// Handle proxy errors ignore

proxy.on('error', function (error, req, res) {
    console.error('proxy error:', error);
    res.status(502).send();
});

process.on('SIGTERM', ()=>process.exit());


function translation(req, res, next) {
   
   co(function*(){
        let langFilepath = yield getLanguageFile(req);
        if(langFilepath){
             return res.sendFile(langFilepath);
        }    
            
        next();
   });
}

function* getLanguageFile(req, preferredLang){

    if(!preferredLang)
        preferredLang = getPreferredLanguage(req);

    if(preferredLang){
        var requestedUrl = url.parse(req.url).pathname;
        var path = `/i18n/${preferredLang}/app${requestedUrl}`;               

        let statsLang;
        try{
            statsLang  = yield fs.stat(__dirname + path);
        }catch(e){}
        if (statsLang && statsLang.isFile()) {
            
            var statsEN    = yield fs.stat(`${__dirname}/app${requestedUrl}`);

            var mLangtime  = new Date(util.inspect(statsLang.mtime));
            var mENtime    = new Date(util.inspect(statsEN.mtime));
            if(mLangtime >= mENtime)
                return __dirname + path;
        }
    }           
}

function getPreferredLanguage(req){
    
    var htmlRegex       = /.(html|ejs|json)$/g; ///.html?[^.]/g//\.html(?!.js)
    var langRegex       = /^(ar|fr|es|ru|zh)/;
    var requestedUrl    = url.parse(req.url).pathname;

    if(!htmlRegex.test(requestedUrl))
        return;

    if(req.params.lang)
        return req.params.lang;
    
    if(req.headers['preferred-language']){

        var validLanguages = ['ar', 'fr', 'es', 'ru', 'zh']
        var language = req.headers['preferred-language'];
        
        if(_.includes(validLanguages, language.toLowerCase())){
            return language;
        }
    }
}

//============================================================
//
//
//============================================================
function setCustomCacheControl(res, path) {

	var versionWrong = false;
	var versionMatch = false;
    var localhostRegex = /^http:\/\/localhost:([0-9]{4})\//;
    if(res.req.headers && !localhostRegex.test(res.req.headers.referer)){
        versionWrong |= res.req.query && res.req.query.v && res.req.query.v!=appVersion;
        versionWrong |= res.req.cookies && res.req.cookies.VERSION && res.req.cookies.VERSION!=appVersion;
        versionMatch |= res.req.query && res.req.query.v && res.req.query.v==appVersion;
        versionMatch |= res.req.cookies && res.req.cookies.VERSION && res.req.cookies.VERSION==appVersion;
    }

	if(versionWrong || !versionMatch)
		return res.setHeader('Cache-Control', 'public, max-age=0');

	res.setHeader('Cache-Control', 'public, max-age=86400000');
}
