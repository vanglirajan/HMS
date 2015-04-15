var HMSApp = angular.module('HMSApplication', ['ngRoute']);

var tempPat;

HMSApp.directive('capitalizeFirst', function($parse) {
   return {
     require: 'ngModel',
     link: function(scope, element, attrs, modelCtrl) {
        var capitalize = function(inputValue) {
           if (inputValue === undefined) { inputValue = ''; }
           var capitalized = inputValue.charAt(0).toUpperCase() +
                             inputValue.substring(1);
           if(capitalized !== inputValue) {
              modelCtrl.$setViewValue(capitalized);
              modelCtrl.$render();
            }         
            return capitalized;
         }
         modelCtrl.$parsers.push(capitalize);
         capitalize($parse(attrs.ngModel)(scope)); // capitalize initial value
     }
   };
});


HMSApp.controller('HMSController', function ($scope,$http) {
  
});

HMSApp.controller('loginController', function ($scope,$http) {
   
});

HMSApp.controller('PatientDetailsController', function ($scope,$http,$routeParams,$location) {
  
    
	 $scope.patient = [];
	 $scope.pat = {};  
	 var tempPat;
	 
    $http.get("/GetMyPatients")
            .success(function (response) {
        
        var patid = getQueryVariable('id');
        
        $scope.EditPanel = true;
        $scope.InfoPanel = false;
        
        $.each(response, function (key, value) {
            var objPat = value;
            $.each(objPat, function (key, value) {
                
                var bools = key == '_id';
                bools = value == patid;
                if (bools) {
                    $scope.pat = objPat;
                }
            });
        });
	
    });

	 

	 $scope.updatePatientTrigger = function() {   	
	    $scope.EditPanel = !$scope.EditPanel; 
	    $scope.InfoPanel = !$scope.InfoPanel; 
       };


     $scope.updatePatient = function() {
	    
				if(!$scope.EditPanel)
				{
				   var jdata = 'patient='+JSON.stringify($scope.pat);
				   
					$http({
					method: 'POST',
					url: '/UpdatePatientInfo',
					data:  jdata ,
					headers: {'Content-Type': 'application/x-www-form-urlencoded'}
						 })
				   .success(function (response) {
						 tempPat= response;	   
						
						 $scope.patient =tempPat;
						  
							  $.each( tempPat, function( key, value ) {
								 var objPat=value;
								 $.each( objPat, function( key, value ) {
								 var bools= key == '_id';
								  bools=value == patid;
								 if(bools)
								{
								  $scope.pat = objPat;
								}
								});
							});
						  
						  
						  
					})
				   .error(function(response) {
						  console.log("error"); // Getting Error Response in Callback
						  $scope.codeStatus = response || "Request failed";
						  console.log($scope.codeStatus);
				   });
				}
				
				$scope.EditPanel = !$scope.EditPanel; 
				$scope.InfoPanel = !$scope.InfoPanel; 				
				
	   };
     
	  $scope.reset = function() {
        $scope.pat = {};
    };
	
});




HMSApp.controller('AllPatientsController', function ($scope, $http) {
    
	
	 $scope.SearchPatient = function(firstname) {
	 var jdata = 'patientName='+JSON.stringify(firstname);
	      $http({
				method: 'POST',
				url: '/SearchPatient',
				data:  jdata ,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(function (response) {
                tempPat= response;	   
				$scope.patient = [];
				$scope.patient =tempPat;
			})
			.error(function(response) {
					  console.log("error"); // Getting Error Response in Callback
					  $scope.codeStatus = response || "Request failed";
					  console.log($scope.codeStatus);
			 });
			 
	 
	 };
	  $scope.SearchDoctor = function(drname) {
	  var jdata = 'doctorName='+JSON.stringify(drname);
	      $http({
				method: 'POST',
				url: '/SearchDoctor',
				data:  jdata ,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(function (response) {
                tempPat= response;	   
				$scope.patient = [];
				$scope.patient =tempPat;
			})
			.error(function(response) {
					  console.log("error"); // Getting Error Response in Callback
					  $scope.codeStatus = response || "Request failed";
					  console.log($scope.codeStatus);
			 });
			 
	 
	 };
	 
    $http.get("/GetAllPatients")
            .success(function (response) {
        
        tempPat = response;
        $scope.patient = [];
        $scope.patient = tempPat;
    });
		   			  
});

HMSApp.controller('PatientListController', function ($scope, $http) {

    $http.get("/GetMyPatients")
            .success(function (response) {
            
            tempPat= response;	   
            $scope.patient = [];
            $scope.patient =tempPat;
    });

    $scope.DeletePatient = function (patientID) {
        var jdata = 'patientID=' + JSON.stringify(patientID);
        $http({
            method: 'POST',
            url: '/DeletePatient',
            data: jdata ,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
			.success(function (response) {
             
            $http.get("/GetMyPatients")
            .success(function (response) {
                
                tempPat = response;
                $scope.patient = [];
                $scope.patient = tempPat;
            });

        })
			.error(function (response) {
            console.log("error"); // Getting Error Response in Callback
            $scope.codeStatus = response || "Request failed";
            console.log($scope.codeStatus);
        });
			 
	 
    };
		   			  
});

HMSApp.controller('NewPatientController', function ($scope, $http,$location) {

    $scope.patient = {};  
    $scope.AddPatient = function() {
	
	
	
		var jdata = 'patient='+JSON.stringify($scope.patient);
		
		  $http({
				method: 'POST',
				url: '/AddPatient',
				data:  jdata ,
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.success(function (response) {
            
            alert(response);
            $scope.patient = {};  
         
			})
			.error(function(response) {
					  console.log("error"); // Getting Error Response in Callback
					  $scope.codeStatus = response || "Request failed";
					  console.log($scope.codeStatus);
			 });
	   };
  
});

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) { return pair[1]; }
    }
    return (false);
}