var coeff=[];
var file;
var vars;

/*
 * jQuery File Upload Plugin JS Example 8.9.1
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* global $, window */

$(function () {
	'use strict';

	// Initialize the jQuery File Upload widget:
	$('#fileupload').fileupload({
		// Uncomment the following to send cross-domain cookies:
		//xhrFields: {withCredentials: true},
		url: '/upload'
	});

	// Enable iframe cross-domain access via redirect option:
	$('#fileupload').fileupload(
			'option',
			'redirect',
			window.location.href.replace(
					/\/[^\/]*$/,
					'/cors/result.html?%s'
			)
	);

	//if (true||window.location.hostname === 'localhost'||window.location.hostname == '127.0.0.1') {
	// Demo settings:
	$('#fileupload').fileupload('option', {
		url: '/upload',
		// Enable image resizing, except for Android and Opera,
		// which actually support image resizing, but fail to
		// send Blob objects via XHR requests:
		//disableImageResize: /Android(?!.*Chrome)|Opera/
		//    .test(window.navigator.userAgent),
		maxFileSize: 250000000,
		acceptFileTypes: /(\.|\/)(shp|shx|dbf|prj|zip|csv|xls|xlsx)$/i
	}).on('stopped',
			function (e){
		console.log ("customEventName");            		
		verifyFiles();
	}
	);
	// Upload server status check for browsers with CORS support:
	if ($.support.cors) {
		$.ajax({
			url: '/',
			type: 'HEAD'
		}).fail(function () {
			$("#continueBtn").hide();
			$("#addBtn").hide();

			$('<div class="alert alert-danger"/>')
			.text('Upload server currently unavailable - ' +
					new Date())
					.appendTo('#fileupload');
		});
	}
	/*
    } else {
        // Load existing files:
        $('#fileupload')
        .on('stopped',
                function (e){
            		console.log ("customEventName");            		
            		verifyFiles();
        	}
        )
        .addClass('fileupload-processing');

        $.ajax({
            // Uncomment the following to send cross-domain cookies:
            //xhrFields: {withCredentials: true},
            url: $('#fileupload').fileupload('option', 'url'),
            dataType: 'json',
            context: $('#fileupload')[0]
        }).always(function () {
            $(this).removeClass('fileupload-processing');
        }).done(function (result) {
         		//console.log ("customEventName");            		
          	//verifyFiles();
						//verifyFiles();
						$('#fileupload').data("stopped",0)
            $(this).fileupload('option', 'done')
                .call(this, $.Event('done'), {result: result});
        });
    }
	 */
	/*
alert-success
alert-info
alert-warning
alert-danger 
	 */
	function verifyFiles()
	{
		console.log("Verify file upload: " + $('#fileupload').data("stopped"));
		if($('#fileupload').data("stopped")==1)return;
		$('#fileupload').data("stopped",1);
		var fileName = sessionStorage.getItem("filename");
		if(!fileName){
			$('<div class="alert alert-danger"/>')
			.text("Unable to upload data").appendTo('#fileupload');

			return;
		}
		var url ="/uploadfiles/" + fileName+"?sub=1&comp="+$("input[name='name']:checked").siblings().text();
		$("#fileName").html("<img src='../img/spinner_mac.gif'> Please wait...");

		$.getJSON(url, function(data) {
			var alert='success';
			$("#fileName").html("");
			//href="/load" class="btn btn-default btn-continue" id="continueBtn"
			if(data['file'])
				$("#continueBtn").prop("href","/loadsubject?type="+data['file']+(data["Geometry"]?"&stype="+data["Geometry"]:""));
			if(data['Extent']||data['Layer name'])
			{
				var message="<h3>Successfully uploaded files:</h3><b>Layer name:</b> " + data["Layer name"] 
				+ (data["Extent"]? "<br><b>Extent:</b> " + data["Extent"]:"")
				+ "<br><b>Count:</b> " + data["Feature Count"]
				+ "<br><b>File type:</b> " + data['file']
				+ "<br><b>Geometry type:</b> "  + data["Geometry"];

				$('<div class="alert alert-' + alert + '"/>')
				.html(message).appendTo('#fileupload');
				sessionStorage.setItem("tablename",data["Layer name"]);
				$("#continueBtn").show();
				if(data.Geometry=='None'){
					$("#continueBtn").text("Continue to summary").prop("href","/summary");
					//<a href="/load" class="btn btn-default btn-continue" id="">
				}
			}
			else{
				$('<div class="alert alert-danger"/>')
				.text("Unable to recognize valid data " + data.err?data.err:"").appendTo('#fileupload');

			}
		});

	};

});
function update(name)
{
	var tableName=sessionStorage.getItem("tablename");
	if(!tableName)
	{
		location.href='/';
		return;
	}
	//$("#nosw").change(function(){
	//	window.location.href="/residuals"+(this.checked?"?nosw=1":"");
	//});
	var nosw = $("#nosw").prop("checked");
	//var url="/uploadsubfiles/";
	//$('#summaryTable').bootstrapTable("showLoading");
	//var vars;
	$("#loader").show();
	$("#predictDiv").hide();
	$('#predictTable').bootstrapTable("destroy");
	$('#statsTable').bootstrapTable("destroy");
	$("#events-result").text("");
	$("#noswdiv").hide();


	//$('#summaryTable').bootstrapTable({
	//    url: url
	//});
	//?offset=0&limit=10&search=test
	$.getJSON("/predict/"+name+"/variables"+(nosw?"?nosw=1":""),function(data){
		vars = data.vars;
		var columns=[];//{field:"name",title:"",align:"right",class:"col"}];
		//for(var i=0;i<data.length;i++)
		//{
		//	columns.push({field:data[i].name,title:data[i].name,align:"right"});
		//}
		//var names=data.call.replace("~","+").replace(/"/g,"").split("+");
		var dummyvals=[];
		var obj={};
		data.vars.names[0]=data.vars.names[0].replace(/\"/g," ").trim();//.replace(/ /g,"_");
		coeff[data.vars.names[0]]=parseFloat(data.vars.coef[0]['Estimate']);
		for(var i=1;i<data.vars.names.length;i++)
		{
			//if(i!='total')
			data.vars.names[i]=data.vars.names[i].replace(/\"/g," ").trim();//.replace(/ /g,"_");
			columns.push({field:data.vars.names[i],title:data.vars.names[i],align:"right",formatter:nameFormatter});
			obj[data.vars.names[i]]=data.vars.names[i];
			coeff[data.vars.names[i]]=parseFloat(data.vars.coef[i]['Estimate']);

		}
		/*
	for(var i=1;i<names.length;i++){
		//data.coef[i]['name']=names[i].trim();
		names[i]=names[i].trim();
		//columns.push({field:data.coef[i].name,title:data.coef[i].name,align:"right"});
		columns.push({field:names[i],title:names[i],align:"right",formatter:nameFormatter});
		obj[names[i]]=names[i];
		coeff[names[i]]=parseFloat(data.coef[i]['Estimate']);
	}
		 */

		dummyvals.push(obj);

		//$('#summaryTable').html(str);
		$("#loader").hide();
		$('#predictTable').show().bootstrapTable({
			cache: false,
			data:dummyvals,
			//data:data.coef,
			height: 100,
			columns:columns,
			striped: true
		});

		var stats=[{"name":"R Squared","value":data.vars.rsquared},{"name":"Adjusted R Squared","value":data.vars.adjrsquared},{"name":"Standard Error","value":data.vars.stderr},{"name":"R Squared","value":data.vars.fstats.value}];
		$('#statsTable').bootstrapTable({
			cache: false,
			data:stats,
			height: 200,
			striped: true
		});
		var sum="<b>Formula: </b>" + data.vars.names[0] + " = " + data.vars.coef[0]['Estimate'] ;
		for(var i=1;i<data.vars.coef.length;i++)
			sum += " + " +data.vars.names[i] + " * " + data.vars.coef[i]['Estimate'];

		$("#summary").html( sum );
		$("#loader").hide();
		$("#predictDiv").show();
		$("#noswdiv").show();

		//if(file){
		//	printTable(file);
		//}

	});


	$("a.btn-primary").on("click",function(){
	});
	$("a.btn-danger").on("click",function(){
	});		


}

$(document).ready(function() {
	$("#username").html(sessionStorage.getItem("username"));
	$('#compsTable').on('load-success.bs.table', function (e) {
		console.log('Event: load-success.bs.table');
		$("input[name='name']").on("change",function(e){
			var name=$(e.target).siblings().text();//parent().siblings("td").eq(2).html();
			console.log('Event: id radio, data: ' + name);
			update(name);
		});
		$("#nosw").on("change",function(e){
			var name = $("input[name='name']:checked").siblings().text();
			if(name)
				update(name);
		})
	});	
	$("#predictFrm").submit(function(){
		console.log("submit");
		var result=0.0;
		try{
			for(var i in coeff)
			{
				if(this.elements[i])
				{
					result += parseFloat(this.elements[i].value.replace(/,/g,'')) * coeff[i];
					//console.log(this.elements[i].value +" * " +  coeff[i] );
				}
				else result+=coeff[i];
			}
		}catch(e){console.log(e);}
		console.log(priceFormatter(result));
		$("#events-result").text("Predicted price: "+ priceFormatter(result) );
		return false;	
	});	
	return;
	//table name may be different than the filename
	var tableName=sessionStorage.getItem("tablename");
	if(!tableName)
	{
		location.href='/';
		return;
	}
	$("#nosw").change(function(){
		window.location.href="/residuals"+(this.checked?"?nosw=1":"");
	});
	var nosw = $("#nosw").prop("checked");
	var url="/uploadsubfiles/";
	//$('#summaryTable').bootstrapTable("showLoading");
	//var vars;


	//$('#summaryTable').bootstrapTable({
	//    url: url
	//});
	//?offset=0&limit=10&search=test
	$.getJSON(url+"/variables"+(nosw?"?nosw=1":""),function(data){
		var columns=[];//{field:"name",title:"",align:"right",class:"col"}];
		//first column is the id
		//vars = data;
		var id=data.id.trim();//.replace(/"/g,"")
		columns.push({field:id,title:id,align:"right"});
		data.vars.names[0]=data.vars.names[0].trim();//.replace(/"/g,"")
		var depvar=data.vars.names[0];
		columns.push({field:depvar,title:depvar,align:"right"});
		columns.push({field:"_pred",title:"Predicted "+depvar,align:"right"});
		columns.push({field:"_lwr",title:"Range - Lower "+depvar,align:"right"});
		columns.push({field:"_hgr",title:"Range - Higher "+depvar,align:"right"});
		columns.push({field:"_inrng",title:"Sale price within range",align:"right"});

		for(var i=1;i<data.vars.names.length;i++)
		{
			//if(i!='total')
			data.vars.names[i]=data.vars.names[i].trim();//.replace(/"/g,"")
			columns.push({field:data.vars.names[i],title:data.vars.names[i],align:"right",formatter:numberFormatter});
		}
		columns[1]['formatter']=priceFormatter;
		columns[2]['formatter']=function predictFormatter(value,row) {
			if(isNaN(row[depvar]))return "$0";
			row['_pred']=calc(row,data.vars.names,data.vars.coef);
			return '$' + format("#,##0.##",row['_pred']);
		};
		columns[3]['formatter']=function predictFormatter(value,row) {
			if(isNaN(row[depvar]))return "$0";
			return '$' + format("#,##0.##",row['_pred']-data.vars.stderr);
			//return '$' + format("#,##0.####",calc(row,data.vars.names,data.vars.coef)-data.vars.stderr);
		};

		columns[4]['formatter']=function predictFormatter(value,row) {
			if(isNaN(row[depvar]))return "$0";
			return '$' + format("#,##0.##",row['_pred']+data.vars.stderr);
			//return '$' + format("#,##0.####",calc(row,data.vars.names,data.vars.coef)+data.vars.stderr);
		};
		columns[5]['formatter']=function predictFormatter(value,row) {

			return (row[depvar]<row['_pred']+data.vars.stderr && row[depvar]>row['_pred']-data.vars.stderr)?"Yes":"No";
		};


		//columns[columns.length-1]['formatter']=priceFormatter;

		//var names=data.replace("~","+").split("+");
		$("#loader").hide();
		$('#summaryTable').show().bootstrapTable({
			cache: false,
			url:url+"?total="+data.total+(nosw?"&nosw=1":""),
			//data:data.rows,
			height: 600,
			columns:columns,
			//pagination:true,
			//pageSize:50,
			showColumns:true,

			striped: true
		});
		//$('#summaryTable').bootstrapTable("load", data.rows);

		/*
	$('#summaryTable').bootstrapTable({	
	                url: url
	});
		 */

		var stats=[{"name":"R Squared","value":data.vars.rsquared},{"name":"Adjusted R Squared","value":data.vars.adjrsquared},{"name":"Standard Error","value":data.vars.stderr},{"name":"R Squared","value":data.vars.fstats.value}];
		$('#statsTable').bootstrapTable({
			cache: false,
			data:stats,
			height: 200,
			striped: true
		});
		var sum="<b>Formula: </b>" + data.vars.names[0] + " = " + data.vars.coef[0]['Estimate'] ;
		for(var i=1;i<data.vars.coef.length;i++)
			sum += " + " +data.vars.names[i] + " * " + data.vars.coef[i]['Estimate'];

		$("#summary").html( sum );


	});
//	methoc="get", url=""

});
/*
 IntegraXor Web SCADA - JavaScript Number Formatter
 http://www.integraxor.com/
 author: KPL, KHL
 (c)2011 ecava
 Dual licensed under the MIT or GPL Version 2 licenses.
 */
window.format=function(b,a){if(!b||isNaN(+a))return a;var a=b.charAt(0)=="-"?-a:+a,j=a<0?a=-a:0,e=b.match(/[^\d\-\+#]/g),h=e&&e[e.length-1]||".",e=e&&e[1]&&e[0]||",",b=b.split(h),a=a.toFixed(b[1]&&b[1].length),a=+a+"",d=b[1]&&b[1].lastIndexOf("0"),c=a.split(".");if(!c[1]||c[1]&&c[1].length<=d)a=(+a).toFixed(d+1);d=b[0].split(e);b[0]=d.join("");var f=b[0]&&b[0].indexOf("0");if(f>-1)for(;c[0].length<b[0].length-f;)c[0]="0"+c[0];else+c[0]==0&&(c[0]="");a=a.split(".");a[0]=c[0];if(c=d[1]&&d[d.length-
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            1].length){for(var d=a[0],f="",k=d.length%c,g=0,i=d.length;g<i;g++)f+=d.charAt(g),!((g-k+1)%c)&&g<i-c&&(f+=e);a[0]=f}a[1]=b[1]&&a[1]?h+a[1]:"";return(j?"-":"")+a[0]+a[1]};

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            function idRadioFormatter(value, row, index){
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	//if(value===0)return "";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	//value=names[row['name']][1];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	return '<input class="id" type="radio" name="name"> <span>'+value + "</span>";

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            function priceFormatter(value) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	if(isNaN(value))return "$0";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	return '$' + format("#,##0.####",value);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            function numberFormatter(value) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	if(isNaN(value))return 0;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	return format("#,##0.####",value);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            function nameFormatter(value, row) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	return '<input name="'+value +'" type="text"> ';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            function calc(row,names,coef)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	var ret=coef[0].Estimate;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	for(var i=1;i<names.length;i++)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            		ret += coef[i].Estimate * row[names[i]];
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            	return ret;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }