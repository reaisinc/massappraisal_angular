var url="/project";
$(document).ready(function() {
	$.getJSON(url,function(data){
		$("#username").html(data.user);
		sessionStorage.setItem("username",data.user);
		createTable(data.rows);
	});

	$("#createNewProjectBtn").click(function(){
		$("#newProjectDiv").toggle();	
	});

	$("#frm").submit(function(){
		var name=this.name.value;
		if(name==''){
			$("#events-result").show().html("Please enter a project name");
			return false;
		}
		$("#events-result").hide().html("");
		
		//see if name already taken, else create it
		$.ajax({
		    type: 'PUT',
		    url: '/project/'+name,
		    data: { state: this.state.options[this.state.selectedIndex].value },
		    success: function(data, textStatus, jQxhr) {
		        //alert('Object deleted!')
		    	//goto next screen
		    	window.location.href="/project/"+name;
		    },
		    error: function( jqXhr, textStatus, errorThrown ){ 
		    	//console.log( errorThrown );
		    	$("#events-result").show().html("Project name is already in use.  Please select a different name")
		    },
		    headers: { 'X_METHODOVERRIDE': 'PUT' }
		});
		
		return false;
	});
});

function createTable(data){
	//var table=$("#projTable");
	var lastTr=$('#projTable tr').last();
	for(var i = 0;i < data.length;i++) {                 
		var row="<tr data-id='"+data[i].id+"'>"
			+"<td>" + data[i].name  + "</td>"
			+"<td>" + data[i].state +"</td>"
			+"<td style='text-align:center;'>" + data[i].created_date +  "</td>"
			+"<td style='text-align:center;'>" + data[i].modified_date + "</td>"
			+"<td><a role='button' class='btn btn-primary'><i class='glyphicon glyphicon-stats'></i> Edit</a></td>"
			+"<td><a role='button' class='btn btn-danger delete'><i class='glyphicon glyphicon-trash'></i> Delete</a></td>"
			+"</tr>";
		lastTr.after(row);
	}
	$("a.delete").on("click",function(){

		var table=$("#projTable");
		var tr=$(this).parent().parent();
		var td=tr.find('td');
		var name=td.eq(0).html();
		var state=td.eq(1).html();

		//see if name already taken, else create it
		$.ajax({
		    type: 'DELETE',
		    url: '/project/'+tr.data('id'),
		    success: function(data, textStatus, jQxhr) {
		        //alert('Object deleted!')
		    	//remove this row from table
		    	table.remove(tr);
		    },
		    error: function( jqXhr, textStatus, errorThrown ){ 
		    	//console.log( errorThrown );
		    	$("#events-result").show().html("Unable to delete project")
		    },
		    headers: { 'X_METHODOVERRIDE': 'DELETE' }
		});

		return false;
	});
	$("a.btn-primary").on("click",function(){
		var table=$("#projTable");
		var tr=$(this).parent().parent();
		var td=tr.find('td');
		var name=td.eq(0).html();
		var state=td.eq(1).html();

		window.location.href="/project/"+tr.data('id');
	});

}