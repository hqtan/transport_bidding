var db = require('./db/schema');

db.TransportCycleCoordinator.remove({}, function() {});

var c1 = new db.TransportCycleCoordinator({
  first_name: "first",
  last_name: "last",
  organisation_name: "orgtest",
  email: "last@orgtest.org",
  mobile: "0404555666",
  phone: "03 9435 5444",
  address: "44 Test Street, Coburg VIC 2304"
});

c1.save(function(err) {
  if (err) console.log(err);
  process.exit(0);
});

