CREATE DATABASE magis
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'English_United States.1252'
       LC_CTYPE = 'English_United States.1252'
       CONNECTION LIMIT = -1;
       
CREATE ROLE dbuser LOGIN
  ENCRYPTED PASSWORD 'md50e5ffb9d5f02a6b89e3c70343bdf19db'
  NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;
  
ALTER DATABASE magis
  SET search_path = dbuser, public, topology, tiger;

CREATE EXTENSION postgis;
CREATE EXTENSION plr;




GRANT EXECUTE ON FUNCTION  public.isdouble(text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.isint(text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.tonumeric(fieldname text,tablename text)  TO dbuser;

GRANT EXECUTE ON FUNCTION  public.r_table_summary(in fieldnames text,in tablename text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.r_table_cor(in fieldnames text,in tablename text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.r_table_regression_summary(in fieldnames text,in tablename text)   TO dbuser;


--Create a new schema
CREATE SCHEMA appraiser
  AUTHORIZATION postgres;

GRANT ALL ON SCHEMA appraiser TO postgres;
GRANT ALL ON SCHEMA appraiser TO dbuser;


--Public tables:



--GRANT USAGE ON SCHEMA az TO dbuser;
--GRANT SELECT ON ALL TABLES IN SCHEMA az TO dbuser;

GRANT USAGE ON SCHEMA appraiser TO dbuser;
GRANT SELECT ON ALL TABLES IN SCHEMA appraiser TO dbuser;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA appraiser TO dbuser;
GRANT SELECT,INSERT,DELETE ON SCHEMA appraiser TO dbuser;
GRANT SELECT,INSERT,DELETE ON appraiser.tables TO dbuser;
GRANT SELECT,USAGE,UPDATE ON appraiser.tables_id_seq TO dbuser;
GRANT ALL ON SCHEMA appraiser TO dbuser;

GRANT ALL ON SCHEMA appraiser TO postgres;
GRANT ALL ON SCHEMA appraiser TO dbuser;
GRANT SELECT ON ALL TABLES IN SCHEMA appraiser TO dbuser;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA appraiser TO dbuser;
GRANT SELECT,INSERT,DELETE ON SCHEMA appraiser TO dbuser;
CREATE TABLE appraiser..tables( id serial NOT NULL, name character varying(200), alias varchar(200),state varchar(2),pid int,tid int,filename varchar(200), geometrytype character varying(50), filetype character varying(50),  date_loaded timestamp without time zone, numtuples int default 0, type int default 0	)	WITH (	  OIDS=FALSE	);
ALTER TABLE appraiser.tables OWNER TO postgres;
GRANT ALL ON TABLE appraiser.tables TO postgres;
GRANT SELECT,INSERT, DELETE ON TABLE appraiser.tables TO dbuser;
GRANT SELECT,INSERT, DELETE ON appraiser.tables TO dbuser;
GRANT SELECT,USAGE,UPDATE ON appraiser.tables_id_seq TO dbuser;
CREATE TABLE appraiser.projects( id serial NOT NULL, username varchar(200),created_date timestamp without time zone, modified_date timestamp without time zone,name varchar(200) NOT NULL,state varchar(2) NOT NULL, primary key(name,state))	WITH (	  OIDS=FALSE	);
ALTER TABLE appraiser.projects OWNER TO postgres;
GRANT ALL ON TABLE appraiser.projects TO postgres;
GRANT SELECT,INSERT, DELETE ON TABLE appraiser.projects TO dbuser;
GRANT SELECT,INSERT, DELETE ON appraiser.projects TO dbuser;
GRANT SELECT,USAGE,UPDATE ON appraiser.projects_id_seq TO dbuser;
GRANT ALL ON SCHEMA appraiser TO dbuser;

