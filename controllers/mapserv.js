var express = require('express')
,router = express.Router()
,pg = require("pg")
,mapserv = require('mapserv') // the Mapserv module
,path = require('path')
,fs = require('fs')                  // for filesystem operations
,map
,env
,mapfile="MAP \
	NAME parcel \
	STATUS ON \
	EXTENT -12366899.680315234 4148390.3990930878 -12327763.921833225 4187526.157575096 \
	SIZE 256 256 \
	IMAGECOLOR 255 255 255 \
	LAYER \
	NAME 'homesites' \
	STATUS ON \
	TYPE POLYGON \
	DATA 'c:/enide/ws/ma/public/files/reaisincva/homesites.shp' \
	CLASS \
	NAME 'homesites' \
	STYLE \
	COLOR '#000000' \
	OUTLINECOLOR '#999999' \
	WIDTH 1 \
	END \
	END \
	END \
	END";

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
//path.normalize(__dirname+"/../public/files/"+req.user.shortName+"/"+req.query.LAYERS) + "' \
///'C:/enide/ws/ma\\public/files/reaisincva/homesites.shp') + "' \
//console.log(mapfile);

//Instantiate a Map object from the mapfile string. You could use
//`mapserv.Map.FromFile` instead.
mapserv.Map.FromString(mapfile, function handleMap(err, _map) {
	//console.log(err);
	if (err) throw err;         // error loading the mapfile

	// a minimal CGI environment
	env = {
			REQUEST_METHOD: 'GET',
			QUERY_STRING: 'mode=map&layer=homesites'
	};
	map = _map;
});

router.get('/*',  function(req, res){
	if(req.query.BBOX){
		drawMap(req,res);
		return;
	}
//console.log(path.normalize(__dirname+req.user.shortName+"/"+req.query.LAYERS));

	console.log("Mapserv url: " + req.url);
	map.mapserv(env, function handleMapResponse(err, mapResponse) {
		//console.log(err);
		//if (err) {
		//	throw err;          // error generating the response
		//}
        if (err) {
            // the map returned an error: handle it
            if (mapResponse.data) {
                // return the error as rendered by mapserver
                res.writeHead(500, mapResponse.headers);
                res.end(mapResponse.data);
            } else {
                // A raw error we need to output ourselves
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.end(err.stack);
            }
            console.error(err.stack); // log the error
            return;
        }		
		// send the map response to the client
        res.writeHead(200, mapResponse.headers);
        if (req.method !== 'HEAD') {
            res.end(mapResponse.data);
        } else {
            res.end();
        }
        /*
		// If the response is an image, save it to a file, otherwise write it
		// to standard output.
		var contentType = mapResponse.headers['Content-Type'][0]; // get the content type from the headers
		if (contentType.substr(0, 5) === 'image') {
			var filename = 'output.' + contentType.substr(6); // get the file extension from the content type
			fs.writeFile(filename, mapResponse.data, function onWrite(err) {
				if (err) {
					throw err;  // error writing to file
				}
				console.log('Mapserver response written to `%s`', filename);
			});
		} else {
			console.log(mapResponse.data.toString());
		}
		*/
	});

});
function drawMap(req,res){
	// A minimalist mapfile string
	//var filename=__dirname + "/../public/files/" + req.user.shortName + "/" + fileName;
	var mapfile = "MAP \n \
NAME parcel \n \
STATUS ON \n\
EXTENT "+req.query.BBOX.replace(/,/g," ") + "\n \
SIZE "+req.query.WIDTH + " " + req.query.HEIGHT + "\n \
IMAGECOLOR 255 255 255 \n \
TRANSPARENT on \n \
LAYER \n \
NAME '"+req.query.LAYERS+"' \n \
STATUS ON \n \
TYPE POLYGON \n \
DATA 'c:/enide/ws/ma/public/files/reaisincva/homesites.shp' \
CLASS \n\
NAME '"+req.query.LAYERS+"' \n \
STYLE \n \
COLOR '#8b7765' \n \
OUTLINECOLOR '#999999' \n \
WIDTH 0.5 \n \
END \n \
END \n \
END  \n \
END";

//DATA '"+path.normalize(__dirname + "/../public/files/" + req.user.shortName + "/" + req.query.LAYERS)+".shp' \n \
//OPACITY 40 \n \

//STATUS DEFAULT \n \
//TRANSFORM FALSE \n \
	console.log(mapfile);
	// Instantiate a Map object from the mapfile string. You could use
	// `mapserv.Map.FromFile` instead.
	mapserv.Map.FromString(mapfile, function handleMap(err, map) {
	    if (err) throw err;         // error loading the mapfile

	    // a minimal CGI environment
	    var env = {
	        REQUEST_METHOD: 'GET',
	        QUERY_STRING: 'mode=map&layer='+req.query.LAYERS
	    };

	    map.mapserv(env, function handleMapResponse(err, mapResponse) {

	        if (err) {
                // the map returned an error: handle it
                if (mapResponse.data) {
                    // return the error as rendered by mapserver
                    res.writeHead(500, mapResponse.headers);
                    res.end(mapResponse.data);
                } else {
                    // A raw error we need to output ourselves
                    res.writeHead(500, {'Content-Type': 'text/plain'});
                    res.end(err.stack);
                }
                console.error(err.stack); // log the error
                return;
            }

            // send the map response to the client
            res.writeHead(200, mapResponse.headers);
            if (req.method !== 'HEAD') {
                res.end(mapResponse.data);
            } else {
                res.end();
            }
	    });
	});	
	
}
module.exports = router;