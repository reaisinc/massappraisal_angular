var express = require('express')
,router = express.Router()
//,pg = require("pg")
//,mapserv = require('mapserv') // the Mapserv module
//,path = require('path')
,fs = require('fs')                  // for filesystem operations
,path = require('path')         // for file path manipulations
,http = require('http')         // for the http server
,url = require('url')           // for url parsing
,events = require('events')     // for the logger
,logger = new events.EventEmitter()
,mapcache = require('node-mapcache') // the MapCache module
,port = 8080                    // which port will the server run on?
,cache
,baseUrl = "http://localhost:8888/mapcache/"         // what is the server url?
,conffile = path.join(__dirname, 'mapcache.xml'); // the location of the config file

//console.log(__dirname);
//console.log(conffile);

//Handle log messages
logger.on('log', function handleLog(logLevel, logMessage) {
	if (logLevel >= mapcache.logLevels.WARN) {
		console.error('OOPS! (%d): %s', logLevel, logMessage);
	} else {
		console.log('LOG (%d): %s', logLevel, logMessage);
	}
});

/*
router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		res.redirect('/login');
		return; 
	}
	next();
});
*/

//Instantiate a MapCache cache object from the configuration file

mapcache.MapCache.FromConfigFile(conffile, logger, function handleCache(err, _cache) {
	//console.log("Starting server");
	if (err) {
		console.log(err);
		throw err;              // error loading the configuration file
	}
	cache=_cache;
});

//obs! must use wildcard in get or it breaks
router.get('/*',  function(req, res){
	var urlParts = url.parse(decodeURIComponent(req.url)); // parse the request url
	var pathInfo = urlParts.pathname || "/"; // generate the PATH_INFO
	var params = urlParts.query || '';       // generate the QUERY_STRING

	// delegate the request to the MapCache cache object, handling the response
	cache.get(baseUrl, pathInfo, params, function handleCacheResponse(err, cacheResponse) {
		console.log('Serving ' + req.url);

		if (err) {
			// the cache returned an error: handle it
			res.writeHead(500);
			res.end(err.stack);
			console.error(err.stack);
			return;
		}

		// send the cache response to the client
		res.writeHead(cacheResponse.code, cacheResponse.headers);
		if (req.method !== 'HEAD') {
			res.end(cacheResponse.data);
		} else {
			res.end();
		}
	});
});

module.exports = router;