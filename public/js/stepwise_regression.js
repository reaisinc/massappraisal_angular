$(document).ready(function() {
	$("#username").html(sessionStorage.getItem("username"));
	if(!maurl)
	{
		location.href='/';
		return;
	}
	$('#summaryTable').bootstrapTable("showLoading");
	$.getJSON(maurl,function(data){
		for(var i=0;i<data.names.length;i++)
			data.names[i]=data.coef[i]['name']=data.names[i].trim();//replace(/"/g,"").

		if(data.plot)
		{
			$("#plotimg").prop("src","data:image/gif;base64,"+data.plot);
		}
		$("#loader").hide();
		$('#summaryTable').show().bootstrapTable({
			cache: false,
			data:data.coef,
			height: 300,
			striped: true
		});

		var stats=[{"name":"R Squared","value":data.rsquared},{"name":"Adjusted R Squared","value":data.adjrsquared},{"name":"Standard Error","value":data.stderr},{"name":"F statistic","value":data.fstats.value}];
		$('#statsTable').bootstrapTable({
			cache: false,
			data:stats,
			height: 200,
			striped: true
		});
		var sum="<b>Formula: </b>" + data.names[0] + " = " + data.coef[0]['Estimate'] ;
		for(var i=1;i<data.coef.length;i++)
			sum += " + " + data.names[i] + " * " + data.coef[i]['Estimate'];

		$("#summary").html( sum );

	});

});
