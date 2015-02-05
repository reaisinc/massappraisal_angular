var url;
    
function update(field,value,name){
	$.getJSON(url+"?name="+name+"&field="+field+"&value="+value,function(data){
		console.log(data);
	});
}
function idRadioFormatter(value, row, index){
		//if(value===0)return "";
		return '<input class="id" type="radio" name="id"' + (value==1?" checked":"")+'>';
}

function depVarRadioFormatter(value, row, index){
		if(value===2)return "<small>Non-numeric</small>";
		return '<input class="depvar" type="radio" name="depvar"'+(value==1?" checked":"")+'>';
}

function stateFormatter(value, row, index) {
        if (value === 0) {
            return {
                //disabled: true
                checked:false
            };
        }
        if (value === 1) {
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
	//table name may be different than the filename
	var tableName=sessionStorage.getItem("tablename");
	if(!tableName)
	{
		location.href='/';
		return;
	}
	url="/configure/"+tableName;
	$('#summaryTable').bootstrapTable({
	    url: url
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
}).on('load-success.bs.table', function (e) {
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

});
