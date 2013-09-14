var db = require('./db/schema');
var express = require('express');
var fs = require('fs');
var q = require('q');
var csv = require('csv');
var path = require('path');
var maps = require('googlemaps');
var templatesDir = path.join(__dirname, 'templates');
var emailTemplates = require('email-templates');
var mailer = require('nodemailer');

var app = express();
app.use(express.bodyParser());
app.use(express.compress());

app.get('/api/products', function(req, res) {
  db.Product.find({}, function(err, data) {
    res.json(data);
  });
});

app.post('/api/uploadcsv', function(req, res) {
  db.Product.find({}).remove();
  var tempCsvPath = req.files.transportcsv.path;
  var csvDataMapping = ["oc_num", "supplier.name", "supply_address",
    "supplier.address.street", "supplier.address.suburb",
    "supplier.address.postcode", "product_name", "variant", "variant_weight",
    "quantity", "reserve", "distributor.name", "delivery_address",
    "distributor.address.street", "distributor.address.suburb",
    "distributor.address.postcode", "shipping_instructions"];

  var locations = {};
  var counter = 0;
  var getLatLon = function(address, callback) {
    if (address in locations)
      callback(locations[address]);
    else {
      maps.geocode(address, function(err, data) {
        if (typeof data !== 'undefined') {
          var loc = data.results[0]['geometry']['location'];
          locations[address] = loc;
          console.log(loc);
          callback(loc);
        }
      });
    }
  }

  var isNumeric = function(str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
  };

  var addValueToObj = function(data, mapping, val) {
    if (mapping.indexOf(".") > 0) {
      var attrList = mapping.split(".");
      var tmpObj = data;

      for (var x = 0; x < attrList.length; x++) {
        var attr = attrList[x];

        if (x === (attrList.length - 1))
          tmpObj[attr] = val;
        else if (typeof tmpObj[attr] == 'undefined') {
          tmpObj[attr] = {};
        }

        tmpObj = tmpObj[attr];
      }
    } else {
      data[mapping] = val;
    }

    return data;
  };

  var callStack = [];
  var pushToCallstack = function(model, addressAttr, latLngAttr) {
    callStack.push(function() {
      getLatLon(model[addressAttr], function(data) {
        if (data !== false) {
          model[latLngAttr] = {lat: data.lat, lon: data.lng};
        }

        model.save(function(err) {
          if (err)
            console.log(err);
        });
      });
    });
  }

  csv().from.stream(fs.createReadStream(tempCsvPath, "utf8"))
          .on('record', function(row, index) {
    if (index === 0) {
      //do nothing with header in csv file
    } else {
      var data = new db.Product();
      for (var i = 0; i < row.length; i++) {
        var val = isNumeric(row[i]) ? parseFloat(row[i]) : row[i];
        var mapping = csvDataMapping[i];
        data = addValueToObj(data, mapping, val);
      }

      pushToCallstack(data, "supply_address", "supply_lat_lon");
      pushToCallstack(data, "delivery_address", "delivery_lat_lon");
    }
  }).on('close', function(count) {
    console.log("finished");
  }).on('error', function(err) {
    console.log(err);
  }).to(function() {
    while (callStack.length > 0) {
      setTimeout(callStack.shift(), 650 * counter++);
    }
    setTimeout(function() {
      db.Product.count({}, function(err, c) {
        console.log(c);
      });
      res.send(200);
    }, 650 * counter++);
  });
});

app.post('/api/sendemail', function(req, res) {
  var transport = mailer.createTransport("SMTP", {
    service: "Gmail",
    debug: true,
    auth: {
      user: "user email",
      pass: "pass"
    }
  });

  emailTemplates(templatesDir, function(err, template) {
    var locals = req.body;
    template('bid-reply', locals, function(err, html, text) {
      if (!err) {
        /*            transport.sendMail({
         from: 'Eaterprises <admin@eaterprises.com.au>',
         to: locals.customer.email,
         subject: "Transport Bid Details",
         html: html
         }, function(e, response) {
         console.log(e);
         console.log(response);
         res.send(200);
         }); */
        res.send(html);
      } else {
        res.send(500);
      }
    });
  });
});

app.get('/*', function(req, res) {
  res.sendfile(__dirname + "/app" + req.path);
});

var port = process.env.PORT || 8888;
app.listen(port, function() {
  console.log("Listening on " + port);
});
