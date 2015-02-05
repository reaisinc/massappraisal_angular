//create the module and name it maApp
var maApp = angular.module('maApp', ['ngRoute','angularFileUpload','ui.bootstrap']);// ,'ngResource'
var user;

//configure our routes
maApp.config(function($routeProvider,$locationProvider) {
	$routeProvider

	// route for the home page
	.when('/', {
		templateUrl : 'pages/home.html',
		controller  : 'mainController'
	})

	// route for the about page
	.when('/about', {
		templateUrl : 'pages/about.html',
		controller  : 'aboutController'
	})

	// route for the login page
	.when('/login', {
		templateUrl : 'pages/login.html',
		controller  : 'loginController'
	})
	// route for the account page
	.when('/account', {
		templateUrl : 'pages/account.html',
		controller  : 'accountController'
	})
	// route for the project page
	.when('/projects/:id/tables', {
		templateUrl : 'pages/project.html',
		controller  : 'projectController'
	})
	// route for the summary page
	.when('/projects/:id/tables/:tid/summary', {
		templateUrl : 'pages/summary.html',
		controller  : 'summaryController'
	})
	// route for the subject page
	.when('/projects/:id/tables/:tid/subject', {
		templateUrl : 'pages/subject.html',
		controller  : 'subjectController'
	})
	// route for the correlation page
	.when('/projects/:id/tables/:tid/correlation', {
		templateUrl : 'pages/correlation.html',
		controller  : 'correlationController'
	})
	// route for the regression page
	.when('/projects/:id/tables/:tid/regression', {
		templateUrl : 'pages/regression.html',
		controller  : 'regressionController'
	})
	// route for the stepwise regression page
	.when('/projects/:id/tables/:tid/stepwise_regression', {
		templateUrl : 'pages/stepwise_regression.html',
		controller  : 'stepwise_regressionController'
	})
	// route for the contact page
	.when('/contact', {
		templateUrl : 'pages/contact.html',
		controller  : 'contactController'
	})
	.otherwise({ redirectTo: '/' });	
});

maApp.factory('Data', function () {
	return { message: "I'm data from a service" };
});

//create the controller and inject Angular's $scope
maApp.controller('mainController', function($rootScope,$scope, $http, $location) {
	$scope.showNewProject=false;
	$rootScope.pid=null;
	$rootScope.tid=null;

	$http.get('/projects')
	.success(function(data, status, headers, config) {
		$scope.project = data;
		sessionStorage.setItem("username",data.user);
	})
	.error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			

	// projects
	$scope.createProject = function () {
		var name=this.name;
		if(name==''){
			this.errMsg="Please enter a project name";
			return false;
		}		
		// see if name already taken, else create it
		$http.put('/projects', { name:name, state: this.state })
		.success(function(data, status, headers, config) {
			$location.path("/projects/"+data.id+"/tables");
		})
		.error(function(data, status, headers, config ){ 
			if(status==404)$location.path("/login")
			$scope.errMsg="Project name is already in use.  Please select a different name";
		});
	};

	$scope.viewProject = function (id) {

		if(id){
			$rootScope.pid=id;
			$location.path("/projects/"+id+"/tables");
		}
		else $location.path(getURL('',3));
	};		
	$scope.deleteProject = function (id,a) {
		$http.delete('/projects/'+id)
		.success(function(data, status, headers, config) {
			// remove tr from table
			var index = -1;		
			for( var i = 0; i < $scope.project.rows.length; i++ ) {
				if( $scope.project.rows[i].id === id ) {
					index = i;
					break;
				}
			}
			if( index === -1 ) {
				alert( "Something gone wrong" );
			}
			$scope.project.rows.splice( index, 1 );						
		})
		.error(function(data, status, headers, config ){ 
			// console.log( errorThrown );
			if(status==404)$location.path("/login")
			$scope.errMsg="Unable to remove this project";
			// $("#events-result").show().html("Project name is already in use.
			// Please select a different name")
		});
	};

	// tables
	$scope.viewComparable = function (id) {
		// $rootScope.tid=id;
		// $location.path("/projects/"+this.pid+"/tables/"+id+"/summary");
		if(id)$location.path(getURL(id+"/summary",1));
		else $location.path(getURL("summary"))
	};
	$scope.viewSubject = function (id) {
		// $rootScope.tid=id;
		// $location.path("/projects/"+$rootScope.pid+"/tables/"+id+"/subject");
		if(id)$location.path(getURL("subject"))
		else $location.path(getURL(id+"/subject",1));
	};

	$scope.deleteTable = function (id,a) {
		// $location.path("/project/"+id);
		$http.delete('/projects/'+this.pid+'/tables/'+id)
		.success(function(data, status, headers, config) {
			// remove tr from table
			// remove tr from table
			var index = -1;		
			for( var i = 0; i < $scope.project.rows.length; i++ ) {
				if( $scope.project.rows[i].id === id ) {
					index = i;
					break;
				}
			}
			if( index === -1 ) {
				alert( "Something gone wrong" );
			}
			$scope.project.rows.splice( index, 1 );						

		})
		.error(function(data, status, headers, config ){ 
			// console.log( errorThrown );
			if(status==404)$location.path("/login")
			$scope.errMsg="Unable to remove this table";
			// $("#events-result").show().html("Project name is already in use.
			// Please select a different name")
		});
	};

	// correlation
	$scope.viewCorrelation = function() {
		// "/projects/"+$rootScope.pid+"/tables/"+$rootScope.tid+"/correlation"
		$location.path(getURL("correlation"));
	};
	// regression
	$scope.viewRegression = function (id) {
		$location.path(getURL('regression'));
		// $location.path("/projects/"+$rootScope.pid+"/tables/"+$rootScope.tid+"/regression");
	};
	// stepwise regression
	$scope.viewStepwiseRegression = function () {
		$location.path(getURL("stepwise_regression"));
		// $location.path("/projects/"+$rootScope.pid+"/tables/"+$rootScope.tid+"/stepwise_regression");
	};


	// if(!sessionStorage.getItem("username"))
	// {
	// }
	// else $scope.username=sessionStorage.getItem("username");

});

function getURL(cmd,len){
	if(!len)len=2;
	var url = window.location.hash.split("/");
	url = url.splice(1,url.length-len);
	url = "/"+url.join("/")+"/"+cmd;
	return url;
}

maApp.controller('aboutController', function($scope) {

});

maApp.controller('accountController', function($rootScope,$scope,$http) {
	$http.get('/auth/userinfo').
	success(function(data, status, headers, config) {
		$scope.user = data;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")		
	});			
});

maApp.controller('contactController', function($scope) {

});

maApp.controller('loginController', function($scope) {

});	

//Please note that $modalInstance represents a modal window (instance)
//dependency.
//It is not the same as the $modal service used above.
maApp.controller('ModalInstanceCtrl', function ($scope,$location,$http,$modalInstance,FileUploader,$sce) {
	$scope.hasStatus=false;
	$scope.status="";
	$scope.soilscompleted=false;
	$scope.soilsprogress=0;
	$scope.pid =  $modalInstance.pid;
	$scope.renderHtml = function(html_code)
	{
	    return $sce.trustAsHtml(html_code);
	};

	var uploader = $scope.uploader = new FileUploader({
		url: '/upload/'+$modalInstance.pid
	});
//    maxFileSize: 250000000,
//    acceptFileTypes: /(\.|\/)(shp|shx|dbf|prj|zip|csv|xls|xlsx)$/i

//	FILTERS
	//1048576; // 1024 * 1024 | Math.pow(2,20); | 0x100000
	uploader.filters.push(
	{
		name: 'sizefilter',
		fn: function (item) { 
			return item.size <= 250000000; 
		}
	});

	uploader.filters.push(
	{
		name: 'typefilter',
		fn: function (item) {
			//doesn't work below
			//var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            //return '|shp|shx|dbf|prj|zip|csv|xls|xlsx|'.indexOf(type) !== -1;			
			
			return !uploader.hasHTML5 ? true : /\/(shp|shx|dbf|prj|zip|csv|xls|xlsx)$/.test(item.type); 
		}
	});

	/*
	uploader.filters.push({
		name: 'customFilter',
		fn: function(item  {File|FileLikeObject} , options) {
			var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
            return '|shp|shx|dbf|prj|zip|csv|xls|xlsx|'.indexOf(type) !== -1;			
			//return this.queue.length < 10;
		}
	});
	*/
//	CALLBACKS
	uploader.onWhenAddingFileFailed = function(item /* {File|FileLikeObject} */, filter, options) {
		console.info('onWhenAddingFileFailed', item, filter, options);
	};
	uploader.onAfterAddingFile = function(fileItem) {
		console.info('onAfterAddingFile', fileItem);
	};
	uploader.onAfterAddingAll = function(addedFileItems) {
		console.info('onAfterAddingAll', addedFileItems);
	};
	uploader.onBeforeUploadItem = function(item) {
		console.info('onBeforeUploadItem', item);
	};
	uploader.onProgressItem = function(fileItem, progress) {
		console.info('onProgressItem', fileItem, progress);
	};
	uploader.onProgressAll = function(progress) {
		console.info('onProgressAll', progress);
	};
	uploader.onSuccessItem = function(fileItem, response, status, headers) {
		console.info('onSuccessItem', fileItem, response, status, headers);
	};
	uploader.onErrorItem = function(fileItem, response, status, headers) {
		console.info('onErrorItem', fileItem, response, status, headers);
	};
	uploader.onCancelItem = function(fileItem, response, status, headers) {
		console.info('onCancelItem', fileItem, response, status, headers);
	};
	uploader.onCompleteItem = function(fileItem, response, status, headers) {
		$scope.filename=fileItem.file.name;
		console.info('onCompleteItem', fileItem, response, status, headers);
	};
	uploader.onCompleteAll = function() {
		console.info('onCompleteAll');
		$scope.filename=this.queue[0]._file.name;
		getFileStatus($scope,$http);
	};

	$scope.processSoils = function() {
		getSoilsStatus($scope,$http);
	};

	$scope.ok = function () {
		$scope.hasStatus=false;
		$modalInstance.close($scope.newfile);
		//$modalInstance.close($scope.selected.item);
	};

	$scope.cancel = function () {
		$scope.hasStatus=false;
		$modalInstance.dismiss('cancel');
	};

});

maApp.controller('projectController', function($rootScope,$scope,$http,$location,$modal) {
	$scope.list = function(){
		$http.get($location.$$url).
		success(function(data, status, headers, config) {
			$scope.project = data;
			$scope.pid=data.id;
		}).
		error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});
	}
	$scope.list();
	$scope.open = function (size, source) {

		var modalInstance = $modal.open({
			templateUrl: 'pages/uploadfiles.html',
			controller: 'ModalInstanceCtrl',
			size: size
			
		});
		modalInstance.source=source;
		modalInstance.soilscompleted=false;
		modalInstance.pid=$scope.pid;
		modalInstance.result.then(function (newfile) {
			//$scope.selected = selectedItem;
			//insert file into list of layers
			$scope.list();
		}, function () {
			//$log.info('Modal dismissed at: ' + new Date());
			console.log('Modal dismissed at: ' + new Date());
		});

	};

});

maApp.controller('summaryController', function($rootScope,$scope,$http,$location) {
	$scope.selectField = function(field,ch) {
		console.log(field)
		$http.put(getURL("summary"),{ name:field, field: 'include',value: ch?1:0})
		.success(function(data, status, headers, config) {
			console.log(data);
		})
		.error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});

		
		// $http.put("/projects/update?name="+name+"&field="+field+"&value="+value,function(data){
		// console.log(data);
		// });

	};
	$scope.selectId = function(field,value) {
		console.log(field)
		$http.put(getURL("summary"),{ name:field, field: 'id',value: 1})
		.success(function(data, status, headers, config) {
			console.log(data);
		})
		.error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});

	};
	$scope.selectDepVar = function(field,value) {
		console.log(field)
		$http.put(getURL("summary"),{ name:field, field: 'depvar',value: 1})
		.success(function(data, status, headers, config) {
			console.log(data);
		})
		.error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});

	};    

	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		$scope.id=1;
		$scope.depvar=1;
		$scope.summary = data;
		
		// hide
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});
maApp.controller('subjectController', function($rootScope,$scope,$http,$location) {
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		$scope.project = data;
	}).
	error(function(data, status, headers, config) {
		if(status==404)$location.path("/login")
		// log error
	});			
});
maApp.controller('correlationController', function($rootScope,$scope,$http,$location) {
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		var tmpdata=[];
		var c=0;
		$scope.id=1;
		for(var i in data.names)
		{
			var vif=0;
			if(c>0){
				vif=1;
				for(var j in data.results.vif){
					if(data.results.vif[j]==i){
						vif=0;
						break;
					}
				}
			}
			var vals=[];
			for(var j in data.names)vals.push(data.results.cor[c][j]);
			c++;
			tmpdata.push({name:i,include:data.names[i],valid:vif,vals:vals});
		}
		$scope.correlation = tmpdata;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});
maApp.directive('dollarChangeDirective', function ($timeout) {
	return {
		link: function ($scope, element, attrs) {
			$timeout(function(){
				if (element.html().charAt(0) == '-'){
					element.css('color', 'red');
				}else{
					element.css('color', 'green');
				}
			});
		}
	}
});

maApp.controller('regressionController', function($scope,$http,$location) {
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		for(var i=0;i<data.coef.length;i++)data.coef[i]['name']=data.names[i];
		$scope.regression = data;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});
maApp.controller('stepwise_regressionController', function($scope,$http,$location) {
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		for(var i=0;i<data.coef.length;i++)data.coef[i]['name']=data.names[i];
		var sum="<b>Formula: </b>" + data.names[0] + " = " + data.coef[0]['Estimate'] ;
		for(var i=1;i<data.coef.length;i++)
			sum += " + " +data.names[i] + " * " + data.coef[i]['Estimate'];
		data.formula=sum;
		$scope.swregression = data;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});
maApp.controller('residualsController', function($scope,$http,$location) {
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		$scope.table = data;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});


maApp.filter('checkbox', function() {
	return function() {
		return arguments[0]==1?" checked":"";
	};
});

maApp.filter('radio', function() {
	return function() {
		return arguments[0]==1?" checked":"";
	};
});

/*
            maxFileSize: 250000000,
            acceptFileTypes: /(\.|\/)(shp|shx|dbf|prj|zip|csv|xls|xlsx)$/i
*/ 
function getFileStatus($scope,$http){
	var url ="/load/" + $scope.pid ;
	var params={step:1,fileName:$scope.filename};
	if($scope.source=='subj')params['subj']=1;
	$scope.hasStatus=true;
	$http.get(url,{params:params})
	.success(function(data,status,headers,config) {
		$scope.err=false;
		
		//id,name,state,created_date,modified_date
		//$scope.newfile={id:999,name:data['Layer name'],type:data.file,state:'az',created_date:new Date().toString(),modified_date:new Date().toString()};

		//href="/load" class="btn btn-default btn-continue" id="continueBtn"
		//if(data['file'])
		//	$("#continueBtn").prop("href","/load?type="+data['file']+(data["Geometry"]?"&stype="+data["Geometry"]:""));
		if(data['Extent']||data['Layer name'])
		{
			var message="<h3>Successfully uploaded files:</h3><b>Layer name:</b> " + data["Layer name"] 
			+ (data["Extent"]? "<br><b>Extent:</b> " + data["Extent"]:"")
			+ "<br><b>Count:</b> " + data["Feature Count"]
			+ "<br><b>File type:</b> " + data['file']
			+ "<br><b>Geometry type:</b> "  + data["Geometry"];
			$scope.status=message;
			$scope.tableName = data["Layer name"];
			$scope.geometype=data.Geometry;
			if(data.Geometry=='None'){
				$scope.isSpatial=false;
				$scope.completed=true;
				//$("#continueBtn").text("Continue to summary").prop("href","/summary");
				//<a href="/load" class="btn btn-default btn-continue" id="">
			}
			else $scope.isSpatial=true;
		}
		else{
			$scope.err=true;
			$scope.status="Unable to recognize valid data " + data.err?data.err:"";
		}
	})
	.error(function(data,status,headers,config){
		
	});
}

function getSoilsStatus($scope,$http){
	var url ="/load/" + $scope.pid;
	//var url = "/load/" + fileName+ "?step=2";
	$scope.soilsprogress=0;
	checkStep($scope,$http,url,{step:2,fileName:$scope.filename,tableName:$scope.tableName});
}

function checkStep($scope,$http,url,params){
	$http.get(url,{params:params})
	.success(function(data,status,headers,config) {	
		if(!data.step){
			console.log("Invalid step");
			return;
		}
		if(data.err)
		{
			// $('<div class="alert alert-danger"/>')
			// .html(data.err).insertAfter('#stepsWizard');

			return;
		}
		var idName;
		if(data.id){
			 params['idName']=data.id[0].name;
			// sessionStorage.setItem("idName",idName);
		}
		data.step++;
		$scope.soilsprogress+=25;
		//var param = (idName?"&idName="+idName:"");
		//if(data.step==3)param+=($scope.filetype?"&type="+$scope.filetype:"")+($scope.geomtype?"&stype="+$scope.geomtype:"");

		if(data.step<6){
			params.step=data.step;
			setTimeout(function(){
				checkStep($scope,$http,url,params);
			},5000);
		}
		else {
			$scope.completed=true;
		}	
	})
	.error(function(data,status,headers,config){
	});

}