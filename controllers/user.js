/*
function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) { return next(); }
res.redirect('/?redirect=/user');
}
*/
var express = require('express');
var pg=require("pg");
var router = express.Router();

router.use(function(req, res, next) {
	if (!req.isAuthenticated()) { 
		console.log("redirecting");
		res.redirect('/login');
		return; 
	}

	next();
});

router.get('/', function(req, res){
	  console.log(req.user.shortName);
	  //console.log(req.user.emails[0].value);
	  if(req.user.shortName!='reaisincva'){
		  res.end("Unauthorized user");
		  return;
	  }
	  createUser(req.query.username.replace(/\W/g, ''));
	  
});

function createUser(username){

	var sql=["CREATE SCHEMA "+username+" AUTHORIZATION postgres",
	         "GRANT ALL ON SCHEMA "+username+" TO postgres",
	         "GRANT ALL ON SCHEMA "+username+" TO dbuser",
	         "GRANT SELECT ON ALL TABLES IN SCHEMA "+username+" TO dbuser",
	         "GRANT SELECT ON ALL SEQUENCES IN SCHEMA "+username+" TO dbuser",
	         "GRANT SELECT,INSERT,DELETE ON SCHEMA "+username+" TO dbuser",
	         "CREATE TABLE "+username+".tables( id serial NOT NULL, name character varying(200) primary key, pid int,filename varchar(200), geometrytype character varying(50), filetype character varying(50),  date_loaded timestamp without time zone, comp int default 0, type int default 0	)	WITH (	  OIDS=FALSE	)",
	         "ALTER TABLE "+username+".tables OWNER TO postgres",
	         "GRANT ALL ON TABLE "+username+".tables TO postgres",
	         "GRANT SELECT,INSERT, DELETE ON TABLE "+username+".tables TO dbuser",
	         "GRANT SELECT,INSERT, DELETE ON "+username+".tables TO dbuser",
	         "GRANT SELECT,USAGE,UPDATE ON "+username+".tables_id_seq TO dbuser",

	         "CREATE TABLE "+username+".projects( id serial NOT NULL, username varchar(200),create_date timestamp without time zone, last_modified timestamp without time zone,name varchar(200) NOT NULL,state varchar(2) NOT NULL, primary key(name,state))	WITH (	  OIDS=FALSE	)",
	         "ALTER TABLE "+username+".projects OWNER TO postgres",
	         "GRANT ALL ON TABLE "+username+".projects TO postgres",
	         "GRANT SELECT,INSERT, DELETE ON TABLE "+username+".projects TO dbuser",
	         "GRANT SELECT,INSERT, DELETE ON "+username+".projects TO dbuser",
	         "GRANT SELECT,USAGE,UPDATE ON "+username+".projects_id_seq TO dbuser",

	         "GRANT ALL ON SCHEMA "+username+" TO dbuser",
	         "select count(*) as cnt from "+username+".tables"];

	pg.connect(global.adminConString,function(err, client, release) {
		if (err){ res.end(JSON.stringify({"err":"No connection to database;"}));throw err;}
		//strip off extension
		client.query(sql.join(";"), function(err, result) {

			if(err)console.log(err);
			if(result.rows&&result.rows.length&&result.rows[0].cnt==0){

				sql="insert into public.users(username,password) values($1,$2)";
				var vals=[username,'validated'];
				client.query(sql,vals, function(err, result) {
					release();
					res.end("User " + username + " successfully created.")
				});
			}
			else{
				release();
				res.end("Unable to create user " + username + ".")
			}

		});
	});

}
module.exports = router;
/*
 * GET users listing.

create table reaisincva.tables ( id serial,name varchar(200),geometrytype varchar(50),filetype varchar(50),date_loaded timestamp);
 */
 
 /*
	emails: [ { value: 'reaisincva@gmail.com' } ] 
  session:
   { cookie:
      { path: '/',
        _expires: null,
        originalMaxAge: null,
        httpOnly: true },
     passport: { user: [Object] } },
  _passport:
   { instance:
      { _key: 'passport',
        _strategies: [Object],
        _serializers: [Object],
        _deserializers: [Object],
        _infoTransformers: [],
        _framework: [Object],
        _userProperty: 'user',
        Authenticator: [Function: Authenticator],
        Passport: [Function: Authenticator],
        Strategy: [Object],
        strategies: [Object] },
     session: { user: [Object] } },
  user:
   { provider: 'google',
     id: '111028451305834352504',
     displayName: 'Steve Hale',
     name: { familyName: 'Hale', givenName: 'Steve' },
     emails: [ [Object] ],
     _raw: '{\n "id": "111028451305834352504",\n "email": "reaisincva@gmail.com",\n "verified_email": true,\n "name": "Steve Hale",\n "given_name": "Steve",\n "
family_name": "Hale",\n "picture": "https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg",\n "gender": "male",\n "locale
": "en"\n}\n',
     _json:
      { id: '111028451305834352504',
        email: 'reaisincva@gmail.com',
        verified_email: true,
        name: 'Steve Hale',
        given_name: 'Steve',
        family_name: 'Hale',
        picture: 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg',
        gender: 'male',
        locale: 'en' } },
*/         

