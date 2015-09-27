
angular.module('app', ['ionic',  'firebase', 'app.services', 'app.controllers', 'linkify',  'uiGmapgoogle-maps', 'ngCordova', 'angularReverseGeocode' ])

.run(['$ionicPlatform', '$rootScope', '$state', function($ionicPlatform,$rootScope,$state) {
  
  $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
    // We can catch the error thrown when the $requireAuth promise is rejected
    // and redirect the user back to the home page
    if (error === "AUTH_REQUIRED") {
      $state.go('login');
    }
  });

  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleLightContent();
    }
  });
}])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider
  
  .state('home', {
    url: '/home',
    templateUrl: 'templates/home.html',
    controller: 'HomeCtrl' ,
    resolve: {
      // controller will not be loaded until $waitForAuth resolves
      
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$waitForAuth();
      }]
    }
  })

  .state('intro', {
    url: '/intro',
    templateUrl: 'templates/intro.html',
    controller: 'IntroCtrl', 
    resolve: {
      // controller will not be loaded until $waitForAuth resolves
      
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$waitForAuth();
      }]
    }
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl',
    resolve: {
      // controller will not be loaded until $waitForAuth resolves
      
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$waitForAuth();
      }]
    }
  })

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl',
     resolve: {
      // controller will not be loaded until $waitForAuth resolves
      
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$waitForAuth();
      }]
    }
  })

   .state('forgot', {
    url: '/forgot',
    templateUrl: 'templates/forgot.html',
    controller: 'ForgotCtrl',
     resolve: {
      // controller will not be loaded until $waitForAuth resolves
      
      "currentAuth": ["Auth", function(Auth) {
        // $waitForAuth returns a promise so the resolve waits for it to complete
        return Auth.$waitForAuth();
      }]
    }
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.map', {
    url: '/map',
    views: {
      'tab-map': {
        templateUrl: 'templates/tab-map.html',
        controller: 'MapCtrl'
      }
    }
  })

  .state('tab.report', {
      url: '/report',
      views: {
        'tab-report': {
          templateUrl: 'templates/tab-report.html',
          controller: 'ReportCtrl',
          resolve: {
            "currentAuth": ["Auth", function(Auth) {
              return Auth.$requireAuth();
            }]
          }
        }
      }
    })

  .state('tab.feed', {
    url: '/feed/',
    views: {
      'tab-feed': {
        templateUrl: 'templates/tab-feed.html',
        controller: 'FeedCtrl',
         resolve: {
            "currentAuth": ["Auth", function(Auth) {
              return Auth.$waitForAuth();
            }]
          }
      },

    }
  })
  .state('tab.feed-detail', {
    url: '/feed/:feedID',
    views: {
      'tab-feed': {
        templateUrl: 'templates/tab-feed-detail.html',
        controller: 'FeedDetailCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/intro');

});
