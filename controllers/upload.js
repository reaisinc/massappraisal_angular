var express = require('express');
var router = express.Router();

router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		//res.redirect('/login');
		res.status(404);
		return; 
	}
	next();
});

var options={      
		//tmpDir: __dirname + '/tmp',
		//uploadDir:  __dirname + '/public/files',
		//uploadUrl:  '/files/',
};
var uploader = require('../upload')(options);
//get list of files
router.get('/:pid',  function(req, res) {
	var obj={};
	var pid=parseInt(req.params.pid);
	obj.uploadDir = __dirname + '/../public/files/' + req.user.shortName + '/' + pid;
	obj.uploadUrl=  '/files/' + req.user.shortName + '/' + pid + '/';
	obj.tmpDir= __dirname + '/../tmp';
	uploader.setPaths(obj,req);
	uploader.get(req, res, function (obj) {
		res.json(obj); 
	});
});
//upload file
router.post('/:pid', function(req, res) {
	var obj={};
	var pid=parseInt(req.params.pid); 
	obj.uploadDir = __dirname + '/../public/files/' + req.user.shortName + '/' + pid;
	obj.uploadUrl=  '/files/' + req.user.shortName + '/' + pid + '/';
	obj.tmpDir= __dirname + '/../tmp';
	uploader.setPaths(obj,req);
	uploader.post(req, res, function (obj) {
		res.json(obj); 
	});

});
//delete file
router.delete('/:pid/:name', function(req, res) {
	var obj={};
	var pid=parseInt(req.params.pid);
	obj.uploadDir = __dirname + '/../public/files/' + req.user.shortName + '/' + pid;
	obj.uploadUrl=  '/files/' + req.user.shortName + '/' + pid + '/';
	obj.tmpDir= __dirname + '/../tmp';
	uploader.setPaths(obj,req);
	uploader.delete(req, res, function (obj) {
		res.json(obj); 
	});
});

module.exports = router;

/*
module.exports = function (router) {
    router.get('/upload',  function(req, res) {
    	var obj={};
    	obj.uploadDir = __dirname + '/../public/files/' + req.user.shortName;
    	obj.uploadUrl=  '/files/' + req.user.shortName + '/';
    	obj.tmpDir= __dirname + '/../tmp';
    	uploader.setPaths(obj,req);
      uploader.get(req, res, function (obj) {
            res.send(JSON.stringify(obj)); 
      });

    });

    router.post('/upload', function(req, res) {
    	var obj={};
    	obj.uploadDir = __dirname + '/../public/files/' + req.user.shortName;
    	obj.uploadUrl=  '/files/' + req.user.shortName + '/';
    	obj.tmpDir= __dirname + '/../tmp';
			uploader.setPaths(obj,req);
      uploader.post(req, res, function (obj) {
            res.send(JSON.stringify(obj)); 
      });

    });

    router.delete('/files/:name', function(req, res) {
    	var obj={};
    	obj.uploadDir = __dirname + '/../public/files/' + req.user.shortName;
    	obj.uploadUrl=  '/files/' + req.user.shortName + '/';
    	obj.tmpDir= __dirname + '/../tmp';
			uploader.setPaths(obj,req);
      uploader.delete(req, res, function (obj) {
            res.send(JSON.stringify(obj)); 
      });
    });

    return router;
}
 */