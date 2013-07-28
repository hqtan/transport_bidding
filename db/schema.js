var mongo = require('mongoose');
mongo.connect('mongodb://localhost/transportbid', function(err) {
    if (err) console.log(err); 
});

var Address = {
    street : String,
    suburb : String,
    postcode : Number
};

var Supplier = {
    name : String,
    address : Address
};

var Distributor = {
    name : String,
    address : Address
};

var Product = new mongo.Schema({
    timestamp : { type : Date, default: Date.now },
    oc_num : String,
    supplier : Supplier,
    distributor : Distributor,
    product_name : String,
    variant : String,
    variant_weight : Number,
    quantity : Number,
    reserve : Number,
    supply_address : String,
    delivery_address : String,
    shipping_instructions : String
});

exports.Product = mongo.model("product", Product);