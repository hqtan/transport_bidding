angular.module("transportBiddingApp")
        .controller("CoordinatorTableCtrl", ['$scope', '$http',
  function($s, http) {
    $s.sortReverse = {};
    $s.bidLatLonArray = [];
    $s.filterAddr = "";
    $s.isReverse = false;
    //make more generic @todo
    $s.filterCoordinator = function(item) {
      var isMatch = true;

      if (typeof $s.search_organisation != "undefined"
              && $s.search_organisation != "") {
        var regex = new RegExp($s.search_organisation, "i")
        isMatch = isMatch && regex.test(item.organisation);
      }
      if (typeof $s.search_first_name != "undefined"
              && $s.search_first_name != "") {
        var regex = new RegExp($s.search_first_name, "i")
        isMatch = isMatch && regex.test(item.first_name);
      }
      if (typeof $s.search_last_name != "undefined"
              && $s.search_last_name != "") {
        var regex = new RegExp($s.search_last_name, "i")
        isMatch = isMatch && regex.test(item.last_name);
      }
      if (typeof $s.search_mobile != "undefined"
              && $s.search_mobile != "") {
        var regex = new RegExp($s.search_mobile, "i")
        isMatch = isMatch && regex.test(item.mobile);
      }
      if (typeof $s.search_landline != "undefined"
              && $s.search_landline != "") {
        var regex = new RegExp($s.search_landline, "i")
        isMatch = isMatch && regex.test(item.landline);
      }
      if (typeof $s.search_email != "undefined"
              && $s.search_email != "") {
        var regex = new RegExp($s.search_email, "i")
        isMatch = isMatch && regex.test(item.email);
      }

      if (typeof $s.search_address_street != "undefined"
              && $s.search_address_street != "") {
        var regex = new RegExp($s.search_address_street, "i")
        isMatch = isMatch && regex.test(item.address_street);
      }
      if (typeof $s.search_address_suburb != "undefined"
              && $s.search_address_suburb != "") {
        var regex = new RegExp($s.search_address_suburb, "i")
        isMatch = isMatch && regex.test(item.address_suburb);
      }
      if (typeof $s.search_address_postcode != "undefined"
              && $s.search_address_postcode != "") {
        var regex = new RegExp($s.search_address_postcode, "i")
        isMatch = isMatch && regex.test(item.address_postcode);
      }

      return isMatch;
    }



    $s.rowDetails = [];
    $s.coordinatorData = {};

    $s.getCoordinatorData = function() {
      http.get("/api/coordinators").success(function(data) {
        $s.coordinatorData = data;
      });
    };

    $s.setSortCol = function(index) {
      if (typeof $s.sortReverse[index] === 'undefined')
        $s.sortReverse[index] = false;
      else
        $s.sortReverse[index] = !$s.sortReverse[index];
      $s.sortCol = index;
    };


    $s.resetFilters = function() {
      $s.filterAddr = "";
      delete $s.visibleLineLineLatLon;
    };


    $s.addCoordinator = function() {
      var postData = {};
      postData.user = {
	    'organisation' : $s.coordinatorOrganisation
	    , 'first_name' : $s.coordinatorFirstName
	    , 'last_name' : $s.coordinatorLastName
	    , 'email' : $s.coordinatorEmail
	    , 'mobile' : $s.coordinatorMobile
	    , 'landline' : $s.coordinatorLandline
	    , 'email' : $s.coordinatorEmail
	    , 'address_street' : $s.coordinatorAddressStreet
	    , 'address_suburb' : $s.coordinatorAddressSuburb
	    , 'address_postcode' : $s.coordinatorAddressPostCode
      };

      http.post('/api/coordinator/new', postData).success(function(data) {
        // $s.emailOpen = true;
        // $s.emailData = data;
        $s.getCoordinatorData();
        alert("Coordinator added");
      });
    };

    $s.isSortReverse = function(index) {
      return $s.sortReverse[index];
    };
  }]);
