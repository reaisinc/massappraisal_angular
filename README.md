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
