$(document).ready(function() {
	$("#username").html(sessionStorage.getItem("username"));
	if(!maurl)
	{
		location.href='/';
		return;
	}
	$("#nosw").change(function(){
		window.location.href=maurl+(this.checked?"?nosw=1":"");
	});
	var nosw = $("#nosw").prop("checked");
	var dlUrl=maurl+"/download"+(nosw?"?nosw=1":"");
	$("#downloadLink").prop("href", dlUrl)
	$.getJSON(maurl+"/variables"+(nosw?"?nosw=1":""),function(data){
		var columns=[];//{field:"name",title:"",align:"right",class:"col"}];
		//first column is the id
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
		};

		columns[4]['formatter']=function predictFormatter(value,row) {
			if(isNaN(row[depvar]))return "$0";
			return '$' + format("#,##0.##",row['_pred']+data.vars.stderr);
		};
		columns[5]['formatter']=function predictFormatter(value,row) {

			return (row[depvar]<row['_pred']+data.vars.stderr && row[depvar]>row['_pred']-data.vars.stderr)?"Yes":"No";
		};

		$("#loader").hide();
		$('#summaryTable').show().bootstrapTable({
			cache: false,
			url:maurl+"?total="+data.total+(nosw?"&nosw=1":""),
			//data:data.rows,
			height: 600,
			columns:columns,
			//pagination:true,
			//pageSize:50,
			showColumns:true,
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

	});
});

function priceFormatter(value) {
	if(isNaN(value))return "$0";
	return '$' + format("#,##0.####",value);
}


function numberFormatter(value) {
	if(isNaN(value))return 0;
	return format("#,##0.####",value);
}

function calc(row,names,coef)
{
	var ret=coef[0].Estimate;
	for(var i=1;i<names.length;i++)
	{
		ret += coef[i].Estimate * row[names[i]];
	}
}
/*
IntegraXor Web SCADA - JavaScript Number Formatter
http://www.integraxor.com/
author: KPL, KHL
(c)2011 ecava
Dual licensed under the MIT or GPL Version 2 licenses.
*/
window.format=function(b,a){if(!b||isNaN(+a))return a;var a=b.charAt(0)=="-"?-a:+a,j=a<0?a=-a:0,e=b.match(/[^\d\-\+#]/g),h=e&&e[e.length-1]||".",e=e&&e[1]&&e[0]||",",b=b.split(h),a=a.toFixed(b[1]&&b[1].length),a=+a+"",d=b[1]&&b[1].lastIndexOf("0"),c=a.split(".");if(!c[1]||c[1]&&c[1].length<=d)a=(+a).toFixed(d+1);d=b[0].split(e);b[0]=d.join("");var f=b[0]&&b[0].indexOf("0");if(f>-1)for(;c[0].length<b[0].length-f;)c[0]="0"+c[0];else+c[0]==0&&(c[0]="");a=a.split(".");a[0]=c[0];if(c=d[1]&&d[d.length-1].length){for(var d=a[0],f="",k=d.length%c,g=0,i=d.length;g<i;g++)f+=d.charAt(g),!((g-k+1)%c)&&g<i-c&&(f+=e);a[0]=f}a[1]=b[1]&&a[1]?h+a[1]:"";return(j?"-":"")+a[0]+a[1]};

