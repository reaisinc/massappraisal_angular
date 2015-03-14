var express = require('express');
var router = express.Router();
var pg = require("pg");
var path=require("path");

var mapserv = require('mapserv'), // the Mapserv module
fs = require('fs');                  // for filesystem operations

//replace(substring(st_extent(wkb_geometry)::text,4),' ',',')

router.get('/',  function(req, res){
	if(req.query.debug)console.log(req.query);
	if(req.query.BBOX){
		//if(req.query.ID)
		drawPGMap(req,res);
		//else
		//	drawShapefileMap(req,res);
		return;
	}
	//return;
	//if(!req.query){
	//get centroid
	//var sql="select replace(replace(substr(st_astext(ST_FlipCoordinates(ST_Transform( st_setsrid(st_centroid(st_extent(wkb_geometry)),3857),   4326))),7),' ',','),')','') as extent from "+req.user.shortName + "." + req.query.tableName;
	var sql="select replace(replace(substring(box2d(st_transform(st_setsrid(st_extent(wkb_geometry),3857),4326))::text,5),' ',','),')','') as extent from "+req.user.shortName + "." + req.query.tableName;
	//var sql="select replace(replace(substr(st_astext((st_centroid(st_extent(wkb_geometry)))),7),' ',','),')','') as extent from "+req.user.shortName + "." + req.query.tableName;
	console.log(sql);
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  client.query(sql, function(err, result) {
			  if(err)console.log(err);
			  //console.log(result.rows);
			res.render('map', {
				user : req.user,
				layerName: req.query.tableName,
				extent:result.rows[0].extent
				//layername:result.rows[0].layername
			});
			release()
		  })
		})
	
		return;
	//}
});

function drawPGMap(req,res){
	// A minimalist mapfile string
	//var filename=__dirname + "/../public/files/" + req.user.shortName + "/" + fileName;
	var oid = parseInt(req.query.ID);
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
CONNECTIONTYPE POSTGIS \n \
CONNECTION '"+global.postgisStr+"' \n \
DATA 'wkb_geometry from "+(oid?"(select oid,wkb_geometry from " + req.user.shortName + "." + req.query.LAYERS + " where oid="+oid+") as subquery":req.user.shortName + "." + req.query.LAYERS)+" using SRID=3857 using unique oid' \n \
PROCESSING 'CLOSE_CONNECTION=DEFER' \n \
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

//(SELECT geom, attr1, attr2 FROM country WHERE country = 'usa') as subquery
//DATA '"+path.normalize(__dirname + "/../public/files/" + req.user.shortName + "/" + req.query.LAYERS)+".shp' \n \
//OPACITY 40 \n \

//STATUS DEFAULT \n \
//TRANSFORM FALSE \n \
	if(req.query.debug)
	console.log(mapfile);
	// Instantiate a Map object from the mapfile string. You could use
	// `mapserv.Map.FromFile` instead.
	mapserv.Map.FromString(mapfile, function handleMap(err, map) {
	    if (err) {
	    	console.log(err);
	    	throw err;         // error loading the mapfile
	    }

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

function drawShapefileMap(req,res){
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
DATA '"+path.normalize(__dirname + "/../public/files/" + req.user.shortName + "/" + req.query.LAYERS)+".shp' \n \
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