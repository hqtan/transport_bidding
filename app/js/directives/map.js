angular.module("transportBiddingApp").directive('map',
        function() {
          return {
            scope: {
              addressArray: "=addressArray", //{ src, dest, srcLatLon, destLatLon }
              selectedAddrMdl: "=selectedAddrMdl",
              visiblePath: "=visiblePath",
              visiblePathArray: "=visiblePathArray"
            },
            restrict: 'E',
            replace: true,
            template: "<div class=\"flex-video full-map\"></div>",
            controller: ['$scope', function($s) {
                var addressLatLon = [];
                var bidLines = [];

                $s.$watch('visiblePath', function(latLon) {
                  if (angular.isUndefined(latLon)) {
                    $s.selectedPolyLine.setVisible(false);
                  } else {
                    var from = new google.maps.LatLng(latLon[0].lat, latLon[0].lon);
                    var to = new google.maps.LatLng(latLon[1].lat, latLon[1].lon);
                    $s.selectedPolyLine.setPath([from, to]);
                    $s.selectedPolyLine.setVisible(true);
                  }
                });

                $s.$watch('visiblePathArray', function(visiblePathArray) {
                  bidLines.forEach(function(e) {
                    e.setMap(null);
                  });
                  
                  visiblePathArray.forEach(function(e) {
                    var from = new google.maps.LatLng(e[0].lat, e[0].lon);
                    var to = new google.maps.LatLng(e[1].lat, e[1].lon);
                    bidLines.push(new google.maps.Polyline({
                      map: $s.map,
                      strokeColor: 'yellow',
                      strokeOpacity: '0.75',
                      strokeWeight: '6',
                      path: [from, to],
                      visible: true
                    }));
                  });
                }, true);

                var addMarker = function(addr, latLon, isDest) {
                  if (angular.isUndefined(latLon))
                    return false;

                  addressLatLon[addr] = new google.maps.LatLng(latLon.lat, latLon.lon);

                  var icon = isDest ? 'img/delivery_marker.png' : 'img/supplier_marker.png';
                  var marker = new google.maps.Marker({
                    position: addressLatLon[addr],
                    map: $s.map,
                    icon: icon
                  });

                  google.maps.event.addListener(marker, "click", function() {
                    $s.selectedAddrMdl = addr;
                    $s.$apply();
                  });
                };

                $s.$watch('addressArray', function() {
                  for (var i in $s.addressArray) {
                    var src = $s.addressArray[i].src;
                    var dest = $s.addressArray[i].dest;

                    addMarker(src, $s.addressArray[i].srcLatLon, false);
                    addMarker(dest, $s.addressArray[i].destLatLon, true);
                  }
                });
              }],
            link: function($s, ele, attr) {
              var melblat = -37.4;
              var melblng = 144.95361;

              $s.map = new google.maps.Map(ele[0], {
                center: new google.maps.LatLng(melblat, melblng),
                zoom: 8,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              });

              $s.selectedPolyLine = new google.maps.Polyline({
                map: $s.map,
                strokeColor: '#49599C',
                strokeOpacity: '0.75',
                strokeWeight: '6'
              });
            }
          }
        });