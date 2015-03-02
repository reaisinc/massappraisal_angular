PG Functions converting character fields to numeric (int or double)
CREATE OR REPLACE FUNCTION public.isdouble(text) RETURNS BOOLEAN AS $$
DECLARE x DOUBLE PRECISION;
BEGIN
    x = $1::double precision;
    RETURN TRUE;
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.isint(text) RETURNS BOOLEAN AS $$
DECLARE x int;
BEGIN
    x = $1::int;
    RETURN TRUE;
EXCEPTION WHEN others THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.tonumeric(fieldname text,tablename text) RETURNS BOOLEAN AS $$
DECLARE cnt boolean;
BEGIN
  EXECUTE 'SELECT bool_and(distinct public.isint(' || fieldname || ')) from ' || tablename into cnt ;
 IF cnt THEN
    EXECUTE 'alter table ' || tablename || ' alter column ' || fieldname || ' type int using '|| fieldname || '::bigint';
    RETURN true;
 END IF;
 EXECUTE 'SELECT bool_and(distinct public.isdouble('||fieldname || ')) from ' || tablename into cnt;
 IF cnt THEN
    EXECUTE 'alter table ' || tablename || ' alter column ' || fieldname || ' type double precision using ' || fieldname || '::double precision';
    RETURN true;
 END IF;
 RETURN false;
END;
$$ LANGUAGE plpgsql;


select public.tonumeric('acres','r_stats');

CREATE OR REPLACE FUNCTION public.update_unique(_sch text, _tbl text,_alttbl text DEFAULT NULL)
  RETURNS SETOF void AS
$BODY$
DECLARE
var_match RECORD;
columnsql text;

BEGIN
  IF _alttbl IS NULL THEN
   _alttbl=_tbl;
  END IF;

  columnsql := format('SELECT column_name from information_schema.columns where table_schema=%L and table_name=''%s''',_sch,_tbl);
  FOR var_match IN EXECUTE(columnsql) LOOP
        EXECUTE format('UPDATE %s.%s_vars SET uniqueid = (select case when count(distinct("%s"))=count(*) then 1 else 0 end from %s.%s) where name = ''%s''',_sch,_alttbl,var_match.column_name,_sch,_tbl,var_match.column_name); 
  END LOOP;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
  
ALTER FUNCTION update_unique(text, text, text)
  OWNER TO postgres;

CREATE FUNCTION public.is_valid_date(text) returns boolean language plpgsql immutable as $$
begin
  return case when $1::date is null then false else true end;
exception when others then
  return false;
end;$$;

CREATE OR REPLACE FUNCTION public.update_saledate(_sch text, _tbl text)
  RETURNS SETOF void AS
$BODY$
DECLARE
var_match RECORD;
columnsql text;
c boolean;
BEGIN
  columnsql := format('SELECT column_name from information_schema.columns where data_type in(''text'',''character varying'') and table_schema=%L and table_name=''%s''',_sch,_tbl);
  --raise notice '%', columnsql;
  FOR var_match IN EXECUTE(columnsql) LOOP
   EXECUTE format('select public.is_valid_date("%s") from %s.%s',var_match.column_name,_sch,_tbl) into c; 
   
IF c THEN
     BEGIN
      EXECUTE format('ALTER TABLE %s.%s ALTER COLUMN "%s" SET DATA TYPE timestamp with time zone using cast("%s"::date as timestamp)',_sch,_tbl,var_match.column_name,var_match.column_name);
exception when others then
END

--EXECUTE format('ALTER TABLE %s.%s ALTER COLUMN "%s" SET DATA TYPE integer using cast(extract(epoch from cast("%s"::date as timestamp)) as integer)',_sch,_tbl,var_match.column_name,var_match.column_name);
      --raise notice 'Found: %', var_match.column_name;
      --raise notice 'Found: %', format('ALTER TABLE %s.%s ALTER COLUMN "%s" SET DATA TYPE timestamp with time zone using cast("%s"::date as timestamp)',_sch,_tbl,var_match.column_name,var_match.column_name);
   --ELSE
   -- raise notice 'Not found: %', var_match.column_name;
   END IF; 
      --EXECUTE format('UPDATE %s.%s_vars SET saledate = (select case when public.is_valid_date("%s") then 0 else 2 end from %s.%s) where name = ''%s''',_sch,_tbl,var_match.column_name,_sch,_tbl,var_match.column_name); 
  END LOOP;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION update_saledate(text, text)
  OWNER TO postgres;

CREATE OR REPLACE FUNCTION public.update_saledate_to_int(_sch text, _tbl text)
  RETURNS SETOF void AS
$BODY$
DECLARE
var_match RECORD;
columnsql text;
c boolean;
BEGIN
  columnsql := format('SELECT column_name from information_schema.columns where data_type in(''timestamp with time zone'') and table_schema=%L and table_name=''%s''',_sch,_tbl);
  --raise notice '%', columnsql;
  FOR var_match IN EXECUTE(columnsql) LOOP
       EXECUTE format('ALTER TABLE %s.%s ALTER COLUMN "%s" SET DATA TYPE integer using cast(extract(epoch from "%s") as integer)',_sch,_tbl,var_match.column_name,var_match.column_name);
      --raise notice 'Found: %', var_match.column_name;
  END LOOP;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION update_saledate_to_int(text, text)
  OWNER TO postgres;

--cast(extract(epoch from "sale date") as integer)
--to_char(to_timestamp(cast(extract(epoch from "sale date") as integer)),'mm/dd/yyyy')

CREATE FUNCTION merge_db(key varchar(40), data integer) RETURNS VOID AS
    $$ -- souce: http://stackoverflow.com/questions/1109061/insert-on-duplicate-update-postgresql
    BEGIN
        LOOP
            -- first try to update the key
            UPDATE test4 SET count = data WHERE name = key;
            IF found THEN
                RETURN;
            END IF;-- not there, so try to insert the key -- if someone else inserts the same key concurrently,        -- we could get a unique-key failure
            BEGIN
                INSERT INTO test4(name,count) VALUES (key, data);
                RETURN;
            EXCEPTION WHEN unique_violation THEN-- do nothing, and loop to try the UPDATE again
            END;
        END LOOP;
    END;
    $$
    LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_stats_view(schName varchar,objectName varchar) RETURNS integer AS $$
DECLARE
    isTable integer;
    isView integer;
    tblName text;
    
BEGIN
    tblName=objectName||'_stats';
    SELECT INTO isTable count(*) FROM pg_tables where schemaname=schName and tablename=tblName;
    SELECT INTO isView count(*) FROM pg_views where schemaname=schName and  viewname=tblName;

    IF isTable = 1 THEN
    	execute 'DROP TABLE IF EXISTS ' || schName || '.' || objectName || '_init';
    	execute 'ALTER TABLE ' || schName || '.' || objectName || '_stats RENAME to ' || objectName || '_init';
    	RETURN 1;
    END IF;
    IF isView = 1 THEN
    	execute 'DROP VIEW ' || schName || '.' || objectName;
    	RETURN 2;
    END IF;

    RETURN 0;

END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION delete_table_or_view(schName varchar,objectName varchar) RETURNS integer AS $$
DECLARE
    isTable integer;
    isView integer;
BEGIN
    SELECT INTO isTable count(*) FROM pg_tables where schemaname=schName and tablename=objectName;
    SELECT INTO isView count(*) FROM pg_views where schemaname=schName and  viewname=objectName;

    IF isTable = 1 THEN
    	execute 'DROP TABLE ' || objectName;
    	RETURN 1;
    END IF;

    IF isView = 1 THEN
    	execute 'DROP VIEW ' || objectName;
    	RETURN 2;
    END IF;

    RETURN 0;

END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION table_or_view(schName varchar,objectName varchar) RETURNS integer AS $$
DECLARE
    isTable integer;
    isView integer;
BEGIN
    SELECT INTO isTable count(*) FROM pg_tables where schemaname=schName and tablename=objectName;
    SELECT INTO isView count(*) FROM pg_views where schemaname=schName and  viewname=objectName;

    IF isTable = 1 THEN
    	--execute 'DROP TABLE ' || objectName;
    	RETURN 1;
    END IF;

    IF isView = 1 THEN
    	--execute 'DROP VIEW ' || objectName;
    	RETURN 2;
    END IF;

    RETURN 0;

END;
$$ LANGUAGE plpgsql;

------------------------------------------------------------------------------
Production functions
------------------------------------------------------------------------------
-- Function: r_table_summary(text, text)

-- DROP FUNCTION r_table_summary(text, text);

CREATE OR REPLACE FUNCTION public.r_table_summary(IN fieldnames text, IN tablename text)
  RETURNS TABLE(name text, vars double precision, n double precision, mean double precision, sd double precision, median double precision, trimmed double precision, mad double precision, min double precision, max double precision, range double precision, se double precision) AS
$BODY$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
#attach(salescomps) #make fields global
library(psych)
#out=summary(salescomps)
#out=round(cor(mydata,use="pairwise"),2)
#cbind(attributes(out)$dimnames[[2]],out)
#lapply(salescomps,function(salescomps) rbind(summary(salescomps)))
#cbind(x)
#cbind(out)
cbind(names(salescomps),round(describe(salescomps,na.rm = TRUE,skew=FALSE),2))
$BODY$
  LANGUAGE plr VOLATILE
  COST 100
  ROWS 1000;
ALTER FUNCTION public.r_table_summary(text, text)
  OWNER TO postgres;
GRANT EXECUTE ON FUNCTION public.r_table_summary(text, text) TO public;
GRANT EXECUTE ON FUNCTION public.r_table_summary(text, text) TO postgres;

GRANT EXECUTE ON FUNCTION public.r_table_summary(text, text) TO dbuser;

-- Function: r_correlation_variables(text, text)

-- DROP FUNCTION r_correlation_variables(text, text);



CREATE OR REPLACE FUNCTION public.r_correlation_variables(IN vars text, IN tablename text, OUT text)
  RETURNS text AS
$BODY$
sql <- paste("select ",vars," from ",tablename)
salescomps <<- pg.spi.exec(sql)
#fields=names(salescomps)

library(usdm)
library(RJSONIO)
c=cor(salescomps)
names(salescomps) <- make.names(names(salescomps), unique=TRUE)
v=vifstep(salescomps,th=10)
res=list("cor"=c,"vif"=gsub('[.]'," ",v@results$Variables))
toJSON(res)

#v@results$VIF[is.infinite(v@results$VIF)] <- 100
#x <- list()
#for (i in 1:length(v@results$Variables)) {
#   x[[ gsub('[.]'," ",array(v@results$Variables[i])[1]) ]] <- v@results$VIF[i]
#}

#"fields"=fields,
#cbind(gsub('[.]'," ",v@results$Variables),v@results$VIF)
#c(cor(salescomps))
#v@results$VIF
#remove null values
#salescomps <- na.omit(salescomps)
#names=names(salescomps)
#depvar=names[1]
#create string for dependent variable plus independents.
#c = cor(salescomps)
#nm=sprintf("`%s` ~ `%s`",depvar,paste(names[-c(1)],collapse="` + `"))
#model = lm(depvar ~ ., data=salescomps)
#v=vifcor(salescomps[-1])

#lst=list(labels(salescomps)[2],cor(salescomps))
#cbind(names(out$coefficients),out$coefficients)
$BODY$
  LANGUAGE plr VOLATILE
  COST 100;

select * from public.r_correlation_variables('parcel_ac,acres_tota,"Air temperature","All Crop Prod Index","Average precipitation","Drought Index","Elevation","Frost free days","Init Subsidence",parcel_bv,parcel_lv,parcel_tv,"Prod Index","Range Forage","Range Potential",sale_acres,sale_ppa,sale_price,"Slope","Total Subsidence"','reaisincva.homesites_stats');



-- Function: r_regression_variables(text, text, text, integer, integer)

-- DROP FUNCTION r_regression_variables(text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.r_regression_variables(IN depvar text, IN indvars text, IN tablename text, IN w integer DEFAULT 0, IN h integer DEFAULT 0, OUT text)
  RETURNS text AS
$BODY$
 sql <- paste("select ",depvar,",",indvars," from ",tablename)
 salescomps <<- pg.spi.exec(sql)

 #remove null values
# salescomps <- na.omit(salescomps)
 names=names(salescomps)
 #create string for dependent variable plus independents.
 #nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1)],collapse="` + `"))
 #model = lm(nm, data=salescomps)
model=lm(sprintf("%s ~ .",names[1]), data=salescomps) 
s=summary(model)
 library(RJSONIO)

 labels=unlist(labels(s$coefficients)[1])
 labels[1]=depvar
 if(w>0) {
  library(RGtk2)
  library(cairoDevice)
  library(RCurl)

   pixmap <- gdkPixmapNew(w=500, h=300, depth=24)
  asCairoDevice(pixmap)
  
  myplot=plot(model,which=c(1))
  print(myplot)
  plot_pixbuf <- gdkPixbufGetFromDrawable(NULL, pixmap,pixmap$getColormap(),0, 0, 0, 0, 500,300)
  buffer <- gdkPixbufSaveToBufferv(plot_pixbuf, "png",character(0),character(0))$buffer
   lst=list("plot"=base64(buffer),"names"=gsub('["`]', "", labels),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
 }
 else {
  lst=list("names"=gsub('["`]', "", labels),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
 }


 toJSON(lst)

 $BODY$
  LANGUAGE plr VOLATILE
  COST 100;
ALTER FUNCTION public.r_regression_variables(text, text, text, integer, integer)
  OWNER TO postgres;



-- Function: r_regression_variables(text, text, text)

-- DROP FUNCTION r_regression_variables(text, text, text);

CREATE OR REPLACE FUNCTION public.r_regression_variables(IN depvar text, IN indvars text, IN tablename text, OUT text)
  RETURNS text AS
$BODY$
sql <- paste("select ",depvar,",",indvars," from ",tablename)
salescomps <<- pg.spi.exec(sql)
#remove null values
salescomps <- na.omit(salescomps)
names=names(salescomps)
#depvar=names[1]
#create string for dependent variable plus independents.
#nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1)],collapse="` + `"))
#model = lm(nm, data=salescomps)

model=lm(sprintf("%s ~ .",names[1]), data=salescomps) 

s=summary(model)
library(RJSONIO)
labels=unlist(labels(s$coefficients)[1])
labels[1]=depvar

lst=list("names"=gsub("`", "", labels),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
toJSON(lst)
#cbind(names(out$coefficients),out$coefficients)
$BODY$
  LANGUAGE plr VOLATILE
  COST 100;
ALTER FUNCTION public.r_regression_variables(text, text, text)
  OWNER TO postgres;


-- Function: r_step_regression_variables(text, text, text, integer, integer)

-- DROP FUNCTION r_step_regression_variables(text, text, text, integer, integer);

CREATE OR REPLACE FUNCTION public.r_step_regression_variables(IN depvar text, IN indvars text, IN tablename text, IN w integer DEFAULT 0, IN h integer DEFAULT 0, OUT text)
  RETURNS text AS
$BODY$
 sql <- paste("select ",depvar,",",indvars," from ",tablename)
 salescomps <<- pg.spi.exec(sql)

 #remove null values
 salescomps <- na.omit(salescomps)
 names=names(salescomps)
 #create string for dependent variable plus independents.
 #nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1)],collapse="` + `"))

# model = lm(nm, data=salescomps)

model=lm(sprintf("%s ~ .",names[1]), data=salescomps) 

 out=step(model, direction="backward")
 s=summary(out)

 library(RJSONIO)

 labels=unlist(labels(s$coefficients)[1])
 labels[1]=depvar
 if(w>0) {
  library(RGtk2)
  library(cairoDevice)
  library(RCurl)

   pixmap <- gdkPixmapNew(w=500, h=300, depth=24)
  asCairoDevice(pixmap)
  
  myplot=plot(out,which=c(1))
  print(myplot)
  plot_pixbuf <- gdkPixbufGetFromDrawable(NULL, pixmap,pixmap$getColormap(),0, 0, 0, 0, 500,300)
  buffer <- gdkPixbufSaveToBufferv(plot_pixbuf, "png",character(0),character(0))$buffer
   lst=list("plot"=base64(buffer),"names"=gsub('["`]', "", labels),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
 }
 else {
  lst=list("names"=gsub('["`]', "", labels),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
 }


 toJSON(lst)

 $BODY$
  LANGUAGE plr VOLATILE
  COST 100;
ALTER FUNCTION public.r_step_regression_variables(text, text, text, integer, integer)
  OWNER TO postgres;




-- Function: r_step_regression_variables(text, text, text)

-- DROP FUNCTION r_step_regression_variables(text, text, text);

CREATE OR REPLACE FUNCTION public.r_step_regression_variables(IN depvar text, IN indvars text, IN tablename text, OUT text)
  RETURNS text AS
$BODY$
sql <- paste("select ",depvar,",",indvars," from ",tablename)
salescomps <<- pg.spi.exec(sql)

#remove null values
salescomps <- na.omit(salescomps)
names=names(salescomps)
#create string for dependent variable plus independents.
#nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1)],collapse="` + `"))
#model = lm(nm, data=salescomps)

model=lm(sprintf("%s ~ .",names[1]), data=salescomps) 

out=step(model, direction="backward")
s=summary(out)

library(RJSONIO)
labels=unlist(labels(s$coefficients)[1])
labels[1]=depvar

lst=list("names"=gsub('["`]', "", labels),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)

toJSON(lst)

$BODY$
  LANGUAGE plr VOLATILE
  COST 100;
ALTER FUNCTION public.r_step_regression_variables(text, text, text)
  OWNER TO postgres;
























=--unused-=
R Function for printing summary (min,max,stddev,etc)
CREATE OR REPLACE FUNCTION public.r_table_summary(in fieldnames text,in tablename text)
RETURNS TABLE (name text,vars double precision, n double precision,mean double precision,sd double precision,median double precision,trimmed double precision,mad double precision,min double precision,max double precision,range double precision,se double precision) AS
$$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
attach(salescomps) #make fields global
library(psych)
cbind(names(salescomps),round(describe(salescomps,na.rm = TRUE,skew=FALSE),2))
$$
language 'plr'; 

Ex:
select * from public.r_table_summary('priceac,"sale date",acres,paved,quality','reaisincva.r');
select * from public.r_table_summary('id,sale_price,parcel_ac,parcel_lv,parcel_bv,parcel_tv,sale_acres,sale_ppa,elevation,climate_zn,_acres_total as acres_total,"Slope","Elevation","Prod Index","Range Potential","Drought Index","All Crop Prod Index"', 'reaisincva.homesites_stats');

R Function for printing correlation matrix

CREATE OR REPLACE FUNCTION public.r_table_cor(in fieldnames text,in tablename text)
returns setof record as
$$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
attach(salescomps) #make fields global
cr = round(cor(salescomps),4)
cbind(names(salescomps),cr)

$$
language 'plr'; 

Ex:
select * from public.r_table_cor('priceac,"sale date",acres,paved,quality','reaisincva.r_stats') s(name text,priceac double precision,"sale date" double precision,acres double precision,paved double precision,quality double precision)

R Function returning plot graphic

CREATE OR REPLACE FUNCTION plot() RETURNS bytea AS $$
library(RGtk2)
library(cairoDevice)
x <- 1:10
y <- 1+x+rnorm(10,0,1)
pixmap <- gdkPixmapNew(w=500, h=500, depth=24)
asCairoDevice(pixmap)

myplot=plot(x,y)
print(myplot)
plot_pixbuf <- gdkPixbufGetFromDrawable(NULL, pixmap,pixmap$getColormap(),0, 0, 0, 0, 500, 500)
buffer <- gdkPixbufSaveToBufferv(plot_pixbuf, "png",character(0),character(0))$buffer
return(buffer)
$$ LANGUAGE plr;
select plot();

R Function for printing regression

CREATE OR REPLACE FUNCTION public.r_table_regression_summary(in fieldnames text,in tablename text) 
RETURNS text AS
$$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
attach(salescomps) #make fields global
#remove null values
salescomps <- na.omit(salescomps)
names=names(salescomps)
depvar=names[2]
#create string for dependent variable plus independents.
nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1,2)],collapse="` + `"))
model = lm(nm, data=salescomps)
s=summary(model)
lst=list("nm"=gsub("`", '"', nm),"call"=gsub("`", '"', paste(s$call[2])),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
library(RJSONIO)
toJSON(lst)

#out=step(model, direction="backward")
#cll=paste(capture.output(s$call[2]), sep =" ", collapse=" ")
#reportoutput <- sprintf("%s",paste(capture.output(lst), sep =" ", collapse="\n  "))
#return lst
#return(reportoutput)

$$
language 'plr'; 

select * from public.r_table_regression_summary('id,priceac,"sale date",acres,paved,quality','reaisincva.r_stats');

R Function for printing stepwise regression

drop function public.r_table_stepwise_regression_summary(in fieldnames text,in tablename text) ;

CREATE OR REPLACE FUNCTION public.r_table_stepwise_regression_summary(in fieldnames text,in tablename text) 
RETURNS text AS
$$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
attach(salescomps) #make fields global
#remove null values
salescomps <- na.omit(salescomps)
names=names(salescomps)
depvar=names[2]
#create string for dependent variable plus independents.
nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1,2)],collapse="` + `"))
model = lm(nm, data=salescomps)
out=step(model, direction="backward")
s=summary(out)
#cll=paste(capture.output(s$call[2]), sep =" ", collapse=" ")

lst=list("nm"=gsub("`", '"', nm),"call"=gsub("`", '"', paste(s$call[2])),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)

#reportoutput <- sprintf("%s",paste(capture.output(lst), sep =" ", collapse="\n  "))
#return lst
#return(reportoutput)

library(RJSONIO)
toJSON(lst)
$$
language 'plr'; 

select * from public.r_table_stepwise_regression_summary('id,priceac,"sale date",acres,paved,quality','reaisincva.r_stats');


R Function for printing stepwise regression coefficients

CREATE OR REPLACE FUNCTION public.r_table_stepwise_regression_coefficients(in fieldnames text,in tablename text,out text,out double precision) 
returns setof record as
$$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
attach(salescomps) #make fields global
#remove null values
salescomps <- na.omit(salescomps)
names=names(salescomps)
depvar=names[2]
#create string for dependent variable plus independents.
nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1,2)],sep="`,`",collapse="` + `"))
model = lm(nm, data=salescomps)
out=step(model, direction="backward")
s=summary(out)
names=names(s$coefficients[,1])
names[1]=""
names=gsub("`", '"', names)

ret = cbind(names,s$coefficients[,1])
ret
#s$coefficients
#cll=paste(capture.output(s$call[2]), sep =" ", collapse=" ")
#lst=list("nm"=nm,"call"=paste(s$call[2]),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
#reportoutput <- sprintf("%s",paste(capture.output(lst), sep =" ", collapse="\n  "))
#return lst
#return(reportoutput)
#library(RJSONIO)
#toJSON(s$coefficients)
$$
language 'plr'; 

select * from public.r_table_stepwise_regression_coefficients('id,priceac,"sale date" as sale_date,acres,paved,quality','reaisincva.r_stats');

R Function for printing regression residuals-unfinished

CREATE OR REPLACE FUNCTION public.r_table_stepwise_regression_residuals(in fieldnames text,in tablename text,out text,out double precision) 
returns setof record as
$$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
attach(salescomps) #make fields global
#remove null values
salescomps <- na.omit(salescomps)
names=names(salescomps)
depvar=names[2]
#create string for dependent variable plus independents.
nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1,2)],sep="`,`",collapse="` + `"))
model = lm(nm, data=salescomps)
out=step(model, direction="backward")
s=summary(out)
names=names(s$coefficients[,1])
names[1]=depvar
names=gsub("`", '"', names)
ret = cbind(names,s$coefficients[,1])
ret

#s$coefficients
#cll=paste(capture.output(s$call[2]), sep =" ", collapse=" ")
#lst=list("nm"=nm,"call"=paste(s$call[2]),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
#reportoutput <- sprintf("%s",paste(capture.output(lst), sep =" ", collapse="\n  "))
#return lst
#return(reportoutput)
#library(RJSONIO)
#toJSON(s$coefficients)
$$
language 'plr'; 

select * from public.r_table_stepwise_regression_residuals('id,priceac,"sale date",acres,paved,quality','reaisincva.r_stats');

R Function for printing regression residuals predictions

CREATE OR REPLACE FUNCTION public.r_table_stepwise_regression_predict(in fieldnames text,in tablename text) 
RETURNS text AS
$$
sql <- paste("select ",fieldnames," from ",tablename)
salescomps <<- pg.spi.exec(sql)
attach(salescomps) #make fields global
#remove null values
salescomps <- na.omit(salescomps)
names=names(salescomps)
depvar=names[2]
#create string for dependent variable plus independents.
nm=sprintf("%s ~ `%s`",depvar,paste(names[-c(1,2)],collapse="` + `"))
model = lm(nm, data=salescomps)
out=step(model, direction="backward")
s=summary(out)

lst=list("nm"=gsub("`", '"', nm),"call"=gsub("`", '"', paste(s$call[2])),"coef"=s$coefficients,"rsquared"=s$r.squared,"adjrsquared"=s$adj.r.squared,"fstats"=s$fstatistic,"stderr"=s$sigma)
library(RJSONIO)
toJSON(lst)

#cll=paste(capture.output(s$call[2]), sep =" ", collapse=" ")
#lst=gsub("`", '"', lst)
#reportoutput <- sprintf("%s",paste(capture.output(lst), sep =" ", collapse="\n  "))
#return lst
#return(reportoutput)

$$
language 'plr'; 

select * from public.r_table_stepwise_regression_predict('id,priceac,"sale date",acres,paved,quality','reaisincva.r_stats');



