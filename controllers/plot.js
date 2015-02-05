var express = require('express');
var router = express.Router();
var pg = require("pg");


/*
//note: for windows, I had to copy the RGtk2 and cairoDevice folders from C:\Users\steve\Documents\R\win-library\3.1 to C:\Program Files\R\R-3.1.2\library for it to work
CREATE OR REPLACE FUNCTION plot() RETURNS bytea AS $$
library(RGtk2)
library(cairoDevice)
x <- 1:10
y <- 1+x+rnorm(10,0,1)
pixmap <- gdkPixmapNew(w=500, h=500, depth=24)
asCairoDevice(pixmap)

myplot=plot(x,y)
print(myplot)
plot_pixbuf <- gdkPixbufGetFromDrawable(NULL, pixmap,pixmap$getColormap(),0, 0, 0, 0, 500, 500)
buffer <- gdkPixbufSaveToBufferv(plot_pixbuf, "png",character(0),character(0))$buffer
return(buffer)
$$ LANGUAGE plr;

select plot from plot();

*/
router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		res.redirect('/login');
		return; 
	}
	next();
});

router.get('/',function(req,res){
		var sql="select plot from plot()";
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  client.query(sql, function(err, result) {
		    release()
/*
 $hexpic = pg_fetch_array($rs);
 $cleandata = pg_unescape_bytea($hexpic[0]);
 header("Content-Type: image/png");
 header("Last-Modified: " .       date("r", filectime($_SERVER['SCRIPT_FILENAME'])));
 header("Content-Length: " . strlen($cleandata));
*/
				res.header("Content-type", "image/png");
				//console.log(result.rows);
				res.end( result.rows[0]['plot'].slice(22) );
				//res.end(result.rows[0]['plot']);
		    //res.end(result.rows[0]['plot'].toString('hex'));
		  })
		})
});

module.exports = router;