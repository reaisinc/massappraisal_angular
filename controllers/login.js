var express = require('express')
  , session = require('express-session')
  , pgSession = require('connect-pg-simple')(session)
  , router = express.Router()
  , pg = require("pg")  
  , passport = require('passport')
  , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
  , jwt = require('jwt-simple');


router.get('/userinfo', function(req, res) {
	if(req.user){
		console.log("Logged in for userinfo");
		res.json(req.user);
	}
	else res.json("{}");
});

//var conString="postgres://postgres:postgres@localhost/soils";

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
//app.use(express.session({ secret: 'keyboard cat' }));
/*
router.use(session({
  secret: 'keyboard cat',
  resave: false,
	store: new pgSession({
    pg : pg,
    conString : conString,
    tableName : 'session'
  }),
  saveUninitialized: true
}))
*/

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
//router.use(passport.initialize());
//router.use(passport.session());

/*
 *
 *
 */
//API Access link for creating client ID and secret:
//https://code.google.com/apis/console/
var GOOGLE_CLIENT_ID = "242328462724-k5cj9fr1ri3gteaeek0mlr54rsa86vje.apps.googleusercontent.com";
var GOOGLE_CLIENT_SECRET = "ZJ7oIKoEteMON-jL8IJTfr9S";

//Passport session setup.
//To support persistent login sessions, Passport needs to be able to
//serialize users into and deserialize users out of the session.  Typically,
//this will be as simple as storing the user ID when serializing, and finding
//the user by ID when deserializing.  However, since this example does not
//have a database of user records, the complete Google profile is
//serialized and deserialized.
passport.serializeUser(function(user, done) {
	//console.log("serialize user");
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	//console.log("deserialize user");
	done(null, obj);
});


//Use the GoogleStrategy within Passport.
//Strategies in Passport require a `verify` function, which accept
//credentials (in this case, an accessToken, refreshToken, and Google
//profile), and invoke a callback with a user object.
passport.use(new GoogleStrategy({
	clientID: GOOGLE_CLIENT_ID,
	clientSecret: GOOGLE_CLIENT_SECRET,
	callbackURL: global.hostString + "/auth/google/callback"
},
function(accessToken, refreshToken, params, profile, done) {
	// asynchronous verification, for effect...
	var openIdId = jwt.decode(params.id_token, null, true).openid_id;
	var oAuthId = profile.id;
	profile.shortName = profile.emails[0].value.split("@")[0];
	console.log("User's shortName: " + profile.shortName);

	//req.session.user = profile.displayName;

	//console.log(profile);
	var sql = "select 1 as valid from users where username=$1";
	var vals=[profile.shortName];
	pg.connect(global.conString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//strip off extension
		client.query(sql, vals, function(err, result) {
			release();
			if(err)console.log(err);
			//res.end("success");

			if(result.rows && result.rows.length>0 && result.rows[0].valid==1)
			{
				process.nextTick(function () {

					// To keep the example simple, the user's Google profile is returned to
					// represent the logged-in user.  In a typical application, you would want
					// to associate the Google account with a user record in your database,
					// and return that user instead.
					return done(null, profile);
				});
			}
			else
			{
				process.nextTick(function () {

					// To keep the example simple, the user's Google profile is returned to
					// represent the logged-in user.  In a typical application, you would want
					// to associate the Google account with a user record in your database,
					// and return that user instead.
					profile.notvalidated=true;
					return done(null, profile);
				});

			}

			//res.end(JSON.stringify(result.rows));		
		});
	});


}
));



// GET /auth/google
// Use passport.authenticate() as route middleware to authenticate the
// request. The first step in Google authentication will involve
// redirecting the user to google.com. After authorization, Google
// will redirect the user back to this application at /auth/google/callback
router.get('/google', passport.authenticate('google', {
	scope : [ 'https://www.googleapis.com/auth/userinfo.profile',
	          'https://www.googleapis.com/auth/userinfo.email' ]
}), function(req, res) {
	console.log("auth/google");
	// The request will be redirected to Google for authentication, so this
	// function will not be called.
});

// GET /auth/google/callback
// Use passport.authenticate() as route middleware to authenticate the
// request. If authentication fails, the user will be redirected back to the
// login page. Otherwise, the primary route function function will be called,
// which, in this example, will redirect the user to the home page.
router.get('/google/callback', passport.authenticate('google', {

	failureRedirect : '/login'
}), function(req, res) {
	if(req.user&&req.user.notvalidated){
		res.end("Not validated");
		return;
	}
	console.log("Authenticated");
	//console.log(req.user);
	//res.redirect('/ma/one.html');
	//if(req.query.redirect)
	//	res.redirect(req.query.redirect);
	//else

	res.redirect('/#/models');
	/*
	res.render('upload', {
		user : req.user
	});
	 */


});


module.exports = router