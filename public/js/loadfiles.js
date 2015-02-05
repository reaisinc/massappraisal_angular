$(document).ready(function() {
	$("#username").html(sessionStorage.getItem("username"));
	$("#startBtn").prop("disabled",false);
	$("step2").find(".bs-wizard-dot").delay(200).animate({ opacity: 'toggle' }, 1000, function() { anm(element); });	

	if(!maurl)
	{
		location.href='/';
		return;
	}
	//table name may be different than the filename
	var tableName=sessionStorage.getItem("tablename");
	if(!tableName)
	{
		location.href='/';
		return;
	}
	
	//need to run four .getJSON commands to load the db, verify data, intersect with soils, print summary
	$("#fileName").html("Loading " + tableName + " from uploaded file " + fileName);
	//initial
	var url = "/loadfiles/" + fileName+ "&step=2";
	var idName;
	var lastStep=2;

	var baseURL="/loadfiles/" + tableName;
	$("#startBtn").click(
		
   		function(e) {
    			if (e.isDefaultPrevented()) {
   				return false;
   			}
    		$("#startBtn").prop("disabled",true);
    		$("#step2").removeClass("disabled").addClass("active");
    		//$("#step2").find(".bs-wizard-dot").delay(200).fadeOut('slow').delay(50).fadeIn('slow');
    		pulse($("#step2").find(".bs-wizard-dot"));
    		
    		setTimeout(function(){
   			function checkStatus(url) {
   				$.getJSON(url, function(data) {
   					//checkStatus(url);
   					if(!data.step){
   						console.log("Invalid step");
   						return;
   					}
   					if(data.err)
   					{
   						$('<div class="alert alert-danger"/>')
   						.html(data.err).insertAfter('#stepsWizard');
   						
   						return;
   					}
   					if(data.id){
   						idName=data.id;
   						sessionStorage.setItem("idName",idName);
   					}
						
						//if any steps skipped, move progress
   					for(var i=lastStep;i<data.step;i++){
   								stopStepPulse(i);
   					}
   					stopStepPulse(data.step);
   					data.step++;
   					
   					lastStep=data.step;
   					var url = baseURL + "&step="+data.step+(idName?"&idName="+idName:"");

   					startStepPulse(data.step);

   					if(data.step<6){
   						setTimeout(function(){
   							checkStatus(url);
   						},5000);
   					}
   					else {
   						$("#startBtn").prop("disabled",false).hide();
   						$("#continueBtn").show();
   					}
   					
   				});
   			};
   			
   			checkStatus(url);
    		},5000);
   			
   	});
});
function stopStepPulse(step)
{
	pulse($("#step"+step).find(".bs-wizard-dot"),true);
	$("#step"+step).find(".bs-wizard-dot").stop();
  $("#step"+step).removeClass("active").removeClass("disabled").addClass("complete");
}
function startStepPulse(step)
{
	$("#step"+step).removeClass("disabled").addClass("active"); 
 	//$("#step "+data.step).find(".bs-wizard-dot").delay(200).fadeOut('slow').delay(50).fadeIn('slow');
 	pulse($("#step"+step).find(".bs-wizard-dot"));

}
function anm(element,f) {
	if(f){$(element).stop();}
	else $(element).delay(200).animate({ opacity: 'toggle' }, 1000, function() { anm(element,f); });
}

function pulse(element,f){
	if(f){element.clearQueue().stop();element.finish();console.log("Stopping animation: "+element[0].id);}
	else {element.delay(200).animate({'opacity':1}).delay(500).animate({'opacity':0.25},function(){pulse(element,f)});}
	//else element.delay(200).fadeOut('slow').delay(50).fadeIn('slow',function(){pulse(element)});
	
}

$("#continueBtn1").click(
    		function(e) {

    			if (e.isDefaultPrevented()) {
    				return false;
    			}
    			var fileName = $("#fileName").html();
    			// var url = location.protocol + ":// " + window.location.host +
    			// ":" + windoww.location.port + "/info?"+fileName;
    			// var url="two.html?fileName="+fileName;
    			// window.location.replace(url);
    			
    			function checkStatus(url) {
    				$.getJSON(url, function(data) {
    					var alert='success';
    					if(data['Extent'])
    					{
	    					var message="Success: Layer name: " + data["Layer name"] 
	    					+ " Extent: " + data["Extent"]
	    					+ " Count: " + data["Feature Count"]
	    					+ " Type: "  + data["Geometry"];
	    					$('<div class="alert alert-' + alert + '"/>')
	    					.text(message).appendTo('#fileupload');
	    					var url = "/verify?step=2"
	    					+ "&fileName=" + fileName;
	    					checkStatus(url);
    					}
    					else{
	    					var message="Success: Layer name: " + data["Layer name"] 
	    					+ " Extent: " + data["Extent"]
	    					+ " Count: " + data["Feature Count"]
	    					+ " Type: "  + data["Geometry"];
	    					$('<div class="alert alert-' + alert + '"/>')
	    					.text(message).appendTo('#fileupload');
    					}
    				})
    			}
    			
    			var url ="/verify?step=1&fileName=" + fileName;
    			checkStatus(url);
    			// save a value
    			sessionStorage.setItem("fileName", fileName);

    			return false;
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