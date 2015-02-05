/*
HTTP Verb 	Entire Collection (e.g. /customers) 	Specific Item (e.g. /customers/{id})
GET 	200 (OK), list of customers. Use pagination, sorting and filtering to navigate big lists. 	200 (OK), single customer. 404 (Not Found), if ID not found or invalid.
PUT 	404 (Not Found), unless you want to update/replace every resource in the entire collection. 	200 (OK) or 204 (No Content). 404 (Not Found), if ID not found or invalid.
POST 	201 (Created), 'Location' header with link to /customers/{id} containing new ID. 	404 (Not Found).
DELETE 	404 (Not Found), unless you want to delete the whole collection—not often desirable. 	200 (OK). 404 (Not Found), if ID not found or invalid.
*/


$.ajax({
    type: 'DELETE',
    url: '/restview',
    data: { pk: pk },
    success: function() {
        alert('Object deleted!')
    }
});

$.ajax({
    type: 'POST',
    url: '/restview',
    data: { pk: pk },
    success: function() {
        alert('Object deleted!')
    },
    headers: { 'X_METHODOVERRIDE': 'DELETE' }
});

$.ajax({ url: 'users.php', 
	dataType: 'json', 
	type: 'post', 
	contentType: 'application/json', 
	data: JSON.stringify( { "first-name": $('#first-name').val(), "last-name": $('#last-name').val() } ), 
	processData: false, 
	success: function( data, textStatus, jQxhr ){ $('#response pre').html( JSON.stringify( data ) ); }, 
	error: function( jqXhr, textStatus, errorThrown ){ console.log( errorThrown ); } 
	});
Read
more at http://www.airpair.com/js/jquery-ajax-post-tutorial#H8jr7YhGsuU0d1s2.99