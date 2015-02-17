#!/bin/env node
/*
R Regression pages
http://www.statmethods.net/stats/regression.html

CREATE TABLE "session" (
  "sid" varchar NOT NULL COLLATE "default",
	"sess" json NOT NULL,
	"expire" timestamp(6) NOT NULL
)
WITH (OIDS=FALSE);
ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid") NOT DEFERRABLE INITIALLY IMMEDIATE;

 */
var isLocal=false;
var os = require("os");
os.hostname();
if(/^win/.test(process.platform))
	isLocal=true;

if(isLocal){
//	global.conString = "postgres://postgres:postgres@localhost/soils";
	global.conString = "postgres://dbuser:dbuser@localhost/soils";
	global.adminConString = "postgres://postgres:postgres@localhost/soils";
	global.hostString = "http://127.0.0.1:8888";
	global.ogrConnString = 'PG:host=localhost user=dbuser dbname=soils password=dbuser';
	global.postgisStr = "dbname=soils user=dbuser password=dbuser host=localhost"
}
else{
	global.ogrConnString = 'PG:host=localhost user=dbuser dbname=soils password=dbuser';
	global.conString = "postgresql://dbuser:dbuser@127.11.25.130:5432/massappraisal";
	global.adminConString = "postgres://adminwrhjewj:I2JGjbKe1ENG@localhost/massappraisal";
	global.hostString = "http://massappraisal-reais.rhcloud.com";
	global.ogrConnString = 'PG:host=127.11.25.130 user=dbuser dbname=massappraisal password=dbuser';
}	

//Simple route middleware to ensure user is authenticated.
//Use this route middleware on any resource that needs to be protected.  If
//the request is authenticated (typically via a persistent login session),
//the request will proceed.  Otherwise, the user will be redirected to the
//login page.
/*
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) { return next(); }
res.render('login', {
	user : req.user
});

//res.redirect('/signin.html');
}
 */

/**
 * Module dependencies.
 */
var express = require('express')
//, routes = require('./routes/')
//, user = require('./routes/user')
, bodyParser = require('body-parser')
//, upload = require('./routes/upload')
//, verify = require('./routes/verify')
//, requireDir = require('require-dir')
, session = require('express-session')
, pgSession = require('connect-pg-simple')(session)
//, serveStatic = require('serve-static')
, http = require('http')
, path = require('path')
, pg = require("pg")
, passport = require('passport')
, util = require('util')
//, GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
//, jwt = require('jwt-simple');

//, oauthserver = require('oauth2-server');
//, passport = require('passport')
//, GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
//, path = require('path')
//, fs = require('fs')
//Since Node 0.8, .existsSync() moved from path to fs:
//,formidable = require('formidable')
//,nodeStatic = require('node-static');

//API Access link for creating client ID and secret:
//https://code.google.com/apis/console/
//var GOOGLE_CLIENT_ID = "242328462724-k5cj9fr1ri3gteaeek0mlr54rsa86vje.apps.googleusercontent.com";
//var GOOGLE_CLIENT_SECRET = "ZJ7oIKoEteMON-jL8IJTfr9S";


//Passport session setup.
//To support persistent login sessions, Passport needs to be able to
//serialize users into and deserialize users out of the session.  Typically,
//this will be as simple as storing the user ID when serializing, and finding
//the user by ID when deserializing.  However, since this example does not
//have a database of user records, the complete Google profile is
//serialized and deserialized.
//passport.serializeUser(function(user, done) {
//done(null, user);
//});

//passport.deserializeUser(function(obj, done) {
//done(null, obj);
//});


//Use the GoogleStrategy within Passport.
//Strategies in Passport require a `verify` function, which accept
//credentials (in this case, an accessToken, refreshToken, and Google
//profile), and invoke a callback with a user object.
/*
passport.use(new GoogleStrategy({
 clientID: GOOGLE_CLIENT_ID,
 clientSecret: GOOGLE_CLIENT_SECRET,
 callbackURL: "/db/auth/google/callback"
},
function(accessToken, refreshToken, profile, done) {
 // asynchronous verification, for effect...
 process.nextTick(function () {

   // To keep the example simple, the user's Google profile is returned to
   // represent the logged-in user.  In a typical application, you would want
   // to associate the Google account with a user record in your database,
   // and return that user instead.
   return done(null, profile);
 });
}
));
 */

var app = express();
//app.use('/', routes);
//all environments
app.set('port', process.env.PORT || 8888);
//app.set('conString',"postgres://postgres:postgres@localhost/soils");
app.use(bodyParser.urlencoded({ extended: true }))    // parse application/x-www-form-urlencoded
app.use(bodyParser.json())    //


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(app.router);


//development only
//if ('development' == app.get('env')) {
//app.use(express.errorHandler());
//}
//init the uploader
//var options={};

//Initialize Passport!  Also use passport.session() middleware, to support
//persistent login sessions (recommended).
//app.use(express.session({ secret: 'keyboard cat' }));
/*
app.use('/', function(req,res,next){
	 if(req.user){
	   return express.static(path.join(__dirname, 'public'));
	 } else {
		 res.redirect('/login');
	   //res.render(403, 'login', {message:'Please, login!'});
	 }
});
 */
//app.use(express.static(path.join(__dirname, 'public')));
app.use('/', express.static(__dirname + '/public/html'));

app.use('/pages', express.static(__dirname + '/public/pages'));
app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/img', express.static(__dirname + '/public/img'));
app.use('/data', express.static(__dirname + '/public/data'));
app.use('/media', express.static(__dirname + '/public/media'));

//app.use(serveStatic('/css', {'index': ['default.html', 'default.htm']}))

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	store: new pgSession({
		pg : pg,
		conString : global.conString,
		tableName : 'session'
	}),
	/*
  store: new RedisStore({
            port: 8880,
            prefix: "ma"
  }),
	 */
	saveUninitialized: true
}))

//Initialize Passport!  Also use passport.session() middleware, to support
//persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());

app.use(require('./controllers'))

//load all routes dynamically
//var routes = requireDir('./routes'); // https://www.npmjs.org/package/require-dir
//console.log(routes);
//for (var i in routes) app.use('/', routes[i]);
//app.use('/loadfiles', require("./routes/loadfiles"));
/*
app.use('/summary', require("./routes/summary").router);
app.use('/correlation', require("./routes/correlation"));
app.use('/regression', require("./routes/regression"));
app.use('/residuals', require("./routes/residuals"));
 */
/*
app.use('/', routes);
app.use('/verify', verify);
app.use('/summary', summary);
app.use('/user', user);
 */
/*
app.get('/correlation',ensureAuthenticated,function(req,res){
	res.render('correlation', {
		user : req.user,
		tableName: req.query.tableName
	});
});
app.get('/regression',ensureAuthenticated,function(req,res){
	res.render('regression', {
		user : req.user,
		tableName: req.query.tableName
	});
});
app.get('/residuals',ensureAuthenticated,function(req,res){
	res.render('residuals', {
		user : req.user,
		tableName: req.query.tableName
	});
});

app.get('/loadtable',ensureAuthenticated,function(req,res){
	res.render('loadtable', {
		user : req.user
	});
});

app.get('/uploadfiles',ensureAuthenticated,function(req,res){
	res.render('uploadfiles', {
		user : req.user
	});
});
app.get('/summary',ensureAuthenticated,function(req,res){
	res.render('summary', {
		user : req.user,
		tableName: req.query.tableName
	});
});
 */


/*
app.post('/login', passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/login' }));

app.get('/login',function(req,res){

});
 */
/*
var passport = require('passport')
, GoogleStrategy = require('passport-google').Strategy;

passport.use(new GoogleStrategy({
  returnURL: 'http://www.example.com/auth/google/return',
  realm: 'http://www.example.com/'
},
function(identifier, profile, done) {
  User.findOrCreate({ openId: identifier }, function(err, user) {
    done(err, user);
  });
}
));
 */


/*
 * End of login
 */
if(isLocal)
{
	//app.get('/upload', upload.upload);
//	app.get('/verify', verify);
//	app.get('/users', user.list);
	/*
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
	 */
//	error handling middleware should be loaded after the loading the routes
//	if ('development' == app.get('env')) {
//	app.use(errorHandler());
//	}
	var cluster = require('cluster'); //for the multi-processing
	var numCPUs = require('os').cpus().length;

	if (cluster.isMaster) {
		// Fork workers.
		for (var i = 0; i < numCPUs; i++) {
			cluster.fork();
		}

		cluster.on('exit', function(worker, code, signal) {
			console.log('worker ' + worker.process.pid + ' died');
		});
	} else {
		app.listen(app.get('port'), function(){
			console.log('Express server listening on port ' + app.get('port'));
			//console.log(global.conString);
		});
	}
}
else
{	
//	Get the environment variables we need.
	var ipaddr  = process.env.OPENSHIFT_NODEJS_IP;
	var port    = process.env.OPENSHIFT_NODEJS_PORT || 8080;

	if (typeof ipaddr === "undefined") {
		console.warn('No OPENSHIFT_NODEJS_IP environment variable');
	}

	//  terminator === the termination handler.
	function terminator(sig) {
		if (typeof sig === "string") {
			console.log('%s: Received %s - terminating Node server ...',
					Date(Date.now()), sig);
			process.exit(1);
		}
		console.log('%s: Node server stopped.', Date(Date.now()) );
	}

	//  Process on exit and signals.
	process.on('exit', function() { terminator(); });
	['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS',
	 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGPIPE', 'SIGTERM'
	 ].forEach(function(element, index, array) {
		 process.on(element, function() { terminator(element); });
	 });
	//  And start the app on that interface (and port).
	app.listen(port, ipaddr, function() {
		console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
				ipaddr, port);
	});
}