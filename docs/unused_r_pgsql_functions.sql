--Packages used:
--install.packages('psych')
--install.packages('usdm')
--install.packages('RJSONIO')
--install.packages('RGtk2')
--install.packages('cairoDevice')
--install.packages('RCurl')

-note: have to make dbuser a superuser to set the
alter user dbuser with superuser;
ALTER ROLE dbuser SET search_path TO reaisincva,public;
ALTER ROLE dbuser SET dynamic_library_path TO '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib:$libdir';


CREATE OR REPLACE FUNCTION plr_call_handler()
RETURNS LANGUAGE_HANDLER
AS '/plr' LANGUAGE C;

CREATE OR REPLACE FUNCTION plr_call_handler()
RETURNS LANGUAGE_HANDLER
AS '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib/plr' LANGUAGE C;

CREATE OR REPLACE LANGUAGE plr HANDLER plr_call_handler;
   


--PG Functions converting character fields to numeric (int or double)

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

ALTER FUNCTION tonumeric(text, text)
  OWNER TO postgres;
GRANT EXECUTE ON FUNCTION tonumeric(text, text) TO public;
GRANT EXECUTE ON FUNCTION tonumeric(text, text) TO postgres;
GRANT EXECUTE ON FUNCTION tonumeric(text, text) TO dbuser;


--select public.tonumeric('acres','r_stats');


------------------------------------------------------------------------------
--Production functions
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

--select * from public.r_correlation_variables('parcel_ac,acres_tota,"Air temperature","All Crop Prod Index","Average precipitation","Drought Index","Elevation","Frost free days","Init Subsidence",parcel_bv,parcel_lv,parcel_tv,"Prod Index","Range Forage","Range Potential",sale_acres,sale_ppa,sale_price,"Slope","Total Subsidence"','reaisincva.homesites_stats');



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


--more functions---
--CREATE OR REPLACE FUNCTION update_unique(_sch text, _tbl text)
--  RETURNS SETOF void AS
--$BODY$
--DECLARE
--var_match RECORD;
--columnsql text;
--BEGIN
--		columnsql := format('SELECT column_name from information_schema.columns where table_schema=%L and table_name=''%s_stats''',_sch,_tbl);
--		FOR var_match IN EXECUTE(columnsql) LOOP
--        EXECUTE format('UPDATE %s.%s_vars SET uniqueid = (select case when count(distinct("%s"))=count(*) then 1 else 0 end from %s.%s_stats) where name = ''%s''',_sch,_tbl,var_match.column_name,_sch,_tbl,var_match.column_name); 
--    END LOOP;
--END;
--$BODY$
--  LANGUAGE plpgsql VOLATILE
--  COST 100
--  ROWS 1000;
--ALTER FUNCTION update_unique(text, text)
--  OWNER TO postgres;
