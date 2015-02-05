"use strict";

var express = require('express');
var router = express.Router();
var pg = require("pg");

var path = require('path'),
fs = require('fs'),
//lwip = require('lwip'),
_existsSync = fs.existsSync || path.existsSync,
mkdirp = require('mkdirp'),
formidable = require('formidable'),
nameCountRegexp = /(?:(?: \(([\d]+)\))?(\.[^.]+))?$/;
//var util = require("util"),
//rio = require("rio");

router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		res.redirect('/login');
		return; 
	}
	next();
});

var setNoCacheHeaders = function(res) {
	res.setHeader('Pragma', 'no-cache');
	res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
	res.setHeader('Content-Disposition', 'inline; filename="files.json"');
}

router.post('/',  function(req, res){
	var options={
			uploadDir: __dirname + '/../public/files/' + req.user.shortName+"/predict/",
			uploadUrl:   '/files/' + req.user.shortName + '/predict/',
			tmpDir: __dirname + '/../tmp',
			maxPostSize: 250000000000, // 11 GB
			minFileSize: 1,
			maxFileSize: 250000000000, // 10 GB
			acceptFileTypes: /.+/i,
			useSSL: false,
			UUIDRegex: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
			// Files not matched by this regular expression force a download dialog,
			// to prevent executing any scripts in the context of the service domain:
			inlineFileTypes: /\.(shp|shx|dbf|prj|zip|csv|xls|xlsx)$/i,
			//imageTypes: opts.imageTypes || /\.(gif|jpe?g|png)/i,
			/*
      imageVersions: {
        'thumbnail': {
          width: (opts.imageVersions && opts.imageVersions.maxWidth) ? opts.imageVersions.maxWidth : 99,
          height: (opts.imageVersions && opts.imageVersions.maxHeight) ? opts.imageVersions.maxHeight : 'auto'
        }
      },
			 */
			/*
      accessControl: {
        allowOrigin: (opts.accessControl && opts.accessControl.allowOrigin) ? opts.accessControl.allowOrigin : '*',
        allowMethods: (opts.accessControl && opts.accessControl.allowMethods) ? opts.accessControl.allowMethods : 'OPTIONS, HEAD, GET, POST, PUT, DELETE',
        allowHeaders: (opts.accessControl && opts.accessControl.allowHeaders) ? opts.accessControl.allowHeaders : 'Content-Type, Content-Range, Content-Disposition'
      },
			 */
			storage: {
				type: "local",
				/*		
        aws: {
          accessKeyId: (opts.storage && opts.storage.aws && opts.storage.aws.accessKeyId) ? opts.storage.aws.accessKeyId : null,
          secretAccessKey: (opts.storage && opts.storage.aws && opts.storage.aws.secretAccessKey) ? opts.storage.aws.secretAccessKey : null,
          region: (opts.storage && opts.storage.aws && opts.storage.aws.region) ? opts.storage.aws.region : null,
          bucketName: (opts.storage && opts.storage.aws && opts.storage.aws.bucketName) ? opts.storage.aws.bucketName : null,
          acl: (opts.storage && opts.storage.aws && opts.storage.aws.acl) ? opts.storage.aws.acl : 'public-read'
        }
				 */
			}
	};		
	fileUploader.setPaths(options);
	setNoCacheHeaders(res);
	var form = new formidable.IncomingForm(),
	tmpFiles = [],
	files = [],
	map = {},
	counter = 1,
	redirect,
	finish = function(sss, error) {
		counter -= 1;
		if (!counter) {
			files.forEach(function(fileInfo) {
				fileInfo.initUrls(req, sss, options);
			});
			process(files,req,res, redirect, error);
		}
	};

	form.uploadDir = options.tmpDir;

	form.on('fileBegin', function(name, file) {
		tmpFiles.push(file.path);
		var fileInfo = new FileInfo(file, req, true);
		fileInfo.safeName();
		map[path.basename(file.path)] = fileInfo;
		files.push(fileInfo);
	}).on('field', function(name, value) {
		if (name === 'redirect') {
			redirect = value;
		}
	}).on('file', function(name, file) {
		var fileInfo = map[path.basename(file.path)];
		fileInfo.size = file.size;
		if (!fileInfo.validate(options)) {
			fs.unlink(file.path);
			return;
		}
		// part ways here
		//if (options.storage.type == 'local') {
		//delete any existing files
		//fs.unlinkSync(file.path, options.uploadDir + '/' + fileInfo.name);

		fs.renameSync(file.path, options.uploadDir + '/' + fileInfo.name);
		console.log("Uploaded: " + file.path, options.uploadDir + '/' + fileInfo.name);

	}).on('aborted', function() {
		tmpFiles.forEach(function(file) {
			fs.unlink(file);
		});
	}).on('error', function(e) {
		console.log(e);
	}).on('progress', function(bytesReceived) {
		if (bytesReceived > options.maxPostSize) {
			req.connection.destroy();
		}
	}).on('end', function() {
		console.log("Done uploading");
		finish();
	}).parse(req);
});

router.get('/',  function(req, res){
	console.log(req.query);
	//return;
	//if(!req.query){
	//get list of uploaded files
	var uploadDir = __dirname + '/../public/files/' + req.user.shortName+"/predict/";
	setNoCacheHeaders(res);
	var options={
			uploadDir: __dirname + '/../public/files/' + req.user.shortName+"/predict/",
			uploadUrl:   '/files/' + req.user.shortName + '/predict/',
			useSSL: false
	}

	var files = [];
	//if (options.storage.type == 'local') {

	fs.readdir(uploadDir, function(err, list) {
		if(list)
			list.forEach(function(name) {
				var stats = fs.statSync(uploadDir + '/' +  name),
				fileInfo;
				if (stats.isFile() && name[0] !== '.') {
					fileInfo = new FileInfo({
						name: name,
						size: stats.size,
						lastMod: stats.mtime
					});
					fileInfo.initUrls(req,false,options);
					files.push(fileInfo);
				}
			});
		console.log("List of files");
		console.log(files);
		res.render('predict', {
			user : req.user,
			tableName: req.query.tableName,
			ws: req.query.nosw?1:0,
					files:files
		});
	});
});

router.get('/:filename/delete',  function(req, res){
	var fileName = req.params.filename;
	var uploadDir = __dirname + '/../public/files/' + req.user.shortName+"/predict/";

	//if (req.url.slice(0, options.uploadUrl.length) === options.uploadUrl) 
	//{
	//fileName = path.basename(decodeURIComponent(req.url));
	if (fileName[0] !== '.') {
		fs.unlink(uploadDir + '/' + fileName, function(ex) {

		});
		return;
	}
	//}
});

router.get('/:fileName/download',  function(req, res){
	var fileName = req.params.fileName;
//	load file into database, then run against predict call in R

});

//r_table_stepwise_regression_predict
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

	var idName = req.query.idName;
	if(!idName)idName='oid';
	else idName=idName.replace(/\W/g, '');

	tableName = tableName.replace(/\W/g, '').toLowerCase();

	//console.log(sql);

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
				//out.push(result.rows[i].name + " double precision");
			}

			var sql = "select * from public.r_table_stepwise_regression_predict('" + cols.join(",") + "','" + tableName + "')";// s("+out.join(",")+")";
			console.log(sql);
			client.query(sql, function(err, result) {
				if(err)console.log(err);
				console.log(result.rows);
				release();
				res.end(result.rows[0].r_table_stepwise_regression_predict);
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

	var idName = req.query.idName;
	if(!idName)idName='oid';
	else idName=idName.replace(/\W/g, '');

	tableName = tableName.replace(/\W/g, '').toLowerCase();

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
			var depvar;
			var id=result.rows[0].name;

			//var out=["name text"];
			for(var i = 1; i < result.rows.length;i++){
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
				console.log(result.rows);
				release();
				//var vars=JSON.parse(result.rows[0].vals);
				res.end("{\"vars\":"+result.rows[0].vals+"}");
				//res.end(JSON.stringify({id:id,vars:vars}));
			});
			//});		  	
		});
	});

});

function checkExists(dir) {
	fs.exists(dir, function(exists) {
		if (!exists) {
			mkdirp(dir, function(err) {
				if (err) console.error(err)
				else console.log("The uploads folder was not present, we have created it for you [" + dir + "]");
			});
			//throw new Error(dir + ' does not exists. Please create the folder');
		}
	});
}

var fileUploader = {};

fileUploader.setPaths=function(opts){
	//options.tmpDir = opts.tmpDir || __dirname + '/tmp',
	//options.uploadDir = opts.uploadDir || __dirname + '/public/files/'+req.user.shortName+'/predict/',
	//options.uploadUrl = opts.uploadUrl || '/files/'+req.user.shortName+'/predict/';

	checkExists(opts.tmpDir);
	checkExists(opts.uploadDir);
}

var FileInfo = function(file) {
	this.name = file.name;
	this.size = file.size;
	this.type = file.type;
	this.modified = file.lastMod;
	this.deleteType = 'DELETE';
};

FileInfo.prototype.safeName = function() {
	// Prevent directory traversal and creating hidden system files:
	this.name = path.basename(this.name).replace(/^\.+/, '');

	// Prevent overwriting existing files:
	//while (_existsSync(options.uploadDir + '/' + this.name)) {
	//  this.name = this.name.replace(nameCountRegexp, nameCountFunc);
	//}
};

FileInfo.prototype.initUrls = function(req, sss, options) {
	if (!this.error) {
		var that = this;
		if (!sss) {
			var baseUrl = (options.useSSL ? 'https:' : 'http:') +
			'//' + req.headers.host + options.uploadUrl;
			that.url = baseUrl + encodeURIComponent(that.name);
			that.deleteUrl = baseUrl + encodeURIComponent(that.name);
			/*
        Object.keys(options.imageVersions).forEach(function(version) {
          if (_existsSync(
              options.uploadDir + '/' + version + '/' + that.name
            )) {
            that[version + 'Url'] = baseUrl + version + '/' +
              encodeURIComponent(that.name);
          }
        });
			 */
		} else {
			that.url = sss.url;
			that.deleteUrl = options.uploadUrl + sss.url.split('/')[sss.url.split('/').length - 1].split('?')[0];
			/*
        if (options.imageTypes.test(sss.url)) {
          Object.keys(options.imageVersions).forEach(function(version) {
            that[version + 'Url'] = sss.url;
          });
        }
			 */
		}
	}
};

FileInfo.prototype.validate = function(options) {
	if (options.minFileSize && options.minFileSize > this.size) {
		this.error = 'File is too small';
	} else if (options.maxFileSize && options.maxFileSize < this.size) {
		this.error = 'File is too big';
	} else if (!options.acceptFileTypes.test(this.name)) {
		this.error = 'Filetype not allowed';
	}
	return !this.error;
};

function process(files,req,res, redirect, error){
	console.log(files);
	res.writeHead(200, {"Content-Type": "application/json"});
	res.end(JSON.stringify({files:files}));	
}

module.exports = router;