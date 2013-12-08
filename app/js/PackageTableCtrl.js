angular.module("transportBiddingApp")
        .controller("PackageTableCtrl", ['$scope', '$http',
  function($s, http) {
    $s.sortReverse = {};
    $s.bidLatLonArray = [];
    $s.filterAddr = "";
    $s.isReverse = false;
    
	$s.transportCycleID = location.hash.split('/').pop(); // get id from url. not sure how to do this in angular
    //make more generic @todo
    $s.filterProducts = function(item) {
      var isMatch = true;


      if (typeof $s.search_supplier_name != "undefined"
              && $s.search_supplier_name != "") {
        var regex = new RegExp($s.search_supplier_name, "i")

        isMatch = isMatch && regex.test(item.supplier_name);
      }
      if (typeof $s.search_supply_address != "undefined"
              && $s.search_supply_address != "") {
        var regex = new RegExp($s.search_supply_address, "i")

        isMatch = isMatch && regex.test(item.supply_address);
      }
      if (typeof $s.search_supplier_address != "undefined"
              && $s.search_supplier_address != "") {
        var regex = new RegExp($s.search_supplier_address, "i")

        isMatch = isMatch && regex.test(item.supplier_address);
      }
      if (typeof $s.search_supplier_suburb != "undefined"
              && $s.search_supplier_suburb != "") {
        var regex = new RegExp($s.search_supplier_suburb, "i")

        isMatch = isMatch && regex.test(item.supplier_suburb);
      }
      if (typeof $s.search_product_name != "undefined"
              && $s.search_product_name != "") {
        var regex = new RegExp($s.search_product_name, "i")

        isMatch = isMatch && regex.test(item.product_name);
      }

      if (typeof $s.search_product != "undefined"
              && $s.search_product != "") {
        var regex = new RegExp($s.search_product, "i")

        isMatch = isMatch && regex.test(item.product);
      }
      if (typeof $s.search_product_variant != "undefined"
              && $s.search_product_variant != "") {
        var regex = new RegExp($s.search_product_variant, "i")

        isMatch = isMatch && regex.test(item.product_variant);
      }
      if (typeof $s.search_product_weight != "undefined"
              && $s.search_product_weight != "") {
        var regex = new RegExp($s.search_product_weight, "i")

        isMatch = isMatch && regex.test(item.abc);
      }
      if (typeof $s.search_quantity != "undefined"
              && $s.search_quantity != "") {
        var regex = new RegExp($s.search_quantity, "i")

        isMatch = isMatch && regex.test(item.quantity);
      }
      if (typeof $s.search_reserve != "undefined"
              && $s.search_reserve != "") {
        var regex = new RegExp($s.search_reserve, "i")

        isMatch = isMatch && regex.test(item.reserve);
      }

      if (typeof $s.search_distributor_name != "undefined"
              && $s.search_distributor_name != "") {
        var regex = new RegExp($s.search_distributor_name, "i")

        isMatch = isMatch && regex.test(item.distributor_name);
      }

      if (typeof $s.search_delivery_address != "undefined"
              && $s.search_delivery_address != "") {
        var regex = new RegExp($s.search_delivery_address, "i")

        isMatch = isMatch && regex.test(item.delivery_address);
      }

      if (typeof $s.search_distributor_address != "undefined"
              && $s.search_distributor_address != "") {
        var regex = new RegExp($s.search_distributor_address, "i")

        isMatch = isMatch && regex.test(item.distributor_address);
      }
      if (typeof $s.search_distributor_suburb != "undefined"
              && $s.search_distributor_suburb != "") {
        var regex = new RegExp($s.search_distributor_suburb, "i")

        isMatch = isMatch && regex.test(item.distributor_suburb);
      }
      if (typeof $s.search_distributor_postcode != "undefined"
              && $s.search_distributor_postcode != "") {
        var regex = new RegExp($s.search_distributor_postcode, "i")

        isMatch = isMatch && regex.test(item.distributor_postcode);
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
      http.get("/api/products/" + $s.transportCycleID).success(function(data) {
        $s.productData = data;
      });
    };

	$s.getProductData(); 

    $s.setSortCol = function(index) {
      if (typeof $s.sortReverse[index] === 'undefined')
        $s.sortReverse[index] = false;
      else
        $s.sortReverse[index] = !$s.sortReverse[index];
      $s.sortCol = index;
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


    $s.isSortReverse = function(index) {
      return $s.sortReverse[index];
    };
  }]);
