
SET GDAL_HOME=C:\enide\ws\src\release-1600-x64-dev\release-1600
SET PYTHON_HOME=c:\python27
SET NODE_HOME=c:\node


SET GDAL_DATA=%GDAL_HOME%\bin\gdal-data
SET GDAL_DRIVER_PATH=%GDAL_HOME%\bin\gdal\plugins
set PROJ_LIB=%GDAL_HOME%\bin\proj
set path=C:\windows;c:\windows\system32\;%GDAL_HOME%\bin;%GDAL_HOME%\bin\gdal\apps\;%PYTHON_HOME%;%NODE_HOME%
rem set GDAL_DATA=C:\PostgreSQL93\gdal-data

node app.js