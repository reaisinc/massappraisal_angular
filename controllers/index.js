var express = require('express')
  , session = require('express-session')
  , pg = require("pg")
  , passport = require('passport')
  , pgSession = require('connect-pg-simple')(session)
  , router = express.Router();

//var conString="postgres://postgres:postgres@localhost/soils";

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
//router.use(passport.initialize());
//router.use(passport.session());
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
//app.use(express.session({ secret: 'keyboard cat' }));
/*
router.use(session({
  secret: 'keyboard cat',
  resave: false,
	store: new pgSession({
    pg : pg,
    conString : conString,
    tableName : 'session'
  }),
  saveUninitialized: true
}))
*/


router.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "OPTIONS, HEAD, GET, POST, PUT, DELETE");
  if ('OPTIONS' == req.method) {
     res.sendStatus(200);
  }
  else {
     next();
  }
});

//comparables
router.use('/projects', require('./projects'))



//router.use('/tables', require('./tables'))
router.use('/upload', require('./upload'))
//router.use('/uploadfiles', require('./uploadfiles'))
router.use('/load', require('./load'))
/*
router.use('/summary', require('./summary'))
router.use('/configure', require('./configure'))
router.use('/correlation', require('./correlation'))
router.use('/regression', require('./regression'))
router.use('/stepwise_regression', require('./stepwise_regression'))
router.use('/residuals', require('./residuals'))
router.use('/predict', require('./predict'))
*/
router.use('/map', require('./map'))

//subject
//router.use('/uploadsubfiles', require('./uploadsubfiles'))
//router.use('/loadsubject', require('./loadsubject'))
//router.use('/subject', require('./subject'))

router.use('/user', require('./user'))
router.use('/auth', require('./login'))

//enable when needed
//router.use('/mapcache', require('./mapcache'))
//router.use('/mapserv', require('./mapserv'))

router.head('/', function(req,res){
	res.end("");
});


router.get('/test', function(req,res){
	console.log(global.conString);
	if(req.user){
		res.render('index', {
			user : req.user
		});
		
		//console.log("/"+req.user.shortName);
		//getUserProjects(req,res);
		/*
		res.render('login', {
			user : req.user
		});
		*/
	}
	else{
		//res.redirect('/login');
		//return; 
		
		res.render('home', {
			user : null
		});
		
	}


	//console.log("/");
	// uploader.get(req,res);
    //res.end();
});

router.get('/account', function(req, res) {
	if(!req.user.shortName)
	{
		res.end("No user specified");
		return;
	}
	
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		var sql="SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stat' and table_name not like '%_soils'";
		client.query(sql, function(err, result) {
		    release()
		    //if (err) throw err;
		    //console.log("Count: "+result.rows[0])
			res.render('account', {
				user : req.user
				,files: result.rows
			});
		})
	});
});

router.get('/login', function(req, res) {
	console.log("Login");
	if(req.user){
		res.redirect('/');
	}
	else {
		console.log("Not authenticated")
		res.render('login', {
			user : req.user
		});
	}
	//else getUserFiles(req,res);

});
router.get('/logout', function(req, res) {
	//order below may be important
	res.clearCookie('connect.sid');
	req.session.destroy();
	req.logout();
	res.redirect('/login');
	/*
	res.render('login', {
		user : req.user
	});
	*/

});



// invoked for any requested passed to this router
/*
router.use(function(req, res, next) {
  // .. some logic here .. like any other middleware
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/');
  next();
});
*/


/*
router.get('/', function(req, res) {
	console.log("here");
  res.render('index')
})
*/
/*
function getUserProjects(req,res)
{
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//var sql="SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stats' and table_name not like '%_soils' and table_name not like '%_vars'";
		var sql="select id,name,upper(state) as state,to_char(created_date, 'Month DD, YYYY') as created_date,to_char(modified_date, 'Month DD, YYYY') as modified_date from "+req.user.shortName + ".projects";
		 
		console.log(sql);
		client.query(sql, function(err, result) {
		    release()
		    //if (err) throw err;
		    //console.log("Count: "+result.rows[0])
			res.render('index', {
				user : req.user
				,files: result&&result.rows?result.rows:[]
			});

		})
	});

}

function getUserFiles(req,res)
{

	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//var sql="SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stats' and table_name not like '%_soils' and table_name not like '%_vars'";
		var sql="select id,name,type,comp,case when filetype IS NULL then 'Unknown' else filetype end,to_char(date_loaded, 'Month DD, YYYY') as date  from "+req.user.shortName + ".tables";
		 
		console.log(sql);
		client.query(sql, function(err, result) {
		    release()
		    //if (err) throw err;
		    //console.log("Count: "+result.rows[0])
			res.render('index', {
				user : req.user
				,files: result&&result.rows?result.rows:[]
			});

		})
	});

}
*/
/*
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
	
	//var stream = client.copyFrom('COPY '+ tableName+' TO STDOUT DELIMITER ',' CSV HEADER;');

	//stream.on('error', function (err) {
	//  console.log('pg stream error: ', err);
	//});
	//r.pipe(stream)
	
});
*/
// return router;
/*
router.get('/delete',function(req,res){
	var tableName = req.query.tableName;
	if(!tableName){
		res.end("No tablename specified");
		return;
	}
	if(!req.user.shortName)
	{
		res.end("No user specified");
		return;
	}
	var baseTableName=tableName.replace(/\W/g, '').toLowerCase()
	tableName = req.user.shortName+"." + baseTableName;
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		var sql=["drop table if exists "+tableName,"drop table if exists "+ tableName + "_stats", "drop table if exists "+ tableName + "_soils", "drop table if exists "+ tableName + "_vars","delete from "+req.user.shortName+".tables where name='"+baseTableName+"'"];
		//,"SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stats' and table_name not like '%_soils'"
		console.log(sql);
		client.query(sql.join(";"), function(err, result) {
		    release()
		    res.redirect('/');
		    //if (err) throw err;
		    //console.log("Count: "+result.rows[0])
		    
			//res.render('index', {
			//	user : req.user
			//	,files: result?result.rows:[]
			//});

		})
	});

});
*/
module.exports = router



//var uploader = require('./uploadManager')(router);

