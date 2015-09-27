angular.module('app.services', [])

.factory('Auth', ['$firebaseAuth', function($firebaseAuth){
    var ref = new Firebase("https://watchdoglb.firebaseio.com");


    var tempRef = new Firebase("https://watchdoglb.firebaseio.com/reports");
    var done = function(error) {
      if (error) {
        console.log('Synchronization failed');
      } else {
        console.log('Synchronization succeeded');
      }
    };
    tempRef.remove();

    return $firebaseAuth(ref);
}])
.factory('Report', ['$firebaseAuth', '$firebaseArray','$firebaseObject', function($firebaseAuth, $firebaseArray, $firebaseObject){
    // get Firebase from AUTH !
    var reportsUrl = "https://watchdoglb.firebaseio.com/reports";

    //move to config file/constants
    var ref = new Firebase("https://watchdoglb.firebaseio.com/reports");
    var reportList = $firebaseArray(ref);
    
    //need rewrite !
    var Report = function() {
        this.recordID = null;
        this.recordObj = null;

        this.category  = null; 
        this.created_at = null;
        this.description = null;
        this.coordinates = null;
        this.sentiment_score = 0;
        this.image = null; 
        this.region = null;
        this.downvotes = 0;
        this.upvotes = 0;

        this.UID = null;
        this.created_on = Firebase.ServerValue.TIMESTAMP;

        this.setCoordinates = function(lat, lon) {
            this.coordinates = {
                latitude : lat,
                longitude : lon
            }
        };


        this.setUID = function(UID) {
            this.UID =UID;
        };

        this.setImage = function(image) {
            this.image = image;
        };

        this.setDescription = function(description) {
            this.description = description;
        };
        this.setCategory = function(category) {
            this.category = category;
        }

        this.setRegion = function(region) {
            this.region = region;
        };

        this.downvote = function() {
            this.downvotes -= 1;
        };

        this.upvote = function() {
            this.upvotes += 1;
        };

        this.prepareReport = function() {
            return  {
                category : this.category,
                created_at: this.created_at,
                description: this.description,
                from_twitter: true,
                coordinates : this.coordinates,
                sentiment_score :  this.sentiment_score,
                image: this.image,
                region: this.region,
                upvotes: this.upvotes,
                downvotes: this.downvotes
            
            };
        };

        this.updateByRecordID = function(recordID) {

        }

        this.save = function() {
            var report = this.prepareReport();
            if (this.recordID) {
                console.log("Here 2");
                return ref.child(this.recordID).update(report);
            }
            
            var self = this;
            return reportList.$add(report)
            .then(function(record){
                recordID = record.key();
                var objectRef= new Firebase(reportsUrl+'/'+recordID);
                self.recordID = recordID;
                self.record = $firebaseObject(objectRef);
            })
            .catch(function(err){
                throw "Error : ", err;
            });
        };
        this.getLatest = function(count) {
              var query = ref.orderByChild("created_on").limitToLast(count);
              return $firebaseArray(query);
        }

    }

    return Report;
}])
.factory('Reports', ['$firebaseArray', '$firebaseObject', function($firebaseArray, $firebaseObject){
    
    var reportsUrl = "https://watchdoglb.firebaseio.com/reports";

    var ref = new Firebase(reportsUrl);
    var reportList = $firebaseArray(ref);
    

    var Reports = {

        
        /******
        * 
        * Returns a promise which is resolved when the initial 
        * object data has been downloaded from the database. 
        * The promise resolves to the $firebaseObject itself.
        *
        */
        getByID: function(id) {
            return $firebaseObject(ref.child(id)).$loaded();
        }, 
        getLatest : function(count) {
              var query = ref.orderByChild("created_on").limitToLast(count);
              return $firebaseArray(query);
        },
        getGeotagged: function(count) {
            var ref = new Firebase(reportsUrl);
            var query = ref.orderByChild('has_image').startAt('0');//.limitToLast(count);
            return $firebaseArray(query);
        }
    }

    return Reports;
}])

.factory('Modal',['$ionicModal', function($ionicModal){


      var Modal = function($scope, templateUrl) {
        this.$scope = $scope;
        $ionicModal.fromTemplateUrl(templateUrl, {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
          });
          $scope.$on('$destroy', function() {
            $scope.modal.remove();
          });

      };


      Modal.prototype = {
            open : function() {
                this.$scope.modal.show();
            },
            close: function() {
                this.$scope.modal.hide();     
            }
        };



      return Modal;

}])
.filter('region', function() {

  // In the return function, we must pass in a single parameter which will be the data we will work on.
  // We have the ability to support multiple other parameters that can be passed into the filter optionally
  return function(input, optional1, optional2) {

    var output;
    switch(input) {
        case 'beirut' :
            output = "Beirut"
            break;
        case 'nabatieh' :
            output = "Nabatieh";
            break;

        case 'north' :
            output = "North Lebanon";
            break;

        case 'mountlebanon' :
            output = "Mount Lebanon"
            break;

        case 'south' :
            output = "South Lebanon";
            break;
        default:
            output = "Lebanon";
            break;
    }
    // Do filter work here

    return output;

  }

});
;