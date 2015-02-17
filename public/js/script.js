//create the module and name it maApp
var maApp = angular.module('maApp', ['ngRoute','angularFileUpload','ui.bootstrap']);// ,'ngResource'
var user;

//configure our routes
maApp.config(function($routeProvider,$locationProvider) {
	$routeProvider

	.when('/', {
		templateUrl : 'pages/intro.html',
		controller  : 'mainController'
	})

	// route for the home page
	.when('/models', {
		templateUrl : 'pages/model.html',
		controller  : 'modelController'
	})
	// route for the demo
	.when('/demo', {
		templateUrl : 'pages/demo.html',
		controller  : 'demoController'
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
	// route for the residuals page
	.when('/projects/:id/tables/:tid/residuals', {
		templateUrl : 'pages/residuals.html',
		controller  : 'residualsController'
	})
	// route for the predict page
	.when('/projects/:id/tables/:tid/predictions', {
		templateUrl : 'pages/predict.html',
		controller  : 'predictController'
	})
	// route for the subject page
	.when('/projects/:id/tables/:tid/subject', {
		templateUrl : 'pages/subject.html',
		controller  : 'subjectController'
	})
	// route for the report page
	.when('/projects/:id/tables/:tid/reports/:sid/table', {
		templateUrl : 'pages/ma.html',
		controller  : 'maController'
	})
	// route for the report page
	.when('/projects/:id/tables/:tid/reports/:sid', {
		templateUrl : 'pages/report.html',
		controller  : 'reportController'
	})
	// route for the report page
	.when('/projects/:id/tables/:tid/reports/:sid/row/:id', {
		templateUrl : 'pages/report.html',
		controller  : 'reportController'
	})

	// route for the contact page
	.when('/contact', {
		templateUrl : 'pages/contact.html',
		controller  : 'contactController'
	})
	.otherwise({ redirectTo: '/' });	
});
/*
maApp.factory('Data', function () {
	return { message: "I'm data from a service" };
});
 */
maApp.filter('numformat', function($filter) {
	return function(input, type) {
		var out=input;
		//$filter('currency')(amount, symbol, fractionSize)
		if(type=='currency')out=$filter('currency')(out);
		else if(type=='numeric')out=$filter('number',2)(out);
		else if(type=='timestamp with time zone'){
			out=$filter('date')(new Date(out * 1000), "MM/dd/yyyy")
			//out=new Date(out * 1000).format('mm/dd/yyyy');
		}
		return out;
	};
});

//create the controller and inject Angular's $scope
maApp.controller('mainController', function($rootScope,$scope, $http, $location) {

	$scope.showNewProject=false;	
	$rootScope.mode="user";
	$rootScope.username=null;
	if(sessionStorage.getItem("username")){
		$rootScope.username=sessionStorage.getItem("username");
	}
	$scope.viewModels=function(){
		$location.path("/models");	
	}
	
	$scope.viewProject = function (id) {

		if(id){
			$rootScope.pid=id;
			$location.path("/projects/"+id+"/tables");
		}
		else $location.path(getURL('',3));
	};		
	// tables
	$scope.viewComparable = function (id) {
		// $rootScope.tid=id;
		// $location.path("/projects/"+this.pid+"/tables/"+id+"/summary");
		if(id)$location.path(getURL(id+"/summary",1));
		else $location.path(getURL("summary"))
	};
	// demo
	$scope.viewDemo = function() {
		$location.path("/demo");
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
	// residuals	
	$scope.viewResiduals = function () {
		$location.path(getURL("residuals"));
	};
	//predict
	$scope.viewPredictions = function () {
		$location.path(getURL("predictions"));
	};
	//report using subject property
	$scope.viewSubject = function () {
		$location.path(getURL("subject"));
	};

	//report using subject property
	$scope.viewReport = function () {
		$location.path(getURL("reports"));
	};
	//report using subject property
	$scope.viewMAReport = function (id) {
		//$location.path(window.location.hash.substring(1)+"/row/" + id);
		$location.path(getURL("row")+"/"+ id);
	};

	//goto using breadcrumbs
	$scope.gotoUrl = function (name,len) {
		$location.path(getURL(name,len));
	};
/*
	if(sessionStorage.getItem("username")){
		console.log("Found username" + sessionStorage.getItem("username"));
		$location.path("/models");
		return;
	};
*/
});

//create the controller and inject Angular's $scope
maApp.controller('modelController', function($rootScope,$scope, $http, $location) {

	$rootScope.pid=null;
	$rootScope.tid=null;

	$http.get('/projects')
	.success(function(data, status, headers, config) {
		$scope.project = data;
		$rootScope.username=data.user;
		sessionStorage.setItem("username",data.user);
	})
	.error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			

	// projects
	$scope.createProject = function () {
		$scope.errMsg=null;
		var frm=document.forms['newprojfrm'];
		var name=frm.name.value;
		if(name==''){
			this.errMsg="Please enter a project name";
			return false;
		}		
		//var state=frm.state.options[frm.state.selectedIndex].value;
		// see if name already taken, else create it
		$http.put('/projects', { name:name })
		.success(function(data, status, headers, config) {
			$location.path("/projects/"+data.id+"/tables");
		})
		.error(function(data, status, headers, config ){ 
			if(status==404)$location.path("/login")
			$scope.errMsg="Project name is already in use.  Please select a different name";
		});
	};


	$scope.deleteProject = function (id,a) {
		$scope.errMsg=null;
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

maApp.controller('accountController', function($rootScope,$scope,$http,$location) {
	$http.get('/auth/userinfo').
	success(function(data, status, headers, config) {
		$scope.user = data;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")		
	});
	$scope.logout=function(){
		$http.get('/logout')
		.success(function(data, status, headers, config) {
			$scope.project = data;
			$rootScope.username=null;
			sessionStorage.removeItem("username");
			$location.path("/");
		})
		.error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
			else $location.path("/");
		});			

	}
});

maApp.controller('contactController', function($scope) {

});

maApp.controller('loginController', function($scope,$http) {
//	try to automatically log in if user still logged in to Google
	if(sessionStorage.getItem("username")){
		console.log("Found username" + sessionStorage.getItem("username"));
		$http.get('/auth/google').
		success(function(data, status, headers, config) {
			console.log("Redirecting");
			$location.path(getURL("/models"));
			//$scope.user = data;
		}).
		error(function(data, status, headers, config) {
			console.log("Error - force manual login");
			// log error
			//if(status==404)$location.path("/login")		
		});			
	}
	else $location.path(getURL("/models"));

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
	$scope.tid =  $modalInstance.tid;
	$scope.maxSteps = $modalInstance.maxSteps;
	$scope.msg=["Getting information about data","Loading data into database","Determining which fields to include","Intersecting geometries with USDA Soils polygons","Creating new table containing uploaded data and soils information","",""];
	$scope.renderHtml = function(html_code)
	{
		return $sce.trustAsHtml(html_code);
	};
	$scope.uploader=createUploader($scope,$http,FileUploader,$modalInstance);

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
		modalInstance.maxSteps=$scope.maxSteps=6;
		modalInstance.result.then(function (newfile) {
			//$scope.selected = selectedItem;
			//insert file into list of layers
			$scope.list();
		}, function () {
			//$log.info('Modal dismissed at: ' + new Date());
			console.log('Modal dismissed at: ' + new Date());
		});

	};
	$scope.viewSubject = function (tid,id,numTuples) {
		///projects/30/tables
		if(numTuples>1)
		{
			///projects/30/tables/102/reports/105/table
			if(id)$location.path(window.location.hash.substring(1)+"/"+tid+"/reports/"+id+"/table")
			else $location.path(window.location.hash.substring(1) +"/"+tid);
		}
		else
		{
			///projects/30/tables/102/reports/104
			if(id)$location.path(window.location.hash.substring(1)+"/"+tid+"/reports/"+id)
			else $location.path(window.location.hash.substring(1) +"/"+tid);
		}
	};	
	$scope.deleteCompTable = function (id) {
		// $location.path("/project/"+id);
		var url='/projects/'+this.pid+'/tables/'+id;
		$http.delete(url)
		.success(function(data, status, headers, config) {
			// remove tr from table
			// remove tr from table
			var index = -1;		
			for( var i = 0; i < $scope.project.comps.length; i++ ) {
				if( $scope.project.comps[i].id === id ) {
					index = i;
					break;
				}
			}
			if( index === -1 ) {
				alert( "Something gone wrong" );
			}
			$scope.project.comps.splice( index, 1 );						

		})
		.error(function(data, status, headers, config ){ 
			// console.log( errorThrown );
			if(status==404)$location.path("/login")
			else $scope.errMsg="Unable to remove this table";
			// $("#events-result").show().html("Project name is already in use.
			// Please select a different name")
		});
	};
	$scope.deleteSubjTable = function (id) {
		// $location.path("/project/"+id);
		var url='/projects/'+this.pid+'/tables/'+id;
		$http.delete(url)
		.success(function(data, status, headers, config) {
			// remove tr from table
			// remove tr from table
			var index = -1;		
			for( var i = 0; i < $scope.project.subjects.length; i++ ) {
				if( $scope.project.subjects[i].id === id ) {
					index = i;
					break;
				}
			}
			if( index === -1 ) {
				alert( "Something gone wrong" );
			}
			$scope.project.subjects.splice( index, 1 );						

		})
		.error(function(data, status, headers, config ){ 
			// console.log( errorThrown );
			if(status==404)$location.path("/login")
			else $scope.errMsg="Unable to remove this table";
			// $("#events-result").show().html("Project name is already in use.
			// Please select a different name")
		});
	};
});

maApp.controller('summaryController', function($rootScope,$scope,$http,$location,$window) {
	$scope.selectField = function(field,include) {
		//console.log(field)
		//console.log($scope.include);
		$http.put(getURL("summary"),{ name:field, field: 'include',value: include?1:0})
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
	$scope.selectId = function(field) {
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
	$scope.selectDepVar = function(field) {
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

	$scope.selectSaleDate = function(field) {
		console.log(field)
		$http.put(getURL("summary"),{ name:field, field: 'saledate',value: 1})
		.success(function(data, status, headers, config) {
			console.log(data);
		})
		.error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});
	};

	$scope.downloadTable = function() {
		var url = getURL("download");
		$window.open(url);
		/*
		$http.get(getURL("download")).
		success(function(data, status, headers, config) {
			console.log("Download successful")
		}).
		error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
			console.log("Error in download: " + data)
		});			
		 */
	}
	$scope.showMap = function() {
		var url = getURL("map");
		$window.open(url);
	}

	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		$scope.id=1;
		$scope.depvar=1;
		$scope.saledate=1;
		$scope.summary = data;
		$scope.tableName=data.alias;

		// hide
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});

maApp.controller('correlationController', function($rootScope,$scope,$http,$location) {

	$scope.selectField = function(field,ch) {
		console.log(field)
		$http.put(getURL("correlation"),{ name:field, field: 'include',value: ch?1:0})
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
	$scope.refreshTable = function() {
		$scope.correlation=null;
		$scope.getData();
	}
	$scope.getData = function(){
		$http.get($location.$$url).
		success(function(data, status, headers, config) {
			$scope.tableName=data.alias;

			var tmpdata=[];
			$scope.id=1;
			for(var i in data.names)
			{
				var vif=0;
				if(i>0){
					vif=1;
					if(data.results.cor[0][data.names[i].name]<0.4)
						data.names[i].cls='danger';
					else{
						data.names[i].cls='warning';
						for(var j in data.results.vif){
							if(data.results.vif[j]==data.names[i].name){
								data.names[i].cls='success';
								break;
							}
						}
					}

				}
				else data.names[i].cls='info';
				var vals=[];
				for(var j in data.names)vals.push(data.results.cor[i][data.names[j].name]);
				tmpdata.push({field:data.names[i],vals:vals});
			}
			$scope.correlation = tmpdata;
			console.log(tmpdata);
		}).
		error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});	
	}
	$scope.getData();
});
/*
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
 */
maApp.controller('regressionController', function($scope,$http,$location) {
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		for(var i=0;i<data.vals.coef.length;i++)data.vals.coef[i]['name']=data.vals.names[i];
		$scope.regression = data.vals;
		$scope.tableName=data.alias;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});
maApp.controller('stepwise_regressionController', function($scope,$http,$location) {
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		for(var i=0;i<data.vals.coef.length;i++)data.vals.coef[i]['name']=data.vals.names[i];
		var sum="<b>Formula: </b>" + data.vals.names[0] + " = " + data.vals.coef[0]['Estimate'] ;
		for(var i=1;i<data.vals.coef.length;i++)
			sum += " + " +data.vals.names[i] + " * " + data.vals.coef[i]['Estimate'];
		data.formula=sum;
		$scope.swregression = data.vals;
		$scope.tableName=data.alias;
	}).
	error(function(data, status, headers, config) {
		// log error
		if(status==404)$location.path("/login")
	});			
});

maApp.controller('residualsController', function($scope,$http,$location) {
	$scope.useSW=false;
	$scope.getResiduals=function(){
		$http.get($location.$$url+($scope.useSW?"?nosw=1":"")).
		success(function(data, status, headers, config) {
			$scope.residuals = data;
			$scope.totalItems = data.total;
			$scope.currentPage = 0;
			$scope.tableName=data.alias;
			$scope.getData(0);
		}).
		error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});
	}
	$scope.tableURL = $location.$$url.slice(0,-10);

	$scope.getData = function(page){
		$http.get($scope.tableURL+"?offset="+($scope.maxSize*page)+"&limit="+$scope.maxSize+($scope.useSW?"&nosw=1":"")).
		success(function(data, status, headers, config) {
			$scope.residualsdata = $scope.processData(data.rows);
		}).
		error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});
	}
	$scope.setPage = function (pageNo) {
		$scope.currentPage = pageNo;
	};

	$scope.pageChanged = function() {
		//$log.log('Page changed to: ' + $scope.currentPage);
		$scope.tabledata=null;
		$scope.getData($scope.currentPage);

	};

	$scope.maxSize = 15;
	//$scope.bigTotalItems = 15;
	//$scope.bigCurrentPage = 0;
	$scope.toggleRegression=function()
	{
		$scope.getResiduals();
		$scope.currentPage=0;
		$scope.pageChanged();
	}

	$scope.calc=function (row)
	{
		var ret=$scope.residuals.vars.coef[0].Estimate;
		for(var i=1;i<$scope.residuals.vars.names.length;i++)
		{
			ret += $scope.residuals.vars.coef[i].Estimate * row[$scope.residuals.vars.names[i]];
		}
		return ret;
	}

	$scope.processData = function(data){
		var depvar=$scope.residuals.vars.names[0];
		if(!$scope.residualscolumns){
			var id=$scope.residuals.id.trim();//.replace(/"/g,"")
			$scope.residualcolumns=[id,depvar,"Predicted "+depvar,"Range - Lower "+depvar,"Range - Higher "+depvar,"Sale price within range"];
			$scope.residualsfields=[id,depvar,depvar+"_pred",depvar+"_lwr",depvar+"_hgr",depvar+"_inrng"];
			$scope.residuals.names[depvar]='currency';
			$scope.residuals.names[depvar+"_pred"]='currency';
			$scope.residuals.names[depvar+"_lwr"]='currency';
			$scope.residuals.names[depvar+"_hgr"]='currency';
			for(var i in data[0]){
				if(i!=id&&i!=depvar){
					$scope.residualcolumns.push(i);
					$scope.residualsfields.push(i);
				}
			}
		}
		//(col,key) in residualsdata[0] track by $index
		for(var i=0;i<data.length;i++){
			data[i][depvar]          = data[i][depvar]; 	
			data[i][depvar+"_pred"]  = $scope.calc(data[i]);
			data[i][depvar+"_lwr"]   = data[i][depvar+"_pred"] - $scope.residuals.vars.stderr;
			data[i][depvar+"_hgr"]   = data[i][depvar+"_pred"] + $scope.residuals.vars.stderr;
			data[i][depvar+"_inrng"] =  (data[i][depvar]<data[i][depvar+'_pred']+$scope.residuals.vars.stderr && data[i][depvar]>data[i][depvar+'_pred']-$scope.residuals.vars.stderr)?"Yes":"No";
		}
		return data;
	}
	$scope.getResiduals();
});

maApp.controller('predictController', function($scope,$http,$location,$filter) {
	$scope.getData=function(){
		$http.get($location.$$url).
		success(function(data, status, headers, config) {
			$scope.predictions = data;
			$scope.tableName=data.alias;
			/*
		var columns=[];//{field:"name",title:"",align:"right",class:"col"}];
		var dummyvals=[];
		var obj={};
		data.vars.names[0]=data.vars.names[0].replace(/\"/g," ").trim();//.replace(/ /g,"_");
		$scope.coeff[data.vars.names[0]]=parseFloat(data.vars.coef[0]['Estimate']);
		//skip first field since it's the price
		for(var i=1;i<data.vars.names.length;i++)
		{
			data.vars.names[i]=data.vars.names[i].replace(/\"/g," ").trim();//.replace(/ /g,"_");
			//columns.push({field:data.vars.names[i],title:data.vars.names[i],align:"right",formatter:nameFormatter});
			obj[data.vars.names[i]]=data.vars.names[i];
			coeff[data.vars.names[i]]=parseFloat(data.vars.coef[i]['Estimate']);
		}

		//dummyvals.push(obj);

		$scope.predictions = data;
			 */
		}).
		error(function(data, status, headers, config) {
			// log error
			//if(status==404)$location.path("/login")
		});		
	}
	$scope.getData();
	$scope.calculatePrediction=function(){
		$scope.prediction="";
		$scope.prederror=false;
		var result=parseFloat($scope.predictions.vars.coef[0].Estimate);
		var frm=document.forms['predfrm'];
		try{
			for(var i=1;i< $scope.predictions.vars.names.length;i++)
			{
				var name = $scope.predictions.vars.names[i];
				if(frm.elements[name])
				{
					if( frm.elements[name].type=='text' && frm.elements[name].name){
						//is it a date?
						if( $scope.predictions.fields[frm.elements[name].name]=='timestamp with time zone'){
							var d=Date.parse(frm.elements[name].value);
							if(isNaN(d)){$scope.prederror=true;$scope.prediction="Invalid date entered for " + frm.elements[name].name+".  Use format MM/DD/YYYY.";return;}
							d /= 1000;
							result +=  d * parseFloat($scope.predictions.vars.coef[i].Estimate);
						}
						else{
							if(isNaN(frm.elements[name].value)){$scope.prederror=true;$scope.prediction="Invalid number entered for " + frm.elements[name].name+".";return;}
							var d = parseFloat(frm.elements[name].value.replace(/,/g,''));
							result += d * parseFloat($scope.predictions.vars.coef[i].Estimate);
						}
					}
				}
			}
		}catch(e){console.log(e);}

		/*
		try{
			for(var i in $scope.predictions.vars.coef)
			{
				if(frm.elements[i])
				{
					if( frm.elements[i].type=='text' && frm.elements[i].name){
						//is it a date?

						if( $scope.predictions.fields[frm.elements[i].name]=='timestamp with time zone'){
							var d=Date.parse(frm.elements[i].value)/1000;
							if(isNaN(d)){$scope.prediction="Invalid date entered for " + frm.elements[i].name+".  Use format MM/DD/YYYY.";return;}
							d /= 1000;
							result +=  d * parseFloat($scope.predictions.vars.coef[cidx++].Estimate);
						}
						else{
							if(isNaN(frm.elements[i].value)){$scope.prediction="Invalid number entered for " + frm.elements[i].name+".";return;}
							var d = parseFloat(frm.elements[i].value.replace(/,/g,''));

							result += d * parseFloat($scope.predictions.vars.coef[cidx++].Estimate);
						}
					}
					//else result+=parseFloat($scope.predictions.vars.coef[i].Estimate);
					//console.log(this.elements[i].value +" * " +  coeff[i] );
				}
			}
		}catch(e){console.log(e);}
		 */
		//console.log(priceFormatter(result));
		//		if(type=='currency')out=$filter('currency')(out);
		//else if(type=='numeric')out=$filter('number',2)(out);
		$scope.prediction="Predicted price: "+ $filter('currency')(result) ;
	}	
});

maApp.controller('subjectController', function($rootScope,$scope,$http,$location,$modal) {
	/*
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		$scope.subject = data;
		$scope.tableName=data.alias;

	}).
	error(function(data, status, headers, config) {
		if(status==404)$location.path("/login")
		// log error
	});
	 */
	$scope.list = function(){
		$http.get($location.$$url).
		success(function(data, status, headers, config) {
			$scope.subject = data;
			$scope.tableName=data.alias;

			//$scope.tables = data.rows;
			$scope.pid=data.pid;
			$scope.tid=data.tid;
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
		modalInstance.tid=$scope.tid;
		modalInstance.maxSteps=$scope.maxSteps=6;
		modalInstance.result.then(function (newfile) {
			//$scope.selected = selectedItem;
			//insert file into list of layers
			$scope.list();
		}, function () {
			//$log.info('Modal dismissed at: ' + new Date());
			console.log('Modal dismissed at: ' + new Date());
		});
	};
	$scope.viewSubject = function (id,numTuples) {
		if(numTuples>1)
		{
			if(id)$location.path(getURL("reports") + "/" + id + "/table")
			else $location.path(getURL(id+"/reports",1) + "/" + id + "/table");
		}
		else
		{
			if(id)$location.path(getURL("reports") + "/" + id)
			else $location.path(getURL(id+"/reports",1) + "/" + id);
		}
	};

	$scope.deleteSubjTable = function (id) {
		//var url="" + $location.path("/project/"+id);
		var url='/projects/'+$scope.pid+'/tables/'+id;
		//($location.$$url+"/tables/"+id
		$http.delete(url)
		.success(function(data, status, headers, config) {
			// remove tr from table
			// remove tr from table
			var index = -1;		
			for( var i = 0; i < $scope.subject.rows.length; i++ ) {
				if( $scope.subject.rows[i].id === id ) {
					index = i;
					break;
				}
			}
			if( index === -1 ) {
				alert( "Something gone wrong" );
			}
			$scope.subject.rows.splice( index, 1 );						

		})
		.error(function(data, status, headers, config ){ 
			// console.log( errorThrown );
			if(status==404)$location.path("/login")
			else $scope.errMsg="Unable to remove this table";
			// $("#events-result").show().html("Project name is already in use.
			// Please select a different name")
		});
	};

});
maApp.controller('maController', function($rootScope,$scope,$http,$location,$modal) {
	/*
	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		$scope.report = data;
		$scope.tableName=data.alias;

	}).
	error(function(data, status, headers, config) {
		if(status==404)$location.path("/login")
		// log error
	});
	 */
	$scope.previous = function(){
		window.history.back();
	}
	$scope.list = function(){
		$http.get($location.$$url).
		success(function(data, status, headers, config) {
			$scope.subjectdata = data;
			$scope.pid=data.pid;
			$scope.tid=data.tid;
			$scope.tableName = data.alias;
		}).
		error(function(data, status, headers, config) {
			// log error
			if(status==404)$location.path("/login")
		});
	}
	$scope.list();
});
maApp.controller('reportController', function($rootScope,$scope,$http,$location) {

	$http.get($location.$$url).
	success(function(data, status, headers, config) {
		$scope.report = data;
		$scope.tableName=data.alias;
		$scope.subjectTableName=data.subject;
		if($scope.report.rows.length>1)
			$scope.drawMap();
	}).
	error(function(data, status, headers, config) {
		if(status==404)$location.path("/login")
		// log error
	});
	$scope.previous = function(){
		window.history.back();
	}
	$scope.drawMap=function(){
		if(typeof(L)==='undefined'){
			$('head').append('<link rel="stylesheet" href="/css/leaflet.css" type="text/css" />');
			$.getScript("/js/leaflet.js",function(){
				$scope.drawMap();
			});
			return;
		}

		var map = new L.Map('map');//, {center: center, zoom: 12, maxZoom: 20});
		var extent = $scope.report.rows[1].extent.split(",");
		var oid=$scope.report.id;
		map.fitBounds([
		               [extent[1],extent[0]],
		               [extent[3],extent[2]]
		               ]);
		//var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		//var osmAttrib='Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		//var street_layer = new L.TileLayer(osmUrl, { maxZoom: 19, attribution: osmAttrib});
		var Streets= new L.TileLayer("http://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}.png", {maxZoom: 19}).addTo(map);
		var Aerial=new L.TileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}.png", {maxZoom: 19});
		var Topo=new L.TileLayer("http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}.png", {maxZoom: 19});

		//var baseMaps = { "ESRI Streets": Streets, "ESRI Aerial":Aerial, "ESRI Topo":Topo , "OpenStreet": street_layer};

		//$('#files').bind('change', handleFileSelect);
		//map.addLayers([parcelLayer]);
		var parcelLayer = L.tileLayer.wms('/map', {
			format: 'image/png',
			transparent: true,
			opacity: 0.7,
			srs: 'EPSG:3857',
			id:oid,
			layers: $scope.subjectTableName
		}).addTo(map);

		L.control.scale({metric:false}).addTo(map);

	}
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
	if($scope.tid)url+="/tables/"+$scope.tid;
	var params={step:1,fileName:$scope.filename};
	if($scope.source=='subj')params['subj']=1;
	$scope.hasStatus=true;

	$http.get(url,{params:params})
	.success(function(data,status,headers,config) {
		$scope.err=false;
		$scope.id=data.id;

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
	$scope.stepMsg=$scope.msg[2];
	var url ="/load/" + $scope.pid+($scope.tid?"/tables/"+$scope.tid:"");
	//var url = "/load/" + fileName+ "?step=2";
	$scope.soilsprogress=0;
	var params={step:2,fileName:$scope.filename,tableName:$scope.tableName};
	if($scope.id)params.id=$scope.id;
	checkStep($scope,$http,url,params);
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
		if(data.id){
			params["id"]=data.id;
		}
		var idName;
		if(data.idname){
			params['idName']=data.idname[0].name;
			// sessionStorage.setItem("idName",idName);
		}
		data.step++;
		$scope.stepMsg=$scope.msg[data.step];
		$scope.soilsprogress += (100/($scope.maxSteps-2));
		//var param = (idName?"&idName="+idName:"");
		//if(data.step==3)param+=($scope.filetype?"&type="+$scope.filetype:"")+($scope.geomtype?"&stype="+$scope.geomtype:"");

		if(data.step<$scope.maxSteps){
			params.step=data.step;
			setTimeout(function(){
				checkStep($scope,$http,url,params);
			},5000);
		}
		else {
			//stop the progress bar by removing .active
			$scope.completed=true;
			$scope.stepMsg="";
		}	
	})
	.error(function(data,status,headers,config){
	});

}
function createUploader($scope,$http,FileUploader,$modalInstance){
	var uploader = $scope.uploader = new FileUploader({
		url: '/upload/'+$modalInstance.pid+($modalInstance.tid?"/tables/"+$modalInstance.tid:"")
	});
//	maxFileSize: 250000000,
//	acceptFileTypes: /(\.|\/)(shp|shx|dbf|prj|zip|csv|xls|xlsx)$/i

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
	return uploader;
}
