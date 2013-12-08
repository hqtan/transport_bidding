var db = require('./schema');

db.TransportCycle.remove({}, function() {});
db.Package.remove({}, function() {});
db.Bid.remove({}, function() {});