var express = require('express');
var router = express.Router();
var pg = require("pg");


router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		res.redirect('/login');
		return; 
	}
	next();
});

router.get('/:projectName/:tableName',  function(req, res){
	console.log(req.query);
	//return;
	//if(!req.query){
		res.render('correlation', {
			user : req.user,
			projectName:req.params.projectName,
			tableName: req.query.tableName
		});
		return;
	//}
});

router.get('/:projectName/:tableName/query',  function(req, res){
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
	  if(!idName)idName='ogc_fid';
	  else idName=idName.replace(/\W/g, '');

	  if(req.query.field && req.query.name)
		 {
		 		 var vals=null;
		 		 if(req.query.name=='all'){
		 		 		var sql="update " + req.user.shortName + "." + tableName + "_vars set include=" + parseInt(req.query.value);//+",include="+parseInt(req.query.value);
		 		 	}
		 		 else if(req.query.field=='cinclude'){
		 		 		var sql="update " + req.user.shortName + "." + tableName + "_vars set include=$1 where name=$2";//,include=$1
		 		 		vals=[req.query.value,req.query.name];
		 		 }

		 		 console.log(sql + ": " + vals);
				 pg.connect(global.conString,function(err, client, release) {
				  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
				  //strip off extension
				  client.query(sql, vals, function(err, result) {
					  	release();
				  		if(err)console.log(err);
				  		res.end("success");
				  		//res.end(JSON.stringify(result.rows));		
				  });
				});
				return;
		 }
	  
	  
	  //var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('id','ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	  var sql="select name from " + req.user.shortName + "." + tableName + "_vars where include=1 and id=0 order by depvar desc,name asc";

	  console.log(sql);
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  //strip off extension
		  client.query(sql, function(err, result) {
			  if(err)console.log(err);
			  //add the schema to the tablename
			 // release()
			  var names={};
			  tableName = req.user.shortName+"."+ tableName+'_stats';
			  var cols=[];
			  //var out=["name text"];

			  console.log(result.rows);
			  for(var i in result.rows){
				  names[result.rows[i].name]=result.rows[i].cinclude;
				  if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
					  result.rows[i].name='"' + result.rows[i].name + '"';
				  else if(result.rows[i].name.indexOf(" ")!=-1)
					  result.rows[i].name='"' + result.rows[i].name + '"';
				  cols.push(result.rows[i].name);
				  //out.push(result.rows[i].name + " double precision");
				  
			  }
			  //var sql = "select * from public.r_table_cor('" + cols.join(",") + "','" + tableName + "') s("+out.join(",")+")";
			  var sql = "select r_correlation_variables as vars from public.r_correlation_variables('" + cols.join(",") + "','" + tableName + "')";

			  console.log(sql);

			  client.query(sql, function(err, result) {
				  release()
				  res.end('{"names":'+JSON.stringify(names)+',"results":'+result.rows[0].vars+"}");
				  
				  //res.writeHead(200, {"Content-Type": "application/json"});
				  //res.end(JSON.stringify(result.rows));
			  });

		  })
	  })
});
	
module.exports = router;	