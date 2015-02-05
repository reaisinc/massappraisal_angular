
$(document).ready( function() {

    $("#inputs").click(function(evt){
    	evt.preventDefault();
    	$("#fupload").toggle();
    	$("#files").val("");
    });
    var map = new L.Map('map');//, {center: center, zoom: 12, maxZoom: 20});
    map.fitBounds([
                   [extent[1],extent[0]],
                   [extent[3],extent[2]]
               ]);
    //var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    //var osmAttrib='Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
    //var street_layer = new L.TileLayer(osmUrl, { maxZoom: 19, attribution: osmAttrib});
    var Streets= new L.TileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png", {maxZoom: 19}).addTo(map);
    var Aerial=new L.TileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png", {maxZoom: 19});
    var Topo=new L.TileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.png", {maxZoom: 19});
    				
    //var baseMaps = { "ESRI Streets": Streets, "ESRI Aerial":Aerial, "ESRI Topo":Topo , "OpenStreet": street_layer};

	//$('#files').bind('change', handleFileSelect);
	//map.addLayers([parcelLayer]);
	var parcelLayer = L.tileLayer.wms('/map', {
	    format: 'image/png',
	    transparent: true,
	    opacity: 0.7,
        srs: 'EPSG:3857',
	    layers: layerName
	}).addTo(map);

	L.control.scale({metric:false}).addTo(map);

});
  
