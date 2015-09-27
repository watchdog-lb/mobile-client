var DEFAULT_AUTH_STATE = 'tab.feed',
      DEFAULT_UNAUTH_STATE = 'home';

angular.module('app.controllers', [])

.controller('AppCtrl', function(){
})

.controller('IntroCtrl', function($state, currentAuth) {

  var isReturningUser = window.localStorage.getItem('v1:returning');
  if (isReturningUser || currentAuth) {
    $state.go(DEFAULT_AUTH_STATE);
  }

  window.localStorage.setItem('v1:returning', true);
})

.controller('HomeCtrl', function($scope, currentAuth, $state) {
  if (currentAuth) {
    $state.go(DEFAULT_AUTH_STATE);
  }
})

.controller('ForgotCtrl', function($scope, currentAuth, $state, Auth) {
  if (currentAuth) {
    $state.go(DEFAULT_AUTH_STATE);
  }

  $scope.user = {
    email : ''
  }

  $scope.state = {
      loading : false,
      error : null,
      done: false
  };

  $scope.resetPassword = function(){
    $scope.state.loading = true;
    Auth.$resetPassword({email : $scope.user.email}).then(function(){
      $scope.state.loading = false;
      $scope.state.done = true;
    }).catch(function(error){
      $scope.state.loading = false;
      $scope.state.error = error.message
    });
  }
})

.controller('MapCtrl', function($scope, Reports, $firebaseArray) {
  $scope.mapInstance = null;
  $scope.logout = function() {
    Auth.$unauth();
  }
  $scope.map = {center: {latitude: 33.875464, longitude: 35.6359222 }, zoom: 10, events:{
    tilesloaded: function(map){
      $scope.$apply(function(){ $scope.mapInstance = map; });
    }
  }};

  var reportsUrl = "https://watchdoglb.firebaseio.com/reports";
  var ref = new Firebase(reportsUrl);
  var query = ref.orderByChild('has_location').startAt(1);//.limitToLast(count);
  $scope.filteredReports =  $firebaseArray(query);
  // $scope.filteredReports = Reports.getGeotagged(25);
  $scope.options = {scrollwheel: true};
  $scope.$on('$ionicView.enter', function(e) {
   
    if ($scope.mapInstance) {
       google.maps.event.trigger($scope.mapInstance, 'resize')
      //$scope.mapInstance.checkResize();
   }
  });
  

})

.controller('ReportCtrl', function($scope, currentAuth, $cordovaCamera, $firebaseArray, $cordovaGeolocation, Report, $state) {

  $scope.state = {
    pictureShown : false,
    description : '',
    cameraError : null
  };

  $scope.initForm = function() {
      $scope.form = {
        region: '',
        imgPreview : null,
        category: null,
        description: ''
      }
    }

  $scope.initForm();

  var geolocationOptions = {timeout: 10000, enableHighAccuracy: false};

  $scope.submitReport = function() {

      var report = new Report();
      //Granuarally setting for now to get access to smaller picture from controller
      report.setUID(currentAuth.uid);
      report.setImage($scope.form.imgPreview);
      report.setRegion($scope.form.region);
      report.setDescription($scope.form.description);
      report.setCategory($scope.form.category);

      report.save().then(function(){
            $scope.initForm();
            $state.go(DEFAULT_AUTH_STATE);
      });

      $cordovaGeolocation
        .getCurrentPosition(geolocationOptions)
        .then(function (position) {
          var lat  = position.coords.latitude;
          var lon = position.coords.longitude;
          report.setCoordinates(lat, lon);
          report.save();
        }).catch(function(err){
          alert("Location sharing is not enabled in your device. Turn it on to add where it had happened.")
        });
  }

// Will crash if you try to use Camera specific functionaility before deviceReady. 
// This will also protect this code from being called and crashing in web environment

  document.addEventListener("deviceready", function () {
      var cameraOptions = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 250,
        targetHeight: 250,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false,
        correctOrientation:true
      };
      $scope.$on('$ionicView.enter', function(e) {
            $cordovaCamera.getPicture(cameraOptions).then(function(imageData) {
              $scope.state.pictureShown = true;
              $scope.state.imgPreview = "data:image/jpeg;base64," + imageData;
            }, function(err) {
              $scope.state.cameraError = err;
              
            });
      });

  });

})

.controller('FeedCtrl', ['$scope','Reports', 'Auth' , '$state' ,'currentAuth', 'Modal','$ionicListDelegate','linkifyFilter','$ionicLoading', 'regionFilter', function($scope, Reports, Auth, $state, currentAuth, Modal, $ionicListDelegate, linkifyFilter, $ionicLoading, regionFilter ) {
  
  $scope.currentAuth = currentAuth;
  $scope.logout = function() {
    Auth.$unauth();
    $scope.currentAuth = null;
  }

  var modal = new Modal($scope,'my-modal.html');

  $scope.vote = {};


  $scope.goToDetails = function(reportID) {
      //$ionicListDelegate.closeOptionButtons();
      window.location.href = "#/tab/feed/"+reportID;
  };

  $scope.goToLogin = function() {
    modal.close();
    window.location.href = "#/login";
  };

  $scope.close = function() {
    modal.close();
  }
  $scope.downvote = function(reportID) {
    $scope.vote[reportID] = 'down';
    if (currentAuth === null) {
      modal.open();
      return;
    }

    // Check if already downvoted



    var reportPromise = Reports.getByID(reportID);
    reportPromise.then(function(report) {
      
      $scope.report = report;
      if (typeof $scope.downvotes === 'undefined' || $scope.downvotes === null) { // For legacy data
          $scope.report.downvotes = -1;
      }
      else {
        $scope.report.downvotes -= 1;
      }
      $scope.report.$save();  
    })
    $ionicListDelegate.closeOptionButtons();
    return;

  };

  $scope.upvote = function(reportID) {
    $scope.vote[reportID] = 'up';
    if (currentAuth === null) {
      modal.open();
      return;
    }


    

    var reportPromise = Reports.getByID(reportID);
    reportPromise.then(function(report) {
      $scope.report = report;
      if (typeof $scope.upvotes === 'undefined' || $scope.upvotes === null || $scope.upvotes == 'NaN') { // For legacy data
          $scope.report.upvotes = 1;
      }
      else {
        $scope.report.upvotes += 1;
      }
      $scope.report.$save();
      $ionicListDelegate.closeOptionButtons();
    });

  };

  $ionicLoading.show({
      template: 'Loading... Yep, you got a bad connection'
  });
  $scope.filteredReports = Reports.getLatest(25);
  $scope.filteredReports.$loaded().then(function() {
    $ionicLoading.hide();
  })
}])

.controller('FeedDetailCtrl', function($scope, $stateParams, Reports, linkifyFilter) {

  Reports.getByID($stateParams.feedID).then(function(report){
    $scope.report  = report;
  });

})

.controller('RegisterCtrl', ['currentAuth','$scope', '$state', 'Auth',
  function(currentAuth, $scope, $state, Auth) {
    

    if (currentAuth) {
      $state.go('tab.map');
    }

    $scope.state = {
      loading : false
    };

    $scope.user = {
      email : '',
      password: ''
    };
    
    $scope.signUp = function(user) {

      $scope.error = null;
      $scope.state.loading = true;

      Auth.$createUser($scope.user).then(function(userData) {
        return Auth.$authWithPassword($scope.user);
      }).then(function(authData) {
        $scope.state.loading = false;
        $state.go('intro');
      }).catch(function(error) {
        $scope.state.loading = false;
        $scope.error = error.message;
      });
    }


  }])

.controller('LoginCtrl',['currentAuth','$scope', '$state', 'Auth', 
  function(currentAuth, $scope, $state, Auth) {
    
   $scope.state = {
      loading : false
    };

  $scope.user = {
    email : '',
    password: ''
  };

  $scope.signIn = function(user) {
    $scope.error = null;
    $scope.state.loading = true;

    Auth.$authWithPassword($scope.user)
    .then(
      function(authData){
        $scope.state.loading = false
        $state.go(DEFAULT_AUTH_STATE);
      })
    .catch(function(error) {
      $scope.state.loading = false;
      $scope.error = error.message;
    });

  }
  
}])

