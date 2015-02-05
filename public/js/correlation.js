
var vifs={};
var names;
function update(field,value,name){
	$.getJSON(maurl+"/update?name="+name+"&field="+field+"&value="+value,function(data){
		console.log(data);
	});
}

$(document).ready(function() {
	$("#username").html(sessionStorage.getItem("username"));
	//table name may be different than the filename
	if(!maurl)
	{
		location.href='/';
		return;
	}
	
	//$('#summaryTable').bootstrapTable('showLoading');


	$("#refreshBtn").click(function(){
		$('#summaryTable').bootstrapTable('destroy');
		getData(maurl+"/query?refresh=1");
	});
	getData(maurl+"/query");
});

function getData(url){
	$.getJSON(url,function(data){
		names = data.names;
		var columns=[{field:"",checkbox:true,title:"",formatter:stateFormatter,align:"center",class:"col"},{field:"_name_",title:"",align:"right",class:"col"}];

		for(var i in data.results.cor[0]){
			columns.push({field:i,title:i,align:"right",formatter:numberFormatter});
		}
		
		for(var i in data.results.vif)
			vifs[data.results.vif[i]] = 1;
		
		for(var i=0;i<data.results.cor.length;i++)
		{
			data.results.cor[i]['_name_']=Object.keys(data.results.cor[i])[i];
		}
		//columns[0]['checkbox']="true";  
		//columns[1]['formatter']=correlateFormatter;
		columns[2]['cellStyle']=correlateFormatter;
		$("#loader").hide();
		$('#summaryTable').show().bootstrapTable({
		                //method: 'get',
		                //url: 'data2.json',
		                cache: false,
		                data:data.results.cor,
		                height: 400,
		                striped: true,
		                //pagination: true,
		                //pageSize: 50,
		                //pageList: [10, 25, 50, 100, 200],
		                //search: true,
		                //showColumns: true,
		                //showRefresh: true,
		                //minimumCountColumns: 2,
		                //clickToSelect: true,
		                columns: columns
		});//.bootStrapTable("hideLoading");
		$('#summaryTable').on('check.bs.table', function (e, row) {
		    console.log('Event: check.bs.table, data: ' + JSON.stringify(row));
		    update('cinclude',1,row._name_);
		}).on('uncheck.bs.table', function (e, row) {
		    console.log('Event: uncheck.bs.table, data: ' + JSON.stringify(row));
		    update('cinclude',0,row._name_);
		}).on('check-all.bs.table', function (e) {
		    console.log('Event: check-all.bs.table');
		    update('cinclude',1,'all');
		}).on('uncheck-all.bs.table', function (e) {
		    console.log('Event: uncheck-all.bs.table');
		    update('cinclude',0,'all');
		});		
	});	
}
/*
IntegraXor Web SCADA - JavaScript Number Formatter
http://www.integraxor.com/
author: KPL, KHL
(c)2011 ecava
Dual licensed under the MIT or GPL Version 2 licenses.
*/
window.format=function(b,a){if(!b||isNaN(+a))return a;var a=b.charAt(0)=="-"?-a:+a,j=a<0?a=-a:0,e=b.match(/[^\d\-\+#]/g),h=e&&e[e.length-1]||".",e=e&&e[1]&&e[0]||",",b=b.split(h),a=a.toFixed(b[1]&&b[1].length),a=+a+"",d=b[1]&&b[1].lastIndexOf("0"),c=a.split(".");if(!c[1]||c[1]&&c[1].length<=d)a=(+a).toFixed(d+1);d=b[0].split(e);b[0]=d.join("");var f=b[0]&&b[0].indexOf("0");if(f>-1)for(;c[0].length<b[0].length-f;)c[0]="0"+c[0];else+c[0]==0&&(c[0]="");a=a.split(".");a[0]=c[0];if(c=d[1]&&d[d.length-
1].length){for(var d=a[0],f="",k=d.length%c,g=0,i=d.length;g<i;g++)f+=d.charAt(g),!((g-k+1)%c)&&g<i-c&&(f+=e);a[0]=f}a[1]=b[1]&&a[1]?h+a[1]:"";return(j?"-":"")+a[0]+a[1]};

function priceFormatter(value) {
				if(isNaN(value))return "$0";
				return '$' + format("#,##0.#####",value);
}


function numberFormatter(value) {
				if(isNaN(value))return 0;
				return format("#,##0.####",value);
}
function stateFormatter(value, row, index) {
	if( index == 0){
        return {
            disabled: true,
            checked:true
        };
		
	}
	else if (names[row["_name_"]] == 0) {
        return {
            disabled: false,
            checked:false
        };
    }
    else { //if (value === 1) {
        return {
            disabled: false,
            checked: true
        }
    }
    /*
    return {
        disabled: true,
        checked: true
    }
    */
    //return value;
}

function correlateFormatter(value,row,index) {
	
	//if(isNaN(value))return 0;
	if(value==1)return {};
	var classes = ['active', 'success', 'info', 'warning', 'danger'];
	if(value<0.4)
		return {classes:'danger'};//red
	//else if(isNaN(vif)) 
	//	return {classes:'info'};//blue
	else if(vifs[row['_name_']])
		return {classes:'success'};//success		
	else
		return {classes:'warning'};//yellow

	
    /*
    if (index % 2 === 0 && index / 2 < classes.length) {
        return {
            classes: classes[index / 2]
        };
    }
    return {};	
    */
	/*
	var fac = parseFloat($("#fac").val());
	var isCollinear=false;
	var per=0.05;
	if(value>fac){
		for(var i in row){
			if(row[i]!=value && row[i]!=1 && row[i]>(value-per) && row[i]<(value+per) )
			{
				isCollinear=true;break;
			}
		}
		if(isCollinear)return {classes:'info'};
		return {classes:'success'};
	}
	else return {classes:'danger'};
	*/
	//return format("#,##0.####",value);
}
