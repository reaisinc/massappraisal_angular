# massappraisal
Mass appraisal Node.  Provides tools for doing multiple regression.

http://openshift.github.io/documentation/oo_cartridge_guide.html#nodejs

rhc scp  massappraisal upload plr.zip app-root/data

#Merge local git with openshift
git push ssh://54b1c9de5973ca47ad000163@massappraisal-reais.rhcloud.com/~/git/massappraisal.git/ master

http://arvelmhale.blogspot.com/2015/01/compiling-mapcache-node-mapserv-node.html
http://arvelmhale.blogspot.com/2015/01/installing-r-statistical-software-in.html

See docs folder for installation guides.

$OPENSHIFT_DATA_DIR
rpm2cpio $pkg.rpm | cpio -idmv

yum --installroot=$OPENSHIFT_DATA_DIR install $pkg.rpm

ftp://rpmfind.net/linux/epel/6/x86_64/R-3.1.2-1.el6.x86_64.rpm

# Install R
Download R to $OPENSHIFT_DATA_DIR
wget http://cran.wustl.edu/src/base/R-3/R-3.1.2.tar.gz

tar zvfz R-3.1.2.tar.gz
cd R-3.1.2

./configure --enable-R-shlib --prefix=$OPENSHIFT_DATA_DIR
make
make install DESTDIR=$OPENSHIFT_DATA_DIR

# Install PLR
Download plr from:
http://www.joeconway.com/plr/
wget http://www.joeconway.com/plr/plr-8.3.0.15.tar.gz
tar xvfz plr-8.3.0.15.tar.gz
cd plr
export R_HOME=$OPENSHIFT_DATA_DIR/src/R-3.1.2
---./configure --prefix=$OPENSHIFT_DATA_DIR/R-3.1.2
USE_PGXS=1 make
USE_PGXS=1 make install DESTDIR=$OPENSHIFT_DATA_DIR

objdump -x plr.so|grep RPATH
readelf -d plr.so | head -20


rhc env set PATH=/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/runtime/repo/node_modules/.bin:/var/lib/openshift/54b1c9de5973ca47ad000163/.node_modules/.bin:/opt/rh/node
js010/root/usr/bin:/opt/rh/postgresql92/root/usr/bin:/bin:/usr/bin:/usr/sbin:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/bin -a massappraisal

-rhc env set LD_LIBRARY_PATH=/opt/rh/postgresql92/root/usr/lib64:/opt/rh/nodejs010/root/usr/lib64:/opt/rh/v8314/root/usr/lib64:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R-3.1.2/lib:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/opt/rh/postgresql92/root/usr/lib64/pgsql/ -a massappraisal

rhc env set LD_LIBRARY_PATH=/opt/rh/postgresql92/root/usr/lib64:/opt/rh/nodejs010/root/usr/lib64:/opt/rh/v8314/root/usr/lib64:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib -a massappraisal

import os, sys
sys.path.append('/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/gyp/lib/python2.6/site-packages/')
import gyp

rhc env set PYTHONPATH=/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/gyp/lib/python2.6/site-packages/ -a massappraisal
--rhc env set R_HOME=/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R -a massappraisal
rhc env set R_HOME=/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/src/R-3.1.2 -a massappraisal
--rhc env set R_HOME=/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/lib64/R/bin -a massappraisal
--rhc env set GDAL_DATA=/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R-3.1.2 -a massappraisal

select plr_set_rhome('/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/') ;
select plr_set_rhome('/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/') ;

rhc app restart -a massappraisal


ln -s /var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R-3.1.2/lib/libR.so 
psql -f /var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/opt/rh/postgresql92/root/usr/share/pgsql/extension/plr.sql


ls /var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/opt/rh/postgresql92/root/usr/lib64/pgsql/plr.so

set dynamic_library_path = '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R-3.1.2/lib/:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/opt/rh/postgresql92/root/usr/lib64/pgsql/:$libdir';


set dynamic_library_path = '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R-3.1.2/lib/:$libdir';
set dynamic_library_path = '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib:$libdir';
set dynamic_library_path = '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/src/R-3.1.2:$libdir';

CREATE TYPE plr_environ_type AS (name text, value text);
CREATE OR REPLACE FUNCTION plr_environ ()
RETURNS SETOF plr_environ_type
AS '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib/plr','plr_environ'
LANGUAGE C;


ALTER ROLE dbuser SET search_path TO reaisincva,public;
--ALTER ROLE dbuser SET dynamic_library_path TO '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib:$libdir';
ALTER ROLE dbuser SET dynamic_library_path TO '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/src/R-3.1.2:$libdir';
select plr_set_rhome('/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/src/R-3.1.2') ;


Testing with install folder for R
rhc env set LD_LIBRARY_PATH=/opt/rh/postgresql92/root/usr/lib64:/opt/rh/nodejs010/root/usr/lib64:/opt/rh/v8314/root/usr/lib64:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib -a massappraisal
rhc env set R_HOME=/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/lib64/R -a massappraisal
select plr_set_rhome('/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/lib64/R') ;
set dynamic_library_path = '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/lib64/lib:$libdir';
ALTER ROLE dbuser SET dynamic_library_path TO '/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib:/var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/R/lib64/lib:$libdir';
rhc app restart -a massappraisal

#upload/download

rhc scp tileserver download ./ /var/lib/openshift/54510e5ce0b8cd182600047b/app-root/repo/node_modules/node-mapserv.zip
rhc scp tileserver download ./ /var/lib/openshift/54510e5ce0b8cd182600047b/app-root/data/lib/*

rhc scp massappraisal upload C:\enide\ws\openshift\lib.zip /var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/
rhc scp massappraisal upload  C:\enide\ws\openshift\node-mapserv.zip /var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/


rhc scp massappraisal download ./ /var/lib/openshift/54b1c9de5973ca47ad000163/app-root/data/lib.zip
rhc scp massappraisal download ./ /tmp/R.zip

rhc scp tileserver upload C:\enide\ws\openshift\lib.zip /var/lib/openshift/54510e5ce0b8cd182600047b/app-root/data/
rhc scp tileserver upload C:\enide\ws\openshift\R.zip /var/lib/openshift/54510e5ce0b8cd182600047b/app-root/data/
rhc env set LD_LIBRARY_PATH=/opt/rh/postgresql92/root/usr/lib64:/opt/rh/nodejs010/root/usr/lib64:/opt/rh/v8314/root/usr/lib64:/var/lib/openshift/54510e5ce0b8cd182600047b/app-root/data/lib -a tileserver

#nodejs

rhc scp nodejs upload C:\enide\ws\openshift\R-3.1.2.tar.gz /var/lib/openshift/545108f14382eceab50005e9/app-root/data/
rhc scp nodejs upload  C:\enide\ws\openshift\plr-8.3.0.15.tar.gz /var/lib/openshift/545108f14382eceab50005e9/app-root/data/



#nodejs
rhc env set R_HOME=/var/lib/openshift/545108f14382eceab50005e9/app-root/data/R/lib64/R/bin -a nodejs

rhc env set LD_LIBRARY_PATH=/opt/rh/postgresql92/root/usr/lib64:/opt/rh/nodejs010/root/usr/lib64:/opt/rh/v8314/root/usr/lib64:/var/lib/openshift/545108f14382eceab50005e9/app-root/data/R/lib64/R/lib -a nodejs

CREATE OR REPLACE FUNCTION plr_call_handler()
RETURNS LANGUAGE_HANDLER
AS '/var/lib/openshift/545108f14382eceab50005e9/app-root/data/R/lib64/R/lib/plr' LANGUAGE C;

CREATE OR REPLACE LANGUAGE plr HANDLER plr_call_handler;
   

CREATE TYPE plr_environ_type AS (name text, value text);
CREATE OR REPLACE FUNCTION plr_environ ()
RETURNS SETOF plr_environ_type
AS '/var/lib/openshift/545108f14382eceab50005e9/app-root/data/R/lib64/R/lib/plr','plr_environ'
LANGUAGE C;

-Wl,-rpath,/var/lib/openshift/545108f14382eceab50005e9/app-root/data/R/lib64/R/lib/

#copy from one schema to another

create table arvelmhale40.demodata14                     (LIKE reaisincva.demodata14                     INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.demodata14_stats               (LIKE reaisincva.demodata14_stats               INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.demodata14_vars                (LIKE reaisincva.demodata14_vars                INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.demodatasubject15              (LIKE reaisincva.demodatasubject15              INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.demodatasubject15_stats        (LIKE reaisincva.demodatasubject15_stats        INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.demodatasubject15_vars         (LIKE reaisincva.demodatasubject15_vars         INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.homesite_singlesubject18       (LIKE reaisincva.homesite_singlesubject18       INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.homesite_singlesubject18_stats (LIKE reaisincva.homesite_singlesubject18_stats INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.homesite_singlesubject18_vars  (LIKE reaisincva.homesite_singlesubject18_vars  INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.homesites17                    (LIKE reaisincva.homesites17                    INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.homesites17_stats              (LIKE reaisincva.homesites17_stats              INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.homesites17_vars               (LIKE reaisincva.homesites17_vars               INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.projects                       (LIKE reaisincva.projects                       INCLUDING CONSTRAINTS INCLUDING INDEXES) ;
create table arvelmhale40.tables                         (LIKE reaisincva.tables                         INCLUDING CONSTRAINTS INCLUDING INDEXES) ;


create table reaisincva.mupolygon as select a.* from az.mupolygon a,reaisincva.homesites150 b where b.wkb_geometry && a.wkb_geometry;
create table reaisincva.component as select a.* from az.component a,reaisincva.mupolygon b where b.mukey = a.mukey;
create table reaisincva.valu1 as select a.* from az.valu1 a,reaisincva.mupolygon b where b.mukey = a.mukey;
create table reaisincva.muaggatt as select a.* from az.muaggatt a,reaisincva.mupolygon b where b.mukey = a.mukey;

pg_dump -c -d soils -U postgres  -t reaisincva.mupolygon > soils.sql
pg_dump -c -d soils -U postgres  -t reaisincva.component >> soils.sql
pg_dump -c -d soils -U postgres  -t reaisincva.valu1 >> soils.sql
pg_dump -c -d soils -U postgres  -t reaisincva.muaggatt >> soils.sql

--load soils into PG
ogr2ogr -f Postgresql PG:"dbname=soils user=postgres password=postgres active_schema=wa" gssurgo_g_wa.gdb mupolygon  -nln mupolygon
ogr2ogr -f Postgresql PG:"dbname=soils user=postgres password=postgres active_schema=wa" gssurgo_g_wa.gdb muaggatt  -nln muaggatt
ogr2ogr -f Postgresql PG:"dbname=soils user=postgres password=postgres active_schema=wa" gssurgo_g_wa.gdb component  -nln component
ogr2ogr -f Postgresql PG:"dbname=soils user=postgres password=postgres active_schema=wa" valu_fy2014.gdb valu1  -nln valu1

 
 ogr2ogr -f Postgresql PG:"dbname=soils user=postgres password=postgres active_schema=reaisincva" "C:\massappraisal\chelan\sales\All sales 2013-2015.csv"  -nln chelan_sales -overwrite
 select public.update_saledate('reaisincva','chelan_sales');
 
 --add fields to _stats file
 select column_name,data_type from information_schema.columns where table_schema='reaisincva' and table_name = 'chelan_sales' and column_name not in('ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type not in('numeric','double precision','float','integer','decimal','timestamp with time zone') and
column_name not in(select column_name from information_schema.columns where table_schema='reaisincva' and table_name = 'parcels159_stats'); 

select 'public.tonumeric(''"'||column_name||'"'',''reaisincva.chelan_sales''),' from information_schema.columns where table_schema='reaisincva' and table_name = 'chelan_sales' and column_name not in('ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type not in('numeric','double precision','float','integer','decimal','timestamp with time zone') and
column_name not in(select column_name from information_schema.columns where table_schema='reaisincva' and table_name = 'parcels159_stats'); 

--now add all columns to parcel table _stats
select 'alter table reaisincva.parcels159_stats add "'||column_name||'" ' || data_type ||';update reaisincva.parcels159_stats set "'||column_name||'" =(select "'||column_name||'" from reaisincva.chelan_sales a where a.prop_id::numeric=reaisincva.parcels159_stats.prop_id' 
from information_schema.columns where table_schema='reaisincva' and table_name = 'chelan_sales' and column_name not in('ogc_fid','wkb_geometry','id','shape_leng','shape_area','_acres_total') and data_type not in('numeric','double precision','float','integer','decimal','timestamp with time zone') and
column_name not in(select column_name from information_schema.columns where table_schema='reaisincva' and table_name = 'parcels159_stats'); 

alter table reaisincva.parcel59_stats rename to reaisincva.parcel59_stats_init;

drop view reaisincva.chelan_sales_view;
create view reaisincva.chelan_sales_view as
SELECT DISTINCT ON (1) b.prop_id,b.sale_price, b.deed_date, b.sale_date, b.state_cd, b.situs_street_prefx, b.situs_street, b.situs_street_sufix, b.legal_acreage, b.living_area, b.basement_area, b.part_finish, b.minimal_finish, b."year built", b.width, b.length, b.bedrooms, b.bathrooms, b.heat_cool, b.number_of_units, b.garage_area, b.pool, b.fireplace, b.number_of_fireplaces, b.deed_type, b.reject_code, b.aff__, b.auditor_file__, b.market, b.buyer, b.seller, b."tax area" 
FROM chelan_sales b
LEFT JOIN chelan_sales a ON a.prop_id=b.prop_id;

drop view  reaisincva.parcels159_stats;
create view  reaisincva.parcels159_stats as select a.*,b.sale_price, b.deed_date, b.sale_date, b.state_cd, b.situs_street_prefx, b.situs_street, b.situs_street_sufix, b.legal_acreage, b.living_area, b.basement_area, b.part_finish, b.minimal_finish, b."year built", b.width, b.length, b.bedrooms, b.bathrooms, b.heat_cool, b.number_of_units, b.garage_area, b.pool, b.fireplace, b.number_of_fireplaces, b.deed_type, b.reject_code, b.aff__, b.auditor_file__, b.market, b.buyer, b.seller, b."tax area"   
 from reaisincva.parcels159_stats_init a,reaisincva.chelan_sales_view b where b.prop_id::numeric=a.prop_id;

insert into parcels159_vars(include,id,uniqueid,depvar,saledate,soils,name,type) 
(select 1 as include,0 as id,0 as uniqueid,0 as depvar,0 as saledate,0 as soils,column_name as name,data_type as type from information_schema.columns where table_schema='reaisincva' and table_name = 'chelan_sales' and data_type in('numeric','double precision','float','integer','decimal','timestamp with time zone') and column_name in ('sale_price','deed_date','sale_date','state_cd','situs_street_prefx','situs_street','situs_street_sufix','legal_acreage','living_area','basement_area','part_finish','minimal_finish','"year built"','width','length','bedrooms','bathrooms','heat_cool','number_of_units','garage_area','pool','fireplace','number_of_fireplaces','deed_type','reject_code','aff__','auditor_file__','market','buyer','seller','"tax area"'));


#Notes:
To merge sales data with parcels, you need to do the following:
-check to see if any fields from sales match fields in the parcels.  If so, update the field in parcels
-make sure sales date, sales price are in sales
-make sure there is an unique identifier linking the two tables
-create view containing data from both tables
-drop sales table prior to loading
-sales can be CSV format
-need to check for date fields and numeric fields.
-multiple sales files? only load the latest document id, ignore older sales
-add sales fields to _vars table
-update data in _stats table
-need to identify sales data and sales price (default dependent variable)


#need better procedures for soils
-ignore fields that are all blank
-convert character fields to numeric (serialize?)
-automatically remove fields that aren't meaningful
-use long names to describe fields -need to create weighted sums for parcels since they will contain multiple mkeys
-need to create better policy for determining relevance for real estate appraisal



#other items
-need to cache query results (memcached?) until dirty bit set (when field is checked/unchecked in summary or correlation page)
-store cached query in database, flush when dirty bit set, recreate on next request 
 				
 
 
 
