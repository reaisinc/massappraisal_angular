CREATE DATABASE soils
  WITH OWNER = postgres
       ENCODING = 'UTF8'
       TABLESPACE = pg_default
       LC_COLLATE = 'English_United States.1252'
       LC_CTYPE = 'English_United States.1252'
       CONNECTION LIMIT = -1;

ALTER DATABASE soils
  SET search_path = "$user", public, topology, tiger;

CREATE EXTENSION postgis;
CREATE EXTENSION plr;

CREATE ROLE dbuser LOGIN
  ENCRYPTED PASSWORD 'md50e5ffb9d5f02a6b89e3c70343bdf19db'
  NOSUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION;


CREATE TABLE session
(
  sid character varying NOT NULL,
  sess json NOT NULL,
  expire timestamp(6) without time zone NOT NULL,
  CONSTRAINT session_pkey PRIMARY KEY (sid)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE session
  OWNER TO postgres;
GRANT ALL ON TABLE session TO postgres;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE session TO dbuser;

GRANT EXECUTE ON FUNCTION  public.isdouble(text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.isint(text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.tonumeric(fieldname text,tablename text)  TO dbuser;

GRANT EXECUTE ON FUNCTION  public.r_table_summary(in fieldnames text,in tablename text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.r_table_cor(in fieldnames text,in tablename text)  TO dbuser;
GRANT EXECUTE ON FUNCTION  public.r_table_regression_summary(in fieldnames text,in tablename text)   TO dbuser;
GRANT EXECUTE ON FUNCTION  public.isdouble(text)  TO dbuser;

CREATE TABLE users
(
  id serial,
  username text NOT NULL,
  password text NOT NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE users
  OWNER TO postgres;
GRANT ALL ON TABLE users TO postgres;
GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE users TO dbuser;

-- Index: users_username_password

-- DROP INDEX users_username_password;

CREATE INDEX users_username_password
  ON users
  USING btree
  (username COLLATE pg_catalog."default", password COLLATE pg_catalog."default");



--Create a new user
CREATE SCHEMA <username>
  AUTHORIZATION postgres;

GRANT ALL ON SCHEMA <username> TO postgres;
GRANT ALL ON SCHEMA <username> TO dbuser;


Public tables:



GRANT USAGE ON SCHEMA az TO dbuser;
GRANT SELECT ON ALL TABLES IN SCHEMA az TO dbuser;

GRANT USAGE ON SCHEMA reaisincva TO dbuser;
GRANT SELECT ON ALL TABLES IN SCHEMA reaisincva TO dbuser;
GRANT SELECT ON ALL SEQUENCES IN SCHEMA reaisincva TO dbuser;
GRANT SELECT,INSERT,DELETE ON SCHEMA reaisincva TO dbuser;
GRANT USAGE ON public.session TO dbuser;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.session TO dbuser;
GRANT SELECT,INSERT,DELETE ON reaisincva.tables TO dbuser;
GRANT SELECT,USAGE,UPDATE ON reaisincva.tables_id_seq TO dbuser;
GRANT ALL ON SCHEMA reaisincva TO dbuser;


