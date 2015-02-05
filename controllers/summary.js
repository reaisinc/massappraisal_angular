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


router.get('/:tableID',  function(req, res){
	console.log(req.params.tableID);
	//return;
	//res.writeHead(200, {"Content-Type": "application/json"});
	res.setTimeout(0); 

	var tableID = parseInt(req.params.tableID);

	//var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('id','ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	var sql="select geometrytype,name from "+req.user.shortName+".tables where id="+tableID;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//strip off extension
		client.query(sql, function(err, result) {
			//add the schema to the tablename
			//console.log(result);
			var tableName = result.rows[0].name;
			var sql="select include,id,depvar,name from " + req.user.shortName + "." + tableName + "_vars where include<5 order by id desc,depvar desc,name asc";
			client.query(sql, function(err, result) {
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var geomtype="";
				var names={};
				//console.log(result.rows);
				for(var i in result.rows){
					if(result.rows[i].geometrytype)
						geomtype=result.rows[i].geometrytype;
					else{
						names[result.rows[i].name]=[result.rows[i].include,result.rows[i].id,result.rows[i].depvar];
						if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
							result.rows[i].name='"' + result.rows[i].name + '"';
						else if(result.rows[i].name.indexOf(" ")!=-1)
							result.rows[i].name='"' + result.rows[i].name + '"';
						cols.push(result.rows[i].name);
					}
				}
				var sql = "select name,vars,n,mean,sd,median,trimmed,mad,min,max,range,se from public.r_table_summary('" + cols.join(",") + "','" + tableName + "')";
				console.log(sql);
				client.query(sql, function(err, result) {
					release()
					if (err) {
						res.json({'err':err.toString()});
					}
					//var obj=result.rows;
					else if(result){
						res.json({"names":names,"geomtype":geomtype,"rows":result.rows});
					}
				});
			});
		})
	})

});


router.get('/:projectName/:tableName',  function(req, res){
	console.log(req.query);
	//return;
	//if(!req.query){
	res.render('summary', {
		user : req.user,
		projectName: req.params.projectName,
		tableName: req.params.tableName
	});
	return;
	//}
});

router.get('/:projectName/:tableName/update',  function(req, res){
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

	if(req.query.field && req.query.name)
	{
		var vals=null;
		if(req.query.name=='all'){
			var sql="update " + req.user.shortName + "." + tableName + "_vars set include=" + parseInt(req.query.value)+",cinclude="+parseInt(req.query.value);
		}
		else if(req.query.field=='include'){
			var sql="update " + req.user.shortName + "." + tableName + "_vars set include=$1,cinclude=$1 where name=$2";
			vals=[req.query.value,req.query.name];
		}
		else if(req.query.field=='depvar'){ //can't be numeric
			//var sql="update " + req.user.shortName + "." + tableName + " set include=$1 where name=$2";
			var sql="update " + req.user.shortName + "." + tableName + "_vars set depvar=case when name=$1 then 1 else 0 end where depvar!=2";
			vals=[req.query.name];
		}
		else {
			var sql="update " + req.user.shortName + "." + tableName + "_vars set id=case when name=$1 then 1 else 0 end";
			vals=[req.query.name];
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
	}
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
	var projectName = req.params.projectName.replace(/\W/g, '');
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
	var sql="select geometrytype from "+req.user.shortName+".tables where project='"+projectName+"' and name='"+tableName+"';select include,id,depvar,name from " + req.user.shortName + "." + tableName + "_vars where include<5 order by id desc,depvar desc,name asc";
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//strip off extension
		client.query(sql, function(err, result) {
			//add the schema to the tablename
			//console.log(result);
			tableName = req.user.shortName+"."+ tableName+'_stats';
			var cols=[];
			var geomtype="";
			var names={};
			//console.log(result.rows);
			for(var i in result.rows){
				if(result.rows[i].geometrytype)
					geomtype=result.rows[i].geometrytype;
				else{
					names[result.rows[i].name]=[result.rows[i].include,result.rows[i].id,result.rows[i].depvar];
					if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
						result.rows[i].name='"' + result.rows[i].name + '"';
					else if(result.rows[i].name.indexOf(" ")!=-1)
						result.rows[i].name='"' + result.rows[i].name + '"';
					cols.push(result.rows[i].name);
				}
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
					res.end(JSON.stringify({"names":names,"geomtype":geomtype,"rows":result.rows}));
				}
			});
		})
	})

});
router.get('/:projectName/:tableName/download',function(req,res){
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

module.exports = router;