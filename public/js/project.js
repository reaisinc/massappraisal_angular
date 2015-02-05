var url;
var names;
function update(field,value,name){
	$.getJSON(url+"?name="+name+"&field="+field+"&value="+value,function(data){
		console.log(data);
	});
}
function idRadioFormatter(value, row, index){
		//if(value===0)return "";
		value=names[row['name']][1];
		return '<input class="id" type="radio" name="id"' + (value==1?" checked":"")+'>';
}

function depVarRadioFormatter(value, row, index){
		value=names[row['name']][2];
		if(value===2)return "<small>Non-numeric</small>";
		return '<input class="depvar" type="radio" name="depvar"'+(value==1?" checked":"")+'>';
}

function stateFormatter(value, row, index) {
		value=names[row['name']][0];
        if (value=== 0) {
            return {
                //disabled: true
                checked:false
            };
        }
        if (value==1) {
            return {
                disabled: false,
                checked: true
            }
        }
        return {
            disabled: true,
            checked: true
        }
        //return value;
}

$(document).ready(function() {
	$("#username").html(sessionStorage.getItem("username"));
	//table name may be different than the filename
	var tableName=sessionStorage.getItem("tablename");
	if(!tableName)
	{
		location.href='/';
		return;
	}
	url="/summary/"+tableName;
	var dlUrl="/summary/download/"+tableName;
	$("#downloadLink").prop("href", dlUrl)
	//$('#summaryTable').bootstrapTable("showLoading");

	$.getJSON(url,function(data){
		names=data.names;
		$("#loader").hide();
		$('#summaryTable').show().bootstrapTable({
			data:data.rows
		});
		$('#summaryTable').on('check.bs.table', function (e, row) {
			console.log('Event: check.bs.table, data: ' + JSON.stringify(row));
			update('include',row.include?1:0,row.name);
		}).on('uncheck.bs.table', function (e, row) {
			console.log('Event: uncheck.bs.table, data: ' + JSON.stringify(row));
			update('include',row.include?1:0,row.name);
		}).on('check-all.bs.table', function (e) {
			console.log('Event: check-all.bs.table');
			update('include',1,'all');
		}).on('uncheck-all.bs.table', function (e) {
			console.log('Event: uncheck-all.bs.table');
			update('include',0,'all');

		});
		/*
		 * .on('load-success.bs.table', function (e) {
		    console.log('Event: load-success.bs.table');
				$("input[name='id']").on("change",function(e){
						 var name=$(e.target).parent().siblings("td").eq(2).html();
					   console.log('Event: id radio, data: ' + name);
					   update('id',1,name);
				});
				$("input[name='depvar']").on("change",function(e){
						 var name=$(e.target).parent().siblings("td").eq(2).html();
					   console.log('Event: depvar radio, data: ' + name);
					   update('depvar',1,name);
				});    
		});
		*/
		$("input[name='id']").on("change",function(e){
			var name=$(e.target).parent().siblings("td").eq(2).html();
			console.log('Event: id radio, data: ' + name);
			update('id',1,name);
		});
		$("input[name='depvar']").on("change",function(e){
			var name=$(e.target).parent().siblings("td").eq(2).html();
			console.log('Event: depvar radio, data: ' + name);
			update('depvar',1,name);
		});    
		if(data.geomtype!=""&&data.geomtype!="None")
		{
			console.log("Show map");
			$("#mapBtn").show().find("a").prop("href","/map?tableName="+tableName);
		}

	});
	
});



/**
 * New node file
 */
/*
//save a value
sessionStorage.setItem("name", "Nicholas");

//retrieve item
var name = sessionStorage.getItem("name");

//get the key name for the first item
var key = sessionStorage.key(0);

//remove the key
sessionStorage.removeItem(key);

//check how many key-value pairs are present
var count = sessionStorage.length;
*/