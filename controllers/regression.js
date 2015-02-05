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
		res.render('regression', {
			user : req.user,
			tableName: req.query.tableName
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
	  var idName = req.query.idName;
	  if(!idName)idName='oid';
	  else idName=idName.replace(/\W/g, '');
	  //var sql="select column_name from information_schema.columns where table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"' and column_name not in('ogc_fid','wkb_geometry','shape_leng','shape_area','_acres_total') and data_type in('numeric','double precision','float','integer','decimal')";	  
	  var sql="select name from " + req.user.shortName + "." + tableName + "_vars where include=1 and id=0 order by depvar desc,name asc";
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
					/*				  
				  for(var i in result.rows){
				  	if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
				  		result.rows[i].name='"' + result.rows[i].name + '"';
				  	else if(result.rows[i].name.indexOf(" ")!=-1)
				  		result.rows[i].name='"' + result.rows[i].name + '" as '+ result.rows[i].name.replace(/ /g,"_");
				  	if(depvar)cols.push(result.rows[i].name);
				  	else depvar=result.rows[i].name
				  	//out.push(result.rows[i].name + " double precision");
				  }
				  */
					
				  //var sql='select '+corr.join(",")+' from '+tableName+"_stats";
				  //var sql = "select replace(column1,'`','') as fieldname,column2 as estimate,column3 as stderr,column4 as tval,column5 as pr from public.r_lm_summary('" + cols.join(",") + "','" + tableName + "')";
				  //var sql = "select * from public.r_table_cor('" + cols.join(",") + "','" + tableName + "') s("+out.join(",")+")";
				  //'id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total as acres_total,"Slope","Elevation","Prod Index","Range Potential","Drought Index","All Crop Prod Index"', 'reaisincva.homesites_stats');
				  
					var sql = "select r_regression_variables as vals from public.r_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";
					console.log(sql);
				  //pg.connect(global.conString,function(err, client, release) {
					  //if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
					  //strip off extension
					  client.query(sql, function(err, result) {
					  	if(err)console.log(err);
					  	//console.log(result.rows);
					    release();
					    
					    res.end(result.rows[0].vals);
					  });
				  //});		  	
		  });
		});

});

module.exports = router;