var mongo = require('mongoose');
var dbconf = require('../conf/dbconf.js');

mongo.connect('mongodb://' + dbconf.mongoUrl, function(err) {
  if (err)
    console.log(err);
});

var Address = {
  street: String,
  suburb: String,
  postcode: Number
};

var Supplier = {
  name: String,
  address: Address
};

var Distributor = {
  name: String,
  address: Address
};

var LatLon = {
  lat: Number,
  lon: Number
};

var Product = new mongo.Schema({
  timestamp: {type: Date, default: Date.now},
  oc_num: String,
  supplier: Supplier,
  distributor: Distributor,
  product_name: String,
  variant: String,
  variant_weight: Number,
  quantity: Number,
  reserve: Number,
  supply_address: String,
  delivery_address: String,
  shipping_instructions: String,
  supply_lat_lon: LatLon,
  delivery_lat_lon: LatLon
});

exports.Product = mongo.model("product", Product);