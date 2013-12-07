angular.module("transportBiddingApp")
        .controller("UploadCtrl", ['$scope', '$http',
  function($s, http) {
    http.get("/api/coordinators").success(function(data) {
      $s.coordinatorList = data;
    });
  }]);