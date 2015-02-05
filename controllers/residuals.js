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

router.get('/',  function(req, res){
	console.log(req.query);
	//return;
	//if(!req.query){
		res.render('residuals', {
			user : req.user,
			tableName: req.query.tableName,
			ws: req.query.nosw?1:0
		});
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
	  //var idName = req.query.idName;
	  //if(!idName)idName='ogc_fid';
	  //else idName=idName.replace(/\W/g, '');
	  //var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	  var sql="select name from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";
		var total = req.query.total;
		
	  console.log(sql);
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  //strip off extension
		  client.query(sql, function(err, result) {
		  		if(err)console.log(err);
		  		//add the schema to the tablename
					tableName = req.user.shortName+"."+ tableName+'_stats';
				  var cols=[];
				  //var out=["name text"];
				  console.log(result.rows);
				  for(var i in result.rows){
				  	if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	else if(result.rows[i].name.indexOf(" ")!=-1)
				  		result.rows[i].name='"' + result.rows[i].name + '"';// as '+ result.rows[i].name.replace(/ /g,"_");
				  	cols.push(result.rows[i].name);
				  }
				  //count(*) OVER() AS total,
					var sql="select "+ cols.join(",") + " from " + tableName + "" + " offset " + (req.query.offset?req.query.offset:0) + "  limit " + (req.query.limit?req.query.limit:100);
					console.log(sql);
					client.query(sql, function(err, result) {
						if(err)console.log(err);
					  release();
					  if(!total)total=result.rows.length;
					  res.end(JSON.stringify({total:total,rows:result.rows}));				    
					});
		  });
		});

});

router.get('/:tableName/variables',  function(req, res){
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
	  //var idName = req.query.idName;
	  //if(!idName)idName='ogc_fid';
	  //else idName=idName.replace(/\W/g, '');
	  //var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	  var sql="select name from " + req.user.shortName + "." + tableName + "_vars where cinclude=1 and (include=1 or id=1) order by id desc,depvar desc,name asc";
	  
	  console.log(sql);
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  //strip off extension
		  client.query(sql, function(err, result) {
		  		if(err)console.log(err);
		  		//add the schema to the tablename
					tableName = req.user.shortName+"."+ tableName+'_stats';
				  var cols=[];
				  var depvar;
				  var id=result.rows[0].name;
				  
				  console.log(result.rows);
				  for(var i = 1; i < result.rows.length;i++){
				  	if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	else if(result.rows[i].name.indexOf(" ")!=-1)
				  		result.rows[i].name='"' + result.rows[i].name + '"';// as '+ result.rows[i].name.replace(/ /g,"_");
				  	if(depvar)cols.push(result.rows[i].name);
				  	else depvar=result.rows[i].name
				  }
				  if(req.query.nosw)
				  	var sql = "select r_regression_variables as vals from public.r_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";
				  else
						var sql = "select r_step_regression_variables as vals from public.r_step_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";
					console.log(sql);
					  client.query(sql, function(err, result) {
					  	if(err)console.log(err);
					  	console.log(result.rows);
					  	var vars=JSON.parse(result.rows[0].vals);
					  	var sql="select count(*) as total from " + tableName;
					  	console.log(sql);
					  	client.query(sql, function(err, result) {
						  	if(err)console.log(err);
						    release();
						    res.end(JSON.stringify({id:id,vars:vars,total:parseInt(result.rows[0].total)}));				    
					  	});
					  });
		  });
		});

});

router.get('/download/:tableName',function(req,res){

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

		res.setHeader('Content-disposition', 'attachment; filename='+tableName+'.csv');
  	  res.writeHead(200, {
        'Content-Type': 'text/csv'
    });
	  
	  //var idName = req.query.idName;
	  //if(!idName)idName='ogc_fid';
	  //else idName=idName.replace(/\W/g, '');
	  //var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	  var sql="select name from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";
	  
	  console.log(sql);
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  //strip off extension
		  client.query(sql, function(err, result) {
		  		if(err)console.log(err);
		  		//add the schema to the tablename
					tableName = req.user.shortName+"."+ tableName+'_stats';
				  var cols=[];
				  var depvar = result.rows[1].name;
				  
				  //var out=["name text"];
				  console.log(result.rows);
				  for(var i in result.rows){
				  	if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	else if(result.rows[i].name.indexOf(" ")!=-1)
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	
				  	cols.push(result.rows[i].name);
				  	//out.push(result.rows[i].name + " double precision");
				  }
			
				  //var sql='select '+corr.join(",")+' from '+tableName+"_stats";
				  //var sql = "select replace(column1,'`','') as fieldname,column2 as estimate,column3 as stderr,column4 as tval,column5 as pr from public.r_lm_summary('" + cols.join(",") + "','" + tableName + "')";
				  //var sql = "select * from public.r_table_cor('" + cols.join(",") + "','" + tableName + "') s("+out.join(",")+")";
				  //'id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total as acres_total,"Slope","Elevation","Prod Index","Range Potential","Drought Index","All Crop Prod Index"', 'reaisincva.homesites_stats');
				  
					var sql = "select replace(column1,'`','\"') as name,column2 as coef from public.r_table_stepwise_regression_coefficients('" + cols.join(",") + "','" + tableName + "')";// s("+out.join(",")+")";
					console.log(sql);
				  //pg.connect(global.conString,function(err, client, release) {
					  //if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
					  //strip off extension
					  client.query(sql, function(err, result) {
						  release();
					  	if(err)console.log(err);
					  	console.log(result.rows);
					  	//?offset=0&limit=10&search=test
					  	var select =[];
					  	var fields=[cols[0]];
					  	for(var i in result.rows){
					  		
					  		if(result.rows[i].name==depvar){
					  			select.push( result.rows[i].coef );
					  			fields.push("round("+result.rows[i].name+"::numeric,2) as "+result.rows[i].name)
					  			fields.push("");
					  		}
					  		else {
					  			if(result.rows[i].name.charAt(0).toLowerCase()!=result.rows[i].name.charAt(0))
					  				result.rows[i].name='"' + result.rows[i].name +'"';
					  			select.push( result.rows[i].name+" * " + result.rows[i].coef);					  			
					  			fields.push("round("+result.rows[i].name+"::numeric,2) as "+result.rows[i].name)	
					  		}
					  	}
					  	fields[2]="round((" + select.join("+") + ")::numeric,2) as \"Predicted "+depvar+"\"";
					  	var sql="select "+ fields.join(",") + " from " + tableName;
					  	console.log(sql);
							console.log("Downloading: " + tableName);
							var copyTo = require('pg-copy-streams').to; //doesn't work with native pg
							
							if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
							var stream = client.query(copyTo('COPY ('+ sql +") TO STDOUT DELIMITER ',' CSV HEADER;"));
							  //stream.pipe(process.stdout);
							stream.pipe(res);
							stream.on('end', release);
							stream.on('error', release);

					  	/*
					  	client.query(sql, function(err, result) {
						  	if(err)console.log(err);
						    release();
						    res.end(JSON.stringify(result.rows));				    
					  	});
					  });
					  */

		  });
		});
	});

	/*
	var stream = client.copyFrom('COPY '+ tableName+' TO STDOUT DELIMITER ',' CSV HEADER;');

	stream.on('error', function (err) {
	  console.log('pg stream error: ', err);
	});
	r.pipe(stream)
	*/
});


//select "sale date",acres,quality,-554360.736253571+"sale date" * 14.1150383515906+acres * 515.094173208256+quality * 162.445376332006 as val from reaisincva.r_stats offset=0  limit = 100;

//select priceac,"sale date",acres,quality,round(-554360.736253571+"sale date" * 14.1150383515906+acres * 515.094173208256+quality * 162.445376332006::numeric,2) as val,round(val-priceac::numeric,2) as diff from reaisincva.r_stats offset 0  limit 100

module.exports = router;


/*
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
	  //var idName = req.query.idName;
	  //if(!idName)idName='ogc_fid';
	  //else idName=idName.replace(/\W/g, '');
	  //var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	  var sql="select name from " + req.user.shortName + "." + tableName + "_vars where include=1 order by depvar desc,name asc";
	  
	  console.log(sql);
	  pg.connect(global.conString,function(err, client, release) {
		  if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		  //strip off extension
		  client.query(sql, function(err, result) {
		  		if(err)console.log(err);
		  		//add the schema to the tablename
					tableName = req.user.shortName+"."+ tableName+'_stats';
				  var cols=[];
				  var depvar;
				  
				  //var out=["name text"];
				  console.log(result.rows);
				  for(var i in result.rows){
				  	if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	else if(result.rows[i].name.indexOf(" ")!=-1)
				  		result.rows[i].name='"' + result.rows[i].name + '"';// as '+ result.rows[i].name.replace(/ /g,"_");
				  	if(depvar)cols.push(result.rows[i].name);
				  	else depvar=result.rows[i].name

				  	//cols.push(result.rows[i].name);
				  	//out.push(result.rows[i].name + " double precision");
				  }

				  for(var i in result.rows){
				  	if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	else if(result.rows[i].name.indexOf(" ")!=-1)
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	
				  	cols.push(result.rows[i].name);
				  	//out.push(result.rows[i].name + " double precision");
				  }

			
				  //var sql='select '+corr.join(",")+' from '+tableName+"_stats";
				  //var sql = "select replace(column1,'`','') as fieldname,column2 as estimate,column3 as stderr,column4 as tval,column5 as pr from public.r_lm_summary('" + cols.join(",") + "','" + tableName + "')";
				  //var sql = "select * from public.r_table_cor('" + cols.join(",") + "','" + tableName + "') s("+out.join(",")+")";
				  //'id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total as acres_total,"Slope","Elevation","Prod Index","Range Potential","Drought Index","All Crop Prod Index"', 'reaisincva.homesites_stats');


				  
					//var sql = "select replace(column1,'`','\"') as name,column2 as coef from public.r_table_stepwise_regression_coefficients('" + cols.join(",") + "','" + tableName + "')";// s("+out.join(",")+")";
					var sql = "select * from public.r_step_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "')";// s("+out.join(",")+")";
					console.log(sql);
				  //pg.connect(global.conString,function(err, client, release) {
					  //if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
					  //strip off extension
					  client.query(sql, function(err, result) {
					  	if(err)console.log(err);
					  	console.log(result.rows);
					  	var vars=JSON.parse(result.rows[0].r_step_regression_variables);
					  	//?offset=0&limit=10&search=test
					  	var select =[];
					  	var fields=cols;

					  	var fields=[cols[0]];
					  	for(var i in result.rows){
					  		
					  		if(result.rows[i].name==depvar){
					  			select.push( result.rows[i].coef );
					  			fields.push("round("+result.rows[i].name+"::numeric,2) as "+result.rows[i].name)
					  			fields.push("");
					  			fields.push("");
					  			fields.push("");
					  			fields.push("");
					  			
					  		}
					  		else {
					  			if(result.rows[i].name.charAt(0).toLowerCase()!=result.rows[i].name.charAt(0))
					  				result.rows[i].name='"' + result.rows[i].name +'"';
					  			select.push( result.rows[i].name+" * " + result.rows[i].coef);					  			
					  			fields.push("round("+result.rows[i].name+"::numeric,2) as "+result.rows[i].name)	
					  		}
					  	}
					  	fields[2]="round((" + select.join("+") + ")::numeric,2) as \"Predicted "+depvar+"\"";
					  	fields[3]="round( (" + select.join("+") + ")::numeric,2) as \"Range - Lower"+depvar+"\"";
					  	fields[4]="round((" + select.join("+") + ")::numeric,2) as \"Range - Higher "+depvar+"\"";
					  	fields[5]="round((" + select.join("+") + ")::numeric,2) as \"Sale price within range - "+depvar+"\"";

					  	
					  	//,round((val-"+depvar+")::numeric,2) as diff
					  	var sql="select count(*) OVER() AS total,"+depvar+","+ fields.join(",") + " from " + tableName + "" + " offset " + (req.query.offset?req.query.offset:0) + "  limit " + (req.query.limit?req.query.limit:100);
					  	console.log(sql);
					  	client.query(sql, function(err, result) {
						  	if(err)console.log(err);
						  	//console.log(result.rows);
						    release();
						    //res.writeHead(200, {"Content-Type": "application/json"});
						    res.end(JSON.stringify({vars:vars,total:parseInt(result.rows[0].total),rows:result.rows}));				    
						    //res.writeHead(200, {"Content-Type": "application/json"});
						    //res.end(result.rows[0].r_table_regression_summary);
					  	});
					  });
				  //});		  	
		  });
		});

});
*/