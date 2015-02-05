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
	var url ="/uploadfiles/" + fileName;
	$("#fileName").html("<img src='../img/spinner_mac.gif'> Please wait...");

	$.getJSON(url, function(data) {
			var alert='success';
			$("#fileName").html("");
			//href="/load" class="btn btn-default btn-continue" id="continueBtn"
			if(data['file'])
				$("#continueBtn").prop("href","/load?type="+data['file']+(data["Geometry"]?"&stype="+data["Geometry"]:""));
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