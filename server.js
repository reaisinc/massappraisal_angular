#!/bin/env node
global.conString = "postgres://adminwrhjewj:I2JGjbKe1ENG@localhost/massappraisal";
global.adminConString = "postgres://adminwrhjewj:I2JGjbKe1ENG@localhost/massappraisal";
global.hostString = "http://massappraisal-reais.rhcloud.com";

//git push ssh://54b1c9de5973ca47ad000163@massappraisal-reais.rhcloud.com/~/git/massappraisal.git/ master
/**
 * Module dependencies.
 */
var express = require('express')
, bodyParser = require('body-parser')
, session = require('express-session')
, pgSession = require('connect-pg-simple')(session)
, http = require('http')
, path = require('path')
, pg = require("pg")
, passport = require('passport')
, util = require('util')

var app = express();
//all environments
//app.set('port', process.env.PORT || 8888);
app.use(bodyParser.urlencoded({ extended: false }))    // parse application/x-www-form-urlencoded
app.use(bodyParser.json())    //

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//Initialize Passport!  Also use passport.session() middleware, to support
//persistent login sessions (recommended).
//app.use(express.session({ secret: 'keyboard cat' }));
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	store: new pgSession({
		pg : pg,
		conString : global.conString,
		tableName : 'session'
	}),
	saveUninitialized: true
}))
//Initialize Passport!  Also use passport.session() middleware, to support
//persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());


app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/img', express.static(__dirname + '/public/img'));

app.use(require('./controllers'))

//  Get the environment variables we need.
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
	//  And start the app on that interface (and port).
	app.listen(port, ipaddr, function() {
	   console.log('%s: Node server started on %s:%d ...', Date(Date.now() ),
	               ipaddr, port);
	});
}
