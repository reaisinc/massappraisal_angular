var express = require('express');
var router = express.Router();
var pg = require("pg");
var path=require("path");

var mapserv = require('mapserv'), // the Mapserv module
fs = require('fs');                  // for filesystem operations

router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		res.redirect('/login');
		return; 
	}
	next();
});
//replace(substring(st_extent(wkb_geometry)::text,4),' ',',')

router.get('/',  function(req, res){
	console.log(req.query);
	if(req.query.BBOX){
		drawMap(req,res);
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
			  console.log(result.rows);
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

router.get('/:tableName',  function(req, res){
	console.log(req.params.tableName);
	//return;
	res.writeHead(200, {"Content-Type": "application/json"});
	res.setTimeout(0); 

  //res.send("respond with a resource");
	var debug=false;
	if(!req.user.shortName)
	{
		req.user.shortName = req.user.emails[0].value;
	}
  
  	var tableName = req.params.tableName;
	  if(!tableName){
	  	tableName = req.query.tableName;
	  	if(!tableName){
		  	res.end(JSON.stringify({"err":"Tablename missing in request!"}));
		  	return;
			}
	  }
	  tableName = tableName.replace(/\W/g, '').toLowerCase();
	  var idName = req.query.idName;
	  if(!idName)idName='oid';
	  else idName=idName.replace(/\W/g, '');
	  //var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('id','ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	  var sql="select name from " + req.user.shortName + "." + tableName + "_vars where include=1 order by id desc,depvar desc,name asc";
	  console.log(sql);
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  //strip off extension
		  client.query(sql, function(err, result) {
		  		//add the schema to the tablename
					tableName = req.user.shortName+"."+ tableName+'_stats';
				  var cols=[];
				  console.log(result.rows);
				  for(var i in result.rows){
				  	if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	else if(result.rows[i].name.indexOf(" ")!=-1)
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	cols.push(result.rows[i].name);
				  }
				  var sql = "select name,vars,n,mean,sd,median,trimmed,mad,min,max,range,se from public.r_table_summary('" + cols.join(",") + "','" + tableName + "')";
				  console.log(sql);
			  	client.query(sql, function(err, result) {
				    release()
				    if (err) {
				    	res.end(JSON.stringify({'err':err.toString()}));
				     }
			    	//var obj=result.rows;
			    	else if(result){
			    		   res.end(JSON.stringify(result.rows));
			    	}
			  	});
		  })
		})

});
router.get('/download/:tableName',function(req,res){
	var tableName = req.params.tableName;
	if(!tableName){
		res.end(JSON.stringify({"err":"Tablename missing in request!"}));
		return;
	}
	tableName = tableName.replace(/\W/g, '');
	
	res.setHeader('Content-disposition', 'attachment; filename='+tableName+'.csv');
    res.writeHead(200, {
        'Content-Type': 'text/csv'
    });
	tableName = req.user.shortName + "." + tableName + "_stats";
	console.log("Downloading: " + tableName);
	var copyTo = require('pg-copy-streams').to; //doesn't work with native pg
	pg.connect(global.conString,function(err, client, done) {
	  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
	  var stream = client.query(copyTo('COPY '+ tableName+" TO STDOUT DELIMITER ',' CSV HEADER;"));
	  //stream.pipe(process.stdout);
	  stream.pipe(res);
	  stream.on('end', done);
	  stream.on('error', done);
	});
	/*
	var stream = client.copyFrom('COPY '+ tableName+' TO STDOUT DELIMITER ',' CSV HEADER;');

	stream.on('error', function (err) {
	  console.log('pg stream error: ', err);
	});
	r.pipe(stream)
	*/
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