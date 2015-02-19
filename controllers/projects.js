var express = require('express');
var router = express.Router();
var pg = require("pg");

router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		
		//res.redirect('/login');
		res.status(404).json({err:"Not logged in"})
		return; 
	}
	next();
});
//read list of projects
router.get('/',  function(req, res){
	getUserProjects(req,res);
});

//create project
router.put('/',  function(req, res){
	createProject(req,res);
});

//update
router.post('/:pid',  function(req, res){
	updateProject(req,res);
});

//read list of tables from a project
router.get('/:pid/tables',  function(req, res){
	getUserFiles(req,res);
});

//delete project
router.delete('/:pid',  function(req, res){
	deleteProject(req,res);	
});

//get table
router.get('/:pid/tables/:tid',  function(req, res){
	getTable(req,res);	
});

//delete table
router.delete('/:pid/tables/:tid',  function(req, res){
	deleteTable(req,res);	
});

//show map
router.get('/:pid/tables/:tid/map',  function(req, res){
	showMap(req,res);	
});

//download table
router.get('/:pid/tables/:tid/download',  function(req, res){
	downloadTable(req,res);
});

//table summary
router.get('/:pid/tables/:tid/summary',  function(req, res){
	tableSummary(req,res);	
});
//table summary update
router.put('/:pid/tables/:tid/summary',  function(req, res){
	updateTableSummary(req,res);	
});

//table correlation
router.get('/:pid/tables/:tid/correlation',  function(req, res){
	tableCorrelation(req,res);	
});
//table correlation update
router.put('/:pid/tables/:tid/correlation',  function(req, res){
	updateTableSummary(req,res);	
});
//table regression
router.get('/:pid/tables/:tid/regression',  function(req, res){
	tableRegression(req,res);	
});
//table stepwise regression
router.get('/:pid/tables/:tid/stepwise_regression',  function(req, res){
	tableSWRegression(req,res);	
});
//table residuals
router.get('/:pid/tables/:tid/residuals',  function(req, res){
	tableResiduals(req,res);	
});
//table predictions
router.get('/:pid/tables/:tid/predictions',  function(req, res){
	tablePredictions(req,res);	
});
//subject info
router.get('/:pid/tables/:tid/subject',  function(req, res){
	tableSubject(req,res);	
});
//subject tables
router.get('/:pid/tables/:tid/subject/tables',  function(req, res){
	getSubjectTables(req,res);	
});

//subject table info
router.get('/:pid/tables/:tid/subject/:sid',  function(req, res){
	listSubject(req,res);	
});
//subject delete
router.delete('/:pid/tables/:tid/subject/:sid',  function(req, res){
	deleteSubject(req,res);	
});
//subject table report single
router.get('/:pid/tables/:tid/reports/:sid',  function(req, res){
	reportSubject(req,res);	
});
router.get('/:pid/tables/:tid/reports/:sid/row/:id',  function(req, res){
	reportSubject(req,res);	
});

//subject table reports - mass appraisal
router.get('/:pid/tables/:tid/reports/:sid/table',  function(req, res){
	tableReports(req,res);	
});



//delete project (alt - not used)
router.get('/:pid/delete',  function(req, res){
	deleteProject(req,res);
});

function createProject(req,res)
{
	if(!req.body.name){
		res.json({err:"No project name specified"})
		return;
	}

	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.status(404).json({"err":"No connection to database;"});throw err;}
		// var sql="SELECT table_name FROM information_schema.tables WHERE
		// table_schema = '"+req.user.shortName+"' and table_name not like
		// '%_stats' and table_name not like '%_soils' and table_name not like
		// '%_vars'";
		
		var sql="insert into "+req.user.shortName+".projects(name,state,created_date,modified_date) values($1,'',NOW(),NOW()) returning id";
		var vals=[req.body.name];//,req.body.state
		console.log(sql);console.log(vals);
		client.query(sql, vals, function(err, result) {
			release();
			if(err||!result)res.status(403).send('Project name already exists');
			else {
				res.json({"id":result.rows[0].id})
				// getUserFiles(req,res,result.rows[0].id);
			}
		})
	});
}

function getUserFiles(req,res)
{
	// res.writeHead(200, {"Content-Type": "application/json"});
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		var field="project";
		var id=parseInt(req.params.pid);
		// var vals=[req.params.id,req.params.id];

		// var sql="SELECT table_name FROM information_schema.tables WHERE
		// table_schema = '"+req.user.shortName+"' and table_name not like
		// '%_stats' and table_name not like '%_soils' and table_name not like
		// '%_vars'";
		var sql="select name from "+req.user.shortName + ".projects where id="+id+";select id,alias,type,tid,numtuples,case when filetype IS NULL then 'Unknown' else filetype end,to_char(date_loaded, 'Month DD, YYYY') as date  from "+req.user.shortName + ".tables where pid="+id + " order by type";

		console.log(sql);
		// console.log(vals);
		client.query(sql, function(err, result) {
			release()
			if(err){console.log(err);res.json({err:err.toString()});throw err;}
			// console.log(result);
			var name=result.rows[0].name;
			result.rows.splice(0,1);
			var comps=[];
			var subj=[];
			var compid={};
			for(var i in result.rows){
				if(result.rows[i].type==0){
					compid[result.rows[i].id]=result.rows[i].alias;
					comps.push(result.rows[i]);
				}
				else {
					if(result.rows[i].tid)
					result.rows[i]['comp']=compid[result.rows[i].tid]
					subj.push(result.rows[i]);
				}
			}
				
			// res.send(JSON.stringify({user:req.user.displayName,project:req.params.projectName,rows:result.rows?result.rows:[]}))
			res.json({id:id,name:name,comps:comps,subjects:subj});

			// if (err) throw err;
			// console.log("Count: "+result.rows[0])
			/*
			 * res.render('project', { user : req.user
			 * ,project:req.params.projectName ,files:
			 * result&&result.rows?result.rows:[] });
			 */

		})
	});
}

function updateProject(req,res){
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// var sql="SELECT table_name FROM information_schema.tables WHERE
		// table_schema = '"+req.user.shortName+"' and table_name not like
		// '%_stats' and table_name not like '%_soils' and table_name not like
		// '%_vars'";
		var sql="delete from from "+req.user.shortName + ".tables where project=$1;delete from "+req.user.shortName+".projects where name=$1";

		console.log(sql);
		client.query(sql, vars,function(err, result) {
			release()
			getUserFiles(req,res);
		})
	});

}

function deleteProject(req,res){
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		var id=parseInt(req.params.pid);
		// var sql="SELECT table_name FROM information_schema.tables WHERE
		// table_schema = '"+req.user.shortName+"' and table_name not like
		// '%_stats' and table_name not like '%_soils' and table_name not like
		// '%_vars'";
		var sql="select name,id,geometrytype from "+req.user.shortName+".tables where pid="+id;
		console.log(sql);
		client.query(sql, function(err, result) {
			if (err){ res.json({"err":"Unable to get list of layers for this project;"});throw err;}
			if(result.rows.length==0){
				release();
				res.json({"status":"true"});
				return;
			}
			var tableName=result.rows[0].name+result.rows[0].id;
			var geomtype=result.rows[0].geometrytype;
			var sql=["delete from "+req.user.shortName + ".tables where pid="+id,"drop table if exists "+ tableName + "_soils", "drop table if exists "+ tableName + "_vars"];
			if(geomtype=='None')sql.push("drop view if exists "+ tableName + "_stats");else sql.push("drop table if exists "+ tableName + "_stats");
			sql.push("drop table if exists "+tableName);//drop last since there might be a dependency on _stats if non-spatial
			console.log(sql);
			client.query(sql.join(";"), function(err, result) {
				if (err){ res.json({"err":"Unable to get delete layers for this project;"});throw err;}
				var sql="delete from "+req.user.shortName + ".projects where id="+id;
				console.log(sql);
				client.query(sql, function(err, result) {
					release()
					if(err)res.json({"status":"false"})
					else res.json({"status":"true"})
				});
			});
		})
	});
}

function deleteTable(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);

	// var sql="select column_name from information_schema.columns where
	// table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"'
	// and column_name not
	// in('id','ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total')
	// and data_type in('numeric','double
	// precision','float','integer','decimal')";
	var sql="select name,geometrytype from "+req.user.shortName+".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			// add the schema to the tablename
			// console.log(result);
			var tableName = result.rows[0].name+tid;
			var geomtype=result.rows[0].geometrytype;
			var baseTableName=tableName;
			tableName = req.user.shortName+"." + baseTableName;
			var sql=["drop table if exists "+ tableName + "_soils", "drop table if exists "+ tableName + "_vars","delete from "+req.user.shortName+".tables where pid="+pid+" and id="+tid];
			if(geomtype=='None')sql.push("drop view if exists "+ tableName + "_stats");else sql.push("drop table if exists "+ tableName + "_stats");
			sql.push("drop table if exists "+tableName);//drop last since there might be a dependency on _stats if non-spatial
			console.log(sql);
			client.query(sql.join(";"), function(err, result) {
				if (err){ res.json({"err":"Unable to delete table;"});throw err;}
				release()
				res.json({msg:"success"})
			})
		});
	});
}

function getUserProjects(req,res)
{
	// res.writeHead(200, {"Content-Type": "application/json"});
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		var sql="select id,name,upper(state) as state,to_char(created_date, 'Month DD, YYYY') as created_date,to_char(modified_date, 'Month DD, YYYY') as modified_date from "+req.user.shortName + ".projects";
		console.log(sql);
		client.query(sql, function(err, result) {
			release()
			// res.send(JSON.stringify({user:req.user.displayName,rows:result.rows?result.rows:[]}));
			res.json({user:req.user.displayName,rows:result&&result.rows?result.rows:[]});
		})
	});
}

function tableSummary(req, res){
	console.log(req.params.pid);
	// return;
	// res.writeHead(200, {"Content-Type": "application/json"});
	res.setTimeout(0); 
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);

	// var sql="select column_name from information_schema.columns where
	// table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"'
	// and column_name not
	// in('id','ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total')
	// and data_type in('numeric','double
	// precision','float','integer','decimal')";
	var sql="select geometrytype,name,alias from "+req.user.shortName+".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			// add the schema to the tablename
			// console.log(result);
			var tableName = result.rows[0].name+tid;
			var geomtype = result.rows[0].geometrytype;
			var alias=result.rows[0].alias;
			var sql="select include,id,depvar,saledate,soils,uniqueid,name,type from " + req.user.shortName + "." + tableName + "_vars where include<5 order by id desc,uniqueid desc,depvar desc,soils asc,name asc";
			console.log(sql);
			client.query(sql, function(err, result) {
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var names={};
				// console.log(result.rows);
				for(var i in result.rows){
					// names[result.rows[i].name]={"include":result.rows[i].include?'true':'false',"id":result.rows[i].id?'true':'false',"depvar":result.rows[i].depvar?'true':'false'};
					names[result.rows[i].name]={"include":result.rows[i].include,"id":result.rows[i].id,"depvar":result.rows[i].depvar,"uniqueid":result.rows[i].uniqueid,"saledate":result.rows[i].saledate,"soils":result.rows[i].soils,"type":result.rows[i].type};
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
						res.json({'err':err.toString()});
					}
					// var obj=result.rows;
					else if(result){
						var results=[];
						/*
						for(var i in result.rows){
							for(var j in result.rows[i]){
								names[ result.rows[i].name ][ j ]=result.rows[i][j];
							}
						}
						 */
						results=result.rows;
						res.json({"alias":alias,"fields":results,status:names,"geomtype":geomtype});
					}
				});
			});
		})
	})
}

function updateTableSummary(req,res)
{
	if(req.body.field && req.body.name)
	{
		var pid = parseInt(req.params.pid);
		var tid = parseInt(req.params.tid);
		var sql="select name from "+req.user.shortName + ".tables where id="+tid;
		console.log(sql);
		pg.connect(global.conString,function(err, client, release) {
			if (err){ res.status(404).json({"err":"No connection to database;"});throw err;}
			client.query(sql, function(err, result) {
				if (err){ res.json({"err":"Query error;"});throw err;}
				var tableName = result.rows[0].name+tid;
				var vals=null;
				if(req.body.name=='all'){
					var sql="update " + req.user.shortName + "." + tableName + "_vars set include=" + parseInt(req.body.value);
				}
				else if(req.body.field=='include'){
					var sql="update " + req.user.shortName + "." + tableName + "_vars set include=$1 where name=$2";
					vals=[req.body.value,req.body.name];
				}
				else if(req.body.field=='depvar'){ //can't be numeric
					//var sql="update " + req.user.shortName + "." + tableName + " set include=$1 where name=$2";
					var sql="update " + req.user.shortName + "." + tableName + "_vars set depvar=case when name=$1 then 1 else 0 end where depvar!=2";
					vals=[req.body.name];
				}
				else if(req.body.field=='saledate'){ //can't be numeric
					//var sql="update " + req.user.shortName + "." + tableName + " set include=$1 where name=$2";
					var sql="update " + req.user.shortName + "." + tableName + "_vars set saledate=case when name=$1 then 1 else 0 end";
					vals=[req.body.name];
				}

				else {
					var sql="update " + req.user.shortName + "." + tableName + "_vars set id=case when name=$1 then 1 else 0 end";
					vals=[req.body.name];
				}
				console.log(sql + ": " + vals);
				//strip off extension
				client.query(sql, vals, function(err, result) {
					release();
					if(err)console.log(err);
					res.end("success");
					//res.end(JSON.stringify(result.rows));		
				});
			});
		});
	}	
}
function tableCorrelation(req, res){
	console.log(req.params.pid);
	// return;
	// res.writeHead(200, {"Content-Type": "application/json"});
	res.setTimeout(0); 
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sql="select name,alias from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			var tableName = result.rows[0].name+tid;
			var alias=result.rows[0].alias;
			
			var sql="select name,include from " + req.user.shortName + "." + tableName + "_vars where include=1 and id=0 order by depvar desc,name asc";
			console.log(sql);
			if (err){ res.json({"err":"No connection to database;"});throw err;}
			// strip off extension
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				// add the schema to the tablename
				// release()
				var names=[];
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				// var out=["name text"];
				// console.log(result.rows);
				for(var i in result.rows){
					if(!depvar)depvar=result.rows[i].name;
					//names[result.rows[i].name]=result.rows[i].include;
					names.push({name:result.rows[i].name,include:result.rows[i].include,vif:0})
					if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
						result.rows[i].name='"' + result.rows[i].name + '"';
					else if(result.rows[i].name.indexOf(" ")!=-1)
						result.rows[i].name='"' + result.rows[i].name + '"';
					cols.push(result.rows[i].name);
					// out.push(result.rows[i].name + " double precision");

				}

				// var sql = "select * from public.r_table_cor('" +
				// cols.join(",") + "','" + tableName + "')
				// s("+out.join(",")+")";
				var sql = "select r_correlation_variables as vars from public.r_correlation_variables('" + cols.join(",") + "','" + tableName + "')";
				console.log(sql);
				client.query(sql, function(err, result) {
					release()
					
					//res.writeHead(200, {"Content-Type": "application/json"});
					res.end('{"alias":"'+alias+'","depvar":"'+depvar+'","names":'+JSON.stringify(names)+',"results":'+result.rows[0].vars+"}");
					// res.json({"names":names,"results":result.rows[0].vars});
					// res.writeHead(200, {"Content-Type": "application/json"});
					// res.end(JSON.stringify(result.rows));
				});
			})
		})
	})	
};

//table regression
function tableRegression(req, res){
	console.log(req.params.pid);
	// return;
	// res.writeHead(200, {"Content-Type": "application/json"});
	res.setTimeout(0); 
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sql="select name,alias from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			var tableName = result.rows[0].name+tid;
			var alias=result.rows[0].alias;
			var sql="select name from " + req.user.shortName + "." + tableName + "_vars where include=1 and id=0 order by depvar desc,name asc";
			console.log(sql);
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				// add the schema to the tablename
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				// var out=["name text"];
				console.log(result.rows);
				for(var i in result.rows){
					if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
						result.rows[i].name='"' + result.rows[i].name + '"';
					else if(result.rows[i].name.indexOf(" ")!=-1)
						result.rows[i].name='"' + result.rows[i].name + '"';// as
					// '+
					// result.rows[i].name.replace(/
					// /g,"_");
					if(depvar)cols.push(result.rows[i].name);
					else depvar=result.rows[i].name

					// cols.push(result.rows[i].name);
					// out.push(result.rows[i].name + " double precision");
				}
				/*
				 * for(var i in result.rows){ if(result.rows[i].name.charAt(0) ==
				 * result.rows[i].name.charAt(0).toUpperCase())
				 * result.rows[i].name='"' + result.rows[i].name + '"'; else
				 * if(result.rows[i].name.indexOf(" ")!=-1)
				 * result.rows[i].name='"' + result.rows[i].name + '" as '+
				 * result.rows[i].name.replace(/ /g,"_");
				 * if(depvar)cols.push(result.rows[i].name); else
				 * depvar=result.rows[i].name //out.push(result.rows[i].name + "
				 * double precision"); }
				 */

				// var sql='select '+corr.join(",")+' from '+tableName+"_stats";
				// var sql = "select replace(column1,'`','') as
				// fieldname,column2 as estimate,column3 as stderr,column4 as
				// tval,column5 as pr from public.r_lm_summary('" +
				// cols.join(",") + "','" + tableName + "')";
				// var sql = "select * from public.r_table_cor('" +
				// cols.join(",") + "','" + tableName + "')
				// s("+out.join(",")+")";
				// 'id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total
				// as acres_total,"Slope","Elevation","Prod Index","Range
				// Potential","Drought Index","All Crop Prod Index"',
				// 'reaisincva.homesites_stats');

				var sql = "select r_regression_variables as vals from public.r_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";
				console.log(sql);
				// pg.connect(global.conString,function(err, client, release) {
				// if (err){ res.end(JSON.stringify({"err":"No connection to
				// database;"}));throw err;}
				// strip off extension
				client.query(sql, function(err, result) {
					if(err)console.log(err);
					// console.log(result.rows);
					release();

					res.end('{"alias":"'+alias+'","vals":'+result.rows[0].vals+'}');
				});
			});		  	
		});	
	});
};

//table stepwise regression
function tableSWRegression(req, res){
	console.log(req.params.pid);
	// return;
	// res.writeHead(200, {"Content-Type": "application/json"});
	res.setTimeout(0); 
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sql="select name,alias from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			var tableName = result.rows[0].name+tid;
			var alias=result.rows[0].alias;
			var sql="select name from " + req.user.shortName + "." + tableName + "_vars where include=1 and id=0 order by depvar desc,name asc";
			console.log(sql);
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				// add the schema and extension to the tablename
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				// var out=["name text"];
				console.log(result.rows);

				for(var i in result.rows){
					if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
						result.rows[i].name='"' + result.rows[i].name + '"';
					else if(result.rows[i].name.indexOf(" ")!=-1)
						result.rows[i].name='"' + result.rows[i].name + '"';// as
					// '+
					// result.rows[i].name.replace(/
					// /g,"_");
					if(depvar)cols.push(result.rows[i].name);
					else depvar=result.rows[i].name

					// cols.push(result.rows[i].name);
					// out.push(result.rows[i].name + " double precision");
				}

				// var sql='select '+corr.join(",")+' from '+tableName+"_stats";
				// var sql = "select replace(column1,'`','') as
				// fieldname,column2 as estimate,column3 as stderr,column4 as
				// tval,column5 as pr from public.r_lm_summary('" +
				// cols.join(",") + "','" + tableName + "')";
				// var sql = "select * from public.r_table_cor('" +
				// cols.join(",") + "','" + tableName + "')
				// s("+out.join(",")+")";
				// 'id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total
				// as acres_total,"Slope","Elevation","Prod Index","Range
				// Potential","Drought Index","All Crop Prod Index"',
				// 'reaisincva.homesites_stats');

				var sql = "select r_step_regression_variables as vals from public.r_step_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";
				console.log(sql);
				// pg.connect(global.conString,function(err, client, release) {
				// if (err){ res.end(JSON.stringify({"err":"No connection to
				// database;"}));throw err;}
				// strip off extension
				client.query(sql, function(err, result) {
					if(err)console.log(err);
					// console.log(result.rows);
					release();
					res.end('{"alias":"'+alias+'","vals":'+result.rows[0].vals+'}');
					//res.end(result.rows[0].vals);
				});
			});		  	
		});
	});	
};

function tableResiduals(req,res){

	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sql="select name,alias from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			var tableName = result.rows[0].name+tid;
			var alias=result.rows[0].alias;
			var sql="select name,type from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";

			//strip off extension
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				//add the schema to the tablename
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				var id=result.rows[0].name;
				var names={};
				names[result.rows[0].name]=result.rows[0].type;

				console.log(result.rows);
				for(var i = 1; i < result.rows.length;i++){
					names[result.rows[i].name]=result.rows[i].type;
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
						res.json({alias:alias,id:id,names:names,vars:vars,total:parseInt(result.rows[0].total)});				    
					});
				});
			});
		});
	});
}
function tablePredictions(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sql="select name,alias from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		client.query(sql, function(err, result) {
			if (err){ res.json({"err":"Unable to find table;"});throw err;}
			var tableName = result.rows[0].name+tid;
			var alias=result.rows[0].alias;
			var sql="select name,type from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";
			console.log(sql);
			//strip off extension
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				//add the schema to the tablename
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				var id=result.rows[0].name;
				var fields={};
				//var out=["name text"];
				for(var i = 1; i < result.rows.length;i++){
					fields[result.rows[i].name]=result.rows[i].type;
					if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
						result.rows[i].name='"' + result.rows[i].name + '"';
					else if(result.rows[i].name.indexOf(" ")!=-1)
						result.rows[i].name='"' + result.rows[i].name + '"';// as '+ result.rows[i].name.replace(/ /g,"_");
					if(depvar){
						cols.push(result.rows[i].name);
					}
					else{
						depvar=result.rows[i].name
					}
				}

				//var sql='select '+corr.join(",")+' from '+tableName+"_stats";
				//var sql = "select replace(column1,'`','') as fieldname,column2 as estimate,column3 as stderr,column4 as tval,column5 as pr from public.r_lm_summary('" + cols.join(",") + "','" + tableName + "')";
				//var sql = "select * from public.r_table_cor('" + cols.join(",") + "','" + tableName + "') s("+out.join(",")+")";
				//'id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total as acres_total,"Slope","Elevation","Prod Index","Range Potential","Drought Index","All Crop Prod Index"', 'reaisincva.homesites_stats');
				if(req.query.nosw)
					var sql = "select r_regression_variables as vals from public.r_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";
				else
					var sql = "select r_step_regression_variables as vals from public.r_step_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";

				//var sql = "select * from public.r_table_stepwise_regression_variables('" + cols.join(",") + "','" + tableName + "')";// s("+out.join(",")+")";
				console.log(sql);
				//pg.connect(global.conString,function(err, client, release) {
				//if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
				//strip off extension
				client.query(sql, function(err, result) {
					if(err)console.log(err);
					console.log(result.rows);
					release();
					//var vars=JSON.parse(result.rows[0].vals);
					res.end('{"alias":"'+alias+'","fields":' + JSON.stringify(fields) + ',"vars":'+result.rows[0].vals+'}');
					
					//res.end(JSON.stringify({id:id,vars:vars}));
				});
				//});		  	
			});	

		});
	});
}
/*
 * Get subject data metadata for this comparable  
 * 
*/
function tableSubject(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	//var sid = parseInt(req.params.sid);
	var sql="select name,alias,numtuples,geometrytype from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			var tableName = result.rows[0].name+tid;
			var alias=result.rows[0].alias;
			var geometrytype=result.rows[0].geometrytype;
			var sql="select name,type,saledate from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";
			
			console.log(sql);
			//strip off extension
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				//add the schema to the tablename
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				var id=result.rows[0].name;
				var names={};
				names[result.rows[0].name]=result.rows[0].type;
				var saledate="";

				console.log(result.rows);
				for(var i = 1; i < result.rows.length;i++){
					if(result.rows[i].saledate==1)saledate=result.rows[i].name;
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
					var fields=[];
					for(var i=1;i<vars.names.length;i++)
						if(vars.names[i]!=saledate)
							fields.push(vars.names[i]);
					
					var sql="select id,name,type,numtuples,case when filetype IS NULL then 'Unknown' else filetype end,to_char(date_loaded, 'Month DD, YYYY') as date  from "+req.user.shortName + ".tables where type=1 and pid="+pid+" and tid="+tid;
					//var sql="select count(*) as total from " + tableName;
					console.log(sql);
					client.query(sql, function(err, result) {
						if(err)console.log(err);
						release();
						res.json({alias:alias,geometrytype:geometrytype,fields:fields.join(", "),id:id,names:names,vars:vars,pid:pid,tid:tid,rows:result&&result.rows?result.rows:[]});				    
					});
				});
			});
		});
	});
}



/*
function tableSubject(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	//var sid = parseInt(req.params.sid);
	var sql="select name,alias,numtuples,geometrytype from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			var tableName = result.rows[0].name+tid;
			var alias=result.rows[0].alias;
			var geometrytype=result.rows[0].geometrytype;
			var sql="select name,type from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";
			
			console.log(sql);
			//strip off extension
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				//add the schema to the tablename
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				var id=result.rows[0].name;
				var names={};
				names[result.rows[0].name]=result.rows[0].type;
				var fields={};
				console.log(result.rows);
				for(var i = 1; i < result.rows.length;i++){
					fields[result.rows[i].name]=result.rows[i].type;
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
				for(var i in fields)fields[i]=fields[i].replace(/\"/g,"");

				client.query(sql, function(err, result) {
					if(err)console.log(err);
					console.log(result.rows);
					var vars=JSON.parse(result.rows[0].vals);
					var sql="select id,name,type,numtuples,case when filetype IS NULL then 'Unknown' else filetype end,to_char(date_loaded, 'Month DD, YYYY') as date  from "+req.user.shortName + ".tables where type=1 and pid="+pid+" and tid="+tid;
					//var sql="select count(*) as total from " + tableName;
					console.log(sql);
					client.query(sql, function(err, result) {
						if(err)console.log(err);
						release();
						res.json({alias:alias,geometrytype:geometrytype,fields:fields,id:id,names:names,vars:vars,pid:pid,tid:tid,rows:result&&result.rows?result.rows:[]});				    
					});
				});
			});
		});
	});
}
*/
/*
 * Get list of all subject data tables for this comparable  
 * 
*/
/*
function getSubjectTables(req,res){
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		var field="project";
		var pid=parseInt(req.params.pid);
		var tid=parseInt(req.params.tid);
		var sql="select id,name,type,numtuples,case when filetype IS NULL then 'Unknown' else filetype end,to_char(date_loaded, 'Month DD, YYYY') as date  from "+req.user.shortName + ".tables where type=1 and pid="+pid+" and tid="+tid;

		console.log(sql);
		client.query(sql, function(err, result) {
			release()
			if(err){console.log(err);res.json({err:err.toString()});throw err;}
			res.json({pid:pid,tid:tid,rows:result&&result.rows?result.rows:[]});
		})
	});
	
}
*/
/*
 * Print multiple rows in subject file  
 * 
*/
function tableReports(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sid = parseInt(req.params.sid);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		//var sql="select id,name,type,numtuples,case when filetype IS NULL then 'Unknown' else filetype end,to_char(date_loaded, 'Month DD, YYYY') as date  from "+req.user.shortName + ".tables where type=1 and pid="+pid+" and tid="+tid;
		var sql=["select name,geometrytype,type,alias from "+req.user.shortName + ".tables where id=" + sid,"select alias from "+req.user.shortName + ".tables where id=" + tid];
		console.log(sql);
		client.query(sql.join(";"), function(err, result) {
			if(err){console.log(err);res.json({err:err.toString()});throw err;}
			var tableName = result.rows[0].name+sid;
			var alias = result.rows[0].alias;
			var alias = result.rows[1].alias;
			var sql="select name,type from " + req.user.shortName + "." + tableName + "_vars where include>0 and depvar!=1 order by id desc,name asc";
			console.log(sql);
			client.query(sql, function(err, result) {
				var fields=[];
				//for(var i in result.rows)fields.push(result.rows[i].name);
				for(var i = 0; i < result.rows.length;i++){

					if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
						result.rows[i].name='"' + result.rows[i].name + '"';
					else if(result.rows[i].name.indexOf(" ")!=-1)
						result.rows[i].name='"' + result.rows[i].name + '"';// as '+ result.rows[i].name.replace(/ /g,"_");
					fields.push(result.rows[i].name);
				}

				var sql="select " + fields.join(",") + " from " + req.user.shortName + "." + tableName + "_stats";
				for(var i in fields)fields[i]=fields[i].replace(/\"/g,"");
				console.log(sql);
				client.query(sql, function(err, result) {
					release()
					if(err){console.log(err);res.json({err:err.toString()});throw err;}
					res.json({pid:pid,tid:tid,sid:sid,fields:fields,alias:alias,rows:result&&result.rows?result.rows:[]});
				});
			})
		})
	});
}

/*
 * Create report for single subject  
 * 
*/

function reportSubject(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sid = parseInt(req.params.sid);
	var oid = req.params.id?parseInt(req.params.id):null;
	var sql=["select name,alias,geometrytype from "+req.user.shortName + ".tables where id="+sid,"select name,alias from "+req.user.shortName + ".tables where id="+tid];
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		client.query(sql.join(";"), function(err, result) {
			if (err){ res.json({"err":"Unable to find table;"});throw err;}
			var tableName = result.rows[1].name+tid;
			var subtableName = result.rows[0].name+sid;
			var geometrytype=result.rows[0].geometrytype;
			var alias=result.rows[0].alias;
			var alias=result.rows[1].alias;
			var sql="select name,saledate from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";
			console.log(sql);
			//strip off extension
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				//add the schema to the tablename
				tableName = req.user.shortName+"."+ tableName+'_stats';
				var cols=[];
				var depvar;
				var id=result.rows[0].name;
				var saledate='';

				//var out=["name text"];
				for(var i = 1; i < result.rows.length;i++){
					if(result.rows[i].saledate==1)saledate=result.rows[i].name;
					if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
						result.rows[i].name='"' + result.rows[i].name + '"';
					else if(result.rows[i].name.indexOf(" ")!=-1)
						result.rows[i].name='"' + result.rows[i].name + '"';// as '+ result.rows[i].name.replace(/ /g,"_");
					if(depvar)cols.push(result.rows[i].name);
					else depvar=result.rows[i].name
				}

				//var sql='select '+corr.join(",")+' from '+tableName+"_stats";
				//var sql = "select replace(column1,'`','') as fieldname,column2 as estimate,column3 as stderr,column4 as tval,column5 as pr from public.r_lm_summary('" + cols.join(",") + "','" + tableName + "')";
				//var sql = "select * from public.r_table_cor('" + cols.join(",") + "','" + tableName + "') s("+out.join(",")+")";
				//'id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total as acres_total,"Slope","Elevation","Prod Index","Range Potential","Drought Index","All Crop Prod Index"', 'reaisincva.homesites_stats');
				if(req.query.nosw)
					var sql = "select r_regression_variables as vals from public.r_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";
				else
					var sql = "select r_step_regression_variables as vals from public.r_step_regression_variables('" + depvar + "','" + cols.join(",") + "','" + tableName + "',0,0)";// s("+out.join(",")+")";

				//var sql = "select * from public.r_table_stepwise_regression_variables('" + cols.join(",") + "','" + tableName + "')";// s("+out.join(",")+")";
				console.log(sql);
				//pg.connect(global.conString,function(err, client, release) {
				//if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
				//strip off extension
				client.query(sql, function(err, result) {
					if(err)console.log(err);
					//console.log(result.rows);

					var factors = JSON.parse(result.rows[0].vals);
					//console.log(factors);
					//client.query(sql, function(err, result) {
					//if(err)console.log(err);
					var sql="select name,saledate,type from " + req.user.shortName + "." + subtableName + "_vars where include>0  order by id desc,name asc";
					console.log(sql);
					client.query(sql, function(err, result) {
						var fields=[];
						var names={};
						//for(var i in result.rows)fields.push(result.rows[i].name);
						for(var i = 0; i < result.rows.length;i++){
							names[result.rows[i].name]=result.rows[i].type;
							if(result.rows[i].name.charAt(0) == result.rows[i].name.charAt(0).toUpperCase())
								result.rows[i].name='"' + result.rows[i].name + '"';
							else if(result.rows[i].name.indexOf(" ")!=-1)
								result.rows[i].name='"' + result.rows[i].name + '"';// as '+ result.rows[i].name.replace(/ /g,"_");
							fields.push(result.rows[i].name);
						}

						var sql=["select " + fields.join(",") + " from " + req.user.shortName + "." + subtableName + "_stats" + (oid?" where oid="+oid:"")];
						if(geometrytype!="None")sql.push("select replace(replace(substring(box2d(st_transform(st_setsrid(st_extent(wkb_geometry),3857),4326))::text,5),' ',','),')','') as extent from " + req.user.shortName + "." + subtableName + (oid?" where oid="+oid:""));
						console.log(sql);
						client.query(sql.join(";"), function(err, result) {
							release()
							//calculate the depvar price. result should only contain one row
							/*
							var depvar=0.0;
							for(var i=0;i<factors.vars.names.length;i++){
								if(i==factors.vars.names[i]){depvar=factors.vars.coef[i].Estimate}
								else{
									depvar+=
								}
							}
							*/
							//remove all double quotes from field names
							for(var i=0;i<fields.length;i++)fields[i]=fields[i].replace(/\"/g,"");
							fields.push("Date")
							var d=new Date();
							result.rows[0]["Date"]=""+(d.getMonth()+1) + '/' + d.getDate() + '/' +  d.getFullYear();
							var data = processData(factors,result.rows[0],saledate);
							if(err){console.log(err);res.json({err:err.toString()});throw err;}
							res.json({depvar:factors.names[0],pid:pid,tid:tid,sid:sid,id:oid,names:names,fields:fields,alias:alias,subject:subtableName,rows:result.rows,result:data?data:{}});
						});
					})
					//});
					//var vars=JSON.parse(result.rows[0].vals);
					//res.end('{"alias":"'+alias+'","vars":'+result.rows[0].vals+'}');
					//res.end(JSON.stringify({id:id,vars:vars}));
				});
				//});		  	
			});	

		});
	});

}
function calc(factors,row,saledate)
{
	var ret=factors.coef[0].Estimate;
	//need to get today's date.  use date.parse to get consistent number for entire day instead of using new Date()/1000 which changes every millisecond
	var d =  new Date();
	var today = Date.parse((d.getMonth()+1) + '/' + d.getDate() + '/' +  d.getFullYear())/1000;
	console.log(ret);
	for(var i=1;i<factors.names.length;i++)
	{
		if(saledate == factors.names[i]){
			ret += factors.coef[i].Estimate * today;
			console.log( factors.coef[i].Estimate + " * " + today + " = " + ret )
		}
		else if(row[factors.names[i]]){
			ret += factors.coef[i].Estimate * row[factors.names[i]];
			console.log( factors.coef[i].Estimate + " * " + row[factors.names[i]] + " = " + ret )
		}
	}

	return ret;
}

function processData(factors,data,saledate){
	var depvar=factors.names[0];
	var res={};
	//add today's date to row
	/*
	if(!$scope.residualscolumns){
		var id=factors.id.trim();//.replace(/"/g,"")
		$scope.residualcolumns=[id,depvar,"Predicted "+depvar,"Range - Lower "+depvar,"Range - Higher "+depvar,"Sale price within range"];
		$scope.residualsfields=[id,depvar,depvar+"_pred",depvar+"_lwr",depvar+"_hgr",depvar+"_inrng"];
		factors.names[depvar]='currency';
		factors.names[depvar+"_pred"]='currency';
		factors.names[depvar+"_lwr"]='currency';
		factors.names[depvar+"_hgr"]='currency';
		for(var i in data[0]){
			if(i!=id&&i!=depvar){
				$scope.residualcolumns.push(i);
				$scope.residualsfields.push(i);
			}
		}
	}
	 */
	//(col,key) in residualsdata[0] track by $index
	res["Appraisal price"]  = calc(factors,data,saledate);
	res["Lower range"]   = res["Appraisal price"] - factors.stderr;
	res["Higher range"]   = res["Appraisal price"] + factors.stderr;
	//data[depvar+"_inrng"] =  (data[depvar]<data[depvar+'_pred']+factors.vars.stderr && data[depvar]>data[depvar+'_pred']-factors.vars.stderr)?"Yes":"No";
	return res;
}

function deleteSubject(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sid = parseInt(req.params.sid);
	return;
	// var sql="select column_name from information_schema.columns where
	// table_schema='"+req.user.shortName+"' and table_name = '"+tableName+"'
	// and column_name not
	// in('id','ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total')
	// and data_type in('numeric','double
	// precision','float','integer','decimal')";
	var sql="select name from "+req.user.shortName+".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			// add the schema to the tablename
			// console.log(result);
			var tableName = result.rows[0].name;
			var baseTableName=tableName;
			tableName = req.user.shortName+"." + baseTableName;
			var sql=["drop table if exists "+tableName,"drop table if exists "+ tableName + "_stats", "drop table if exists "+ tableName + "_soils", "drop table if exists "+ tableName + "_vars","delete from "+req.user.shortName+".tables where pid="+pid+" and id="+tid];
			console.log(sql);
			client.query(sql.join(";"), function(err, result) {
				if (err){ res.json({"err":"Unable to delete table;"});throw err;}
				release()
				res.json({msg:"success"})
			})
		});
	});
}	

function getTable(req,res){
	console.log(req.params.pid);

	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);
	var sql="select name from "+req.user.shortName + ".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		client.query(sql, function(err, result) {
			if (err){ res.json({"err":"Unable to find table;"});throw err;}
			var tableName = result.rows[0].name+tid;
			var sql="select name,type from " + req.user.shortName + "." + tableName + "_vars where (include=1 or id=1) order by id desc,depvar desc,name asc";
			var total = req.query.total;

			console.log(sql);
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
					if(result.rows[i].type=='numeric')result.rows[i].name="round("+result.rows[i].name + "::numeric,2) as " + result.rows[i].name;
					cols.push(result.rows[i].name);
				}
				//count(*) OVER() AS total,
				var sql="select "+ cols.join(",") + " from " + tableName + "" + " offset " + (req.query.offset?req.query.offset:0) + "  limit " + (req.query.limit?req.query.limit:100);
				console.log(sql);
				client.query(sql, function(err, result) {
					if(err)console.log(err);
					release();
					if(!total)total=result.rows.length;
					res.json({total:total,rows:result.rows});				    
				});
			});
		});
	});
};
function downloadTable(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);

	var sql="select name from "+req.user.shortName+".tables where id="+tid;
	console.log(sql);
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.json({"err":"No connection to database;"});throw err;}
		// strip off extension
		client.query(sql, function(err, result) {
			var tableName = result.rows[0].name+tid;

			res.setHeader('Content-disposition', 'attachment; filename='+result.rows[0].name+'.csv');
			res.writeHead(200, {
				'Content-Type': 'text/csv'
			});
			tableName = req.user.shortName + "." + tableName + "_stats";
			console.log("Downloading: " + tableName);
			var copyTo = require('pg-copy-streams').to; //doesn't work with native pg
			pg.connect(global.conString,function(err, client, done) {
				if (err){ res.json({"err":"No connection to database;"});throw err;}
				var stream = client.query(copyTo('COPY '+ tableName+" TO STDOUT DELIMITER ',' CSV HEADER;"));
				//stream.pipe(process.stdout);
				stream.pipe(res);
				stream.on('end', done);
				stream.on('error', done);
			});
		});
	});
}
function showMap(req,res){
	var pid = parseInt(req.params.pid);
	var tid = parseInt(req.params.tid);

	var sql="select name from "+req.user.shortName+".tables where id="+tid;
	pg.connect(global.conString,function(err, client, release) {
		client.query(sql, function(err, result) {
			if(err)console.log(err);
			var tableName = result.rows[0].name+tid;
			var sql="select replace(replace(substring(box2d(st_transform(st_setsrid(st_extent(wkb_geometry),3857),4326))::text,5),' ',','),')','') as extent from "+req.user.shortName + "." + tableName;
			//var sql="select replace(replace(substr(st_astext((st_centroid(st_extent(wkb_geometry)))),7),' ',','),')','') as extent from "+req.user.shortName + "." + req.query.tableName;
			console.log(sql);
			client.query(sql, function(err, result) {
				if (err){ res.json({"err":"No connection to database;"});throw err;}
				console.log(result.rows);
				res.render('map', {
					user : req.user,
					layerName: tableName,
					extent:result.rows[0].extent
				});
				release()
			})
		})
	})

}

module.exports = router;
