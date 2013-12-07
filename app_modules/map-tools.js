var maps = require('googlemaps');
var q = require('q');

exports.MapInterface = function() {
  var locations = {};
  var DELAY = 650;

  var formatLatLon = function(latLng) {
    return { lat: latLng.lat, lon: latLng.lng };
  }

  this.getLatLon = function(address) {
    var defer = q.defer();

    if (address in locations) {
      defer.resolve({ latLon: formatLatLon(locations[address]), isFromCache: true });
    } else { 
      setTimeout(function() {
        maps.geocode(address, function(err, data) {
          if (err) console.log(err);
          if (typeof data !== 'undefined' && data.results.length > 0) {
            var loc = data.results[0]['geometry']['location'];
            locations[address] = loc;
            console.log(address + " found: " + JSON.stringify(loc));
            defer.resolve({ latLon: formatLatLon(loc), isFromCache: false });
          } else {
            console.log("ERROR: " + address + " not found.");
            defer.resolve({ latLon: {}, isFromCache: false });
          }
        });
      }, DELAY);
    }
   
    return defer.promise;
  };
};
