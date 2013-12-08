angular.module("transportBiddingApp")
        .controller("TempBidCtrl", ['$scope', '$http',
  function($s, http) {
    http.get("/api/transport_cycle").success(function(data) {
      $s.transportCycleList = data;
      $s.transportCycle = data[0];
      $s.updateBidders($s.transportCycle._id);
    });

    $s.updateBidders = function(tc_id) {
      http.get("/api/bidders/" + tc_id).success(function(data) {
        $s.bidderList = data;
      }); 
    };

    $s.getSelectedBidders = function(bidderList) {
      return $s.bidderList.filter(function(e) {
        return e.isSelected == true;
      });
    };
  }]);
