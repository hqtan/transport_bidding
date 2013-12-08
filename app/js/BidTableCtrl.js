angular.module("transportBiddingApp")
        .controller("BidTableCtrl", ['$scope', '$http',
  function($s, http) {
    $s.sortReverse = {};
    $s.bidLatLonArray = [];
    $s.filterAddr = "";
    $s.isReverse = false;

    http.get("/api/transport_cycle").success(function(data) {
      $s.transportCycleList = data;
      $s.transportCycle = data[0];
      $s.getProductData(); 
    });
    //make more generic @todo
    $s.filterProducts = function(item) {
      var isMatch = true;

      if (typeof $s.search_product != "undefined"
              && $s.search_product != "") {
        var regex = new RegExp($s.search_product, "i")
        isMatch = isMatch && regex.test(item.product_name);
      }

      if (typeof $s.search_src != "undefined"
              && $s.search_src != "") {
        var regex = new RegExp($s.search_src, "i")

        isMatch = isMatch && regex.test(item.supplier_suburb);
      }

      if (typeof $s.search_dest != "undefined"
              && $s.search_dest != "") {
        var regex = new RegExp($s.search_dest, "i")

        isMatch = isMatch && regex.test(item.distributor_suburb);
      }

      return isMatch;
    }

    $s.filterAddress = function(item) {
      if ($s.filterAddr !== "") {
        return item.supply_address === $s.filterAddr
                || item.delivery_address === $s.filterAddr;
      }

      return true;
    }

    $s.rowDetails = [];
    $s.productData = {};

    $s.getProductData = function() {
      http.get("/api/products/" + $s.transportCycle._id + "/true").success(function(data) {
        $s.productData = data;
        var addArr = [];

        for (var row in data) {
          var src = data[row].supply_address;
          var dest = data[row].delivery_address;
          var srcLatLon = data[row].supply_lat_lon;
          var destLatLon = data[row].delivery_lat_lon;

          addArr.push({src: src, dest: dest, srcLatLon: srcLatLon,
            destLatLon: destLatLon});
        }

        $s.addressArray = addArr;
      });
    };

    $s.setSortCol = function(index) {
      if (typeof $s.sortReverse[index] === 'undefined')
        $s.sortReverse[index] = false;
      else
        $s.sortReverse[index] = !$s.sortReverse[index];
      $s.sortCol = index;
    };

    $s.onRowClick = function(row) {
      showRowDetails(row);
      $s.visibleLineLineLatLon = [row.supply_lat_lon, row.delivery_lat_lon];
    };

    var showRowDetails = function(row) {
      $s.rowDetails = [{
          desc: "Shipping Instruction",
          val: row.shipping_instructions
        }, {
          desc: "Destination Address",
          val: row.delivery_address
        }, {
          desc: "Source Address",
          val: row.supply_address
        }, {
          desc: "Quantity",
          val: row.quantity
        }, {
          desc: "Weight",
          val: row.variant_weight
        }, {
          desc: "Variant",
          val: row.variant
        }, {
          desc: "Product Name",
          val: row.product_name
        }];
    };

    $s.getBids = function() {
      var retval = $s.productData.filter(function(e) {
        return e.hasBid;
      });
      return retval;
    }

    $s.updateBidValue = function(row) {
      var path = [row.supply_lat_lon, row.delivery_lat_lon];
      if (row.hasBid) {
        row.bidValue = row.reserve;
        $s.bidLatLonArray.push(path);
      } else {
        row.bidValue = "";
        $s.bidLatLonArray.forEach(function(e, idx) {
          if (JSON.stringify(e) === JSON.stringify(path)) {
            $s.bidLatLonArray.splice(idx, 1);
            return;
          }
        });
      }
    };

    $s.resetFilters = function() {
      $s.filterAddr = "";
      delete $s.visibleLineLineLatLon;
    };

    $s.clearBids = function() {
      $s.bidLatLonArray = [];

      $s.productData.forEach(function(e) {
        if (e.hasBid) {
          e.hasBid = false;
        }
      });
    };

    $s.placeBid = function() {
      var postData = [];
      var bids = $s.getBids();
      bids.forEach(function(e) {
        postData.push({
          package_id: e._id,
          bidder_name: $s.bidName,
          bidder_email: $s.bidEmail,
          bidder_mobile: $s.bidMobile,
          comments: $s.bidComments,
          value: e.bidValue
        });
      });

      http.post('/api/bid', postData).success(function(data) {
        alert("Bids successfully placed.");
      });
    };

    /* $s.sendEmail = function() {
      var postData = {};
      postData.customer = {name: $s.customerName,
        email: $s.customerEmail};
      postData.headers = $s.csvData.header;
      postData.data = $s.getBids();
      postData.numCols = $s.numCols;

      http.post('/api/sendemail', postData).success(function(data) {
        $s.emailOpen = true;
        $s.emailData = data;
      });
    }; */

    $s.isSortReverse = function(index) {
      return $s.sortReverse[index];
    };
  }]);
