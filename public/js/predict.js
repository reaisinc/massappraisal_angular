var coeff=[];
var file;
var vars;

$(document).ready(function() {
	$("#username").html(sessionStorage.getItem("username"));
	$('#fileupload').bind('change', handleFileSelect);

	if(!maurl)
	{
		location.href='/';
		return;
	}
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

	fetchRegressionVariables(maurl+"/variables");
	$("#nosw").change(function(){
		$('#predictTable').bootstrapTable("destroy");
		$('#statsTable').bootstrapTable("destroy");
		$("#events-result").text("");
		fetchRegressionVariables(maurl+"/variables"+(this.checked?"?nosw=1":""));
	});

});

function fetchRegressionVariables(url){
	$.getJSON(url,function(data){
		vars = data.vars;
		var columns=[];//{field:"name",title:"",align:"right",class:"col"}];
		var dummyvals=[];
		var obj={};
		data.vars.names[0]=data.vars.names[0].replace(/\"/g," ").trim();//.replace(/ /g,"_");
		coeff[data.vars.names[0]]=parseFloat(data.vars.coef[0]['Estimate']);
		for(var i=1;i<data.vars.names.length;i++)
		{
			data.vars.names[i]=data.vars.names[i].replace(/\"/g," ").trim();//.replace(/ /g,"_");
			columns.push({field:data.vars.names[i],title:data.vars.names[i],align:"right",formatter:nameFormatter});
			obj[data.vars.names[i]]=data.vars.names[i];
			coeff[data.vars.names[i]]=parseFloat(data.vars.coef[i]['Estimate']);
		}

		dummyvals.push(obj);

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

		if(file){
			printTable(file);
		}

	});


	$("a.btn-primary").on("click",function(){
	});
	$("a.btn-danger").on("click",function(){
	});	

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

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object
	if(files.length==0){

		return;
	}
	file = files[0];
	$('#summaryTable').bootstrapTable("destroy");

	// read the file metadata
	var output = ''
		output += '<span style="font-weight:bold;">' + escape(file.name) + '</span><table width="100%" class="table"><tr>\n';
	output += '<td>FileType: ' + (file.type || 'n/a') + '  </td>\n';
	output += '<td>FileSize: ' + file.size + ' bytes </td>\n';
	output += '<td>LastModified: ' + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a') + '</td></tr></table>\n';

	// read the file contents
	printTable(file);

	// post the results
	$('#list').html(output);
}

function printTable(file) {
	var reader = new FileReader();
	reader.readAsText(file);
	reader.onload = function(event){
		var csv = event.target.result;
		var data = $.csv.toArrays(csv);
		var depvar=vars.names[0];
		var depvar_idx;
		var columns=[];
		var tmpCols=[];
		var colsIdx={};
		//format with priceFormatter the first columns, find the other numeric columns, ignore the rest
		for(var i=0;i<data[0].length;i++)
		{
			for(var j=0;j<vars.names.length;j++)
			{
				if(data[0][i].toLowerCase()==vars.names[0].toLowerCase()||data[0][i].toLowerCase()==vars.names[0].replace(/ /g,"_").toLowerCase()){
					depvar_idx=i;
					depvar=data[0][i];
					vars.names[0]=data[0][i];
					colsIdx[vars.names[0]]=i;
					columns.push({field:i,title:depvar,align:"right"});
					columns.push({field:"_pred",title:"Predicted "+depvar,align:"right"});
					columns.push({field:"_lwr",title:"Range - Lower "+depvar,align:"right"});
					columns.push({field:"_hgr",title:"Range - Higher "+depvar,align:"right"});
					columns.push({field:"_inrng",title:"Sale price within range",align:"right"});
					columns[0]['formatter']=priceFormatter;
					columns[1]['formatter']=function predictFormatter(value,row) {
						if(isNaN(row[depvar_idx]))return "$0";
						row['_pred']=calc(row,vars.names,vars.coef,colsIdx);
						return '$' + format("#,##0.##",row['_pred']);
					};
					columns[2]['formatter']=function predictFormatter(value,row) {
						if(isNaN(row[depvar_idx]))return "$0";
						return '$' + format("#,##0.##",row['_pred']-vars.stderr);
						//return '$' + format("#,##0.####",calc(row,data.vars.names,data.vars.coef)-data.vars.stderr);
					};

					columns[3]['formatter']=function predictFormatter(value,row) {
						if(isNaN(row[depvar_idx]))return "$0";
						return '$' + format("#,##0.##",row['_pred']+vars.stderr);
						//return '$' + format("#,##0.####",calc(row,data.vars.names,data.vars.coef)+data.vars.stderr);
					};
					columns[4]['formatter']=function predictFormatter(value,row) {

						return (row[depvar_idx]<row['_pred']+vars.stderr && row[depvar_idx]>row['_pred']-vars.stderr)?"Yes":"No";
					};
					//data[0].slice(i,1);
					data[0][i]=null;
					break;
				}
				else if(data[0][i].toLowerCase()==vars.names[j].toLowerCase()||data[0][i].toLowerCase()==vars.names[j].replace(/ /g,"_").toLowerCase()){
					vars.names[j]=data[0][i];
					tmpCols.push({"idx":i,"name":data[0][i].replace(/_/g," ")});
					colsIdx[vars.names[j]]=i;
					//console.log(i);
					//console.log(vars.names[j]);
					//console.log(colsIdx[vars.names[j]]);
					data[0][i]=null;
					break;
					//data[0].slice(i,1);
				}
			}
			//columns.push({field:i,title:data[0][i],align:"right",formatter:priceFormatter});
		}

		for(var i in tmpCols){
			columns.push({field:tmpCols[i].idx,title:tmpCols[i].name,align:"right",formatter:$.isNumeric(data[1][tmpCols[i].idx])?numberFormatter:undefined});//,formatter:numberFormatter
		}
		for(var i in data[0]){
			if(data[0][i]!=null)columns.push({field:i,title:data[0][i],align:"right",formatter:$.isNumeric(data[1][i])?numberFormatter:undefined});
		}
		//$("#loader").hide();
		$('#summaryTable').show().bootstrapTable({
			cache: false,
			columns:columns,
			data:data.slice(1)
		});
	};
	reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
	$('#progress .progress-bar').css('width', 0 + '%');
}

function calc(row,names,coef,colsIdx)
{
	var ret=coef[0].Estimate;
	for(var i=1;i<names.length;i++)
	{
		if(row[colsIdx[names[i]]])
			ret += coef[i].Estimate * parseFloat(row[colsIdx[names[i]]]);
		console.log(i+": "+ret);
	}
	return ret;
}

/*
IntegraXor Web SCADA - JavaScript Number Formatter
http://www.integraxor.com/
author: KPL, KHL
(c)2011 ecava
Dual licensed under the MIT or GPL Version 2 licenses.
*/
window.format=function(b,a){if(!b||isNaN(+a))return a;var a=b.charAt(0)=="-"?-a:+a,j=a<0?a=-a:0,e=b.match(/[^\d\-\+#]/g),h=e&&e[e.length-1]||".",e=e&&e[1]&&e[0]||",",b=b.split(h),a=a.toFixed(b[1]&&b[1].length),a=+a+"",d=b[1]&&b[1].lastIndexOf("0"),c=a.split(".");if(!c[1]||c[1]&&c[1].length<=d)a=(+a).toFixed(d+1);d=b[0].split(e);b[0]=d.join("");var f=b[0]&&b[0].indexOf("0");if(f>-1)for(;c[0].length<b[0].length-f;)c[0]="0"+c[0];else+c[0]==0&&(c[0]="");a=a.split(".");a[0]=c[0];if(c=d[1]&&d[d.length-1].length){for(var d=a[0],f="",k=d.length%c,g=0,i=d.length;g<i;g++)f+=d.charAt(g),!((g-k+1)%c)&&g<i-c&&(f+=e);a[0]=f}a[1]=b[1]&&a[1]?h+a[1]:"";return(j?"-":"")+a[0]+a[1]};
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            