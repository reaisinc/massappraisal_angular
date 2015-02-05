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
	if(req.query.name && req.query.state){
		createProject(req.query.name, req.query.state);
	}
	else{
		getUserProjects(req,res);
	}
});

//read
router.get('/:id',  function(req, res){
	getUserFiles(req,res);
});

//create
router.put('/',  function(req, res){
	createProject(req,res);
});

//update
router.post('/:id',  function(req, res){
	updateProject(req,res);
});

//delete
router.delete('/:id',  function(req, res){
	deleteProject(req,res);	
});

router.get('/:id/delete',  function(req, res){
	deleteProject(req,res);
});

function createProject(req,res)
{
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.status(404).end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//var sql="SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stats' and table_name not like '%_soils' and table_name not like '%_vars'";
		var sql="insert into "+req.user.shortName+".projects(name,state,created_date,modified_date) values($1,$2,NOW(),NOW()) returning id";
		var vals=[req.body.name,req.body.state];
		console.log(sql);console.log(vals);
		client.query(sql, vals, function(err, result) {
			release();
			if(err||!result)res.status(404).send('Not found');
			else {
				res.json({"id":result.rows[0].id})
				//getUserFiles(req,res,result.rows[0].id);
			}
		})
	});
}

function getUserFiles(req,res)
{
	//res.writeHead(200, {"Content-Type": "application/json"});
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		var field="project";
		var	vals=[req.params.projectName];

		//var sql="SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stats' and table_name not like '%_soils' and table_name not like '%_vars'";
		var sql="select name from "+req.user.shortName + ".projects where id=$1;select id,name,type,comp,case when filetype IS NULL then 'Unknown' else filetype end,to_char(date_loaded, 'Month DD, YYYY') as date  from "+req.user.shortName + ".tables where project=$1";
		console.log(sql);
		console.log(vals);
		client.query(sql, vals, function(err, result) {
		    release()
		    console.log(result);
		    //res.send(JSON.stringify({user:req.user.displayName,project:req.params.projectName,rows:result.rows?result.rows:[]}))
		    res.json({project:result[0].rows[0].name,id:req.params.projectName,rows:result[1].rows?result[1].rows:[]});
		    //if (err) throw err;
		    //console.log("Count: "+result.rows[0])
		    /*
			res.render('project', {
				user : req.user
				,project:req.params.projectName
				,files: result&&result.rows?result.rows:[]
			});
			*/

		})
	});
}

function updateProject(req,res){
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//var sql="SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stats' and table_name not like '%_soils' and table_name not like '%_vars'";
		var sql="delete from from "+req.user.shortName + ".tables where project=$1;delete from "+req.user.shortName+".projects where name=$1";
		var vars=[req.params.projectName];
		console.log(sql);
		client.query(sql, vars,function(err, result) {
		    release()
		    getUserFiles(req,res);
		})
	});
	
}

function deleteProject(req,res){
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//var sql="SELECT table_name FROM information_schema.tables WHERE table_schema = '"+req.user.shortName+"' and table_name not like '%_stats' and table_name not like '%_soils' and table_name not like '%_vars'";
		var sql="delete from from "+req.user.shortName + ".tables where project=$1";
		var vars=[req.params.projectName];
		console.log(sql);
		client.query(sql, vars,function(err, result) {
		    release()
		    getUserFiles(req,res);
		})
	});
	
}
function getUserProjects(req,res)
{
	//res.writeHead(200, {"Content-Type": "application/json"});
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		var sql="select id,name,upper(state) as state,to_char(created_date, 'Month DD, YYYY') as created_date,to_char(modified_date, 'Month DD, YYYY') as modified_date from "+req.user.shortName + ".projects";
		console.log(sql);
		client.query(sql, function(err, result) {
		    release()
		    //res.send(JSON.stringify({user:req.user.displayName,rows:result.rows?result.rows:[]}));
		    res.json({user:req.user.displayName,rows:result.rows?result.rows:[]});
		})
	});
}

module.exports = router;
