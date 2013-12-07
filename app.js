var db = require('./db/schema');
var express = require('express');
var fs = require('fs');
var q = require('q');
var _ = require('underscore');
var csv = require('csv');
var mapTools = require('./app_modules/map-tools');
var path = require('path');
var templatesDir = path.join(__dirname, 'templates');
var emailTemplates = require('email-templates');
var mailer = require('nodemailer');

var app = express();
app.use(express.bodyParser());
app.use(express.compress());

app.get('/api/products', function(req, res) {
  db.TransportCycle.findOne({}, function(err, data) {
    res.json(data.package_list);
  });
});

app.get('/api/transport_cycle', function(req, res) {
  
});

app.post('/api/uploadcsv', function(req, res) {
  var mapInterface = new mapTools.MapInterface();
  var packages = [];

  var tempCsvPath = req.files.transportcsv.path;
  var csvDataMapping = ["supplier_name", "supply_address",
    "supplier_street", "supplier_suburb",
    "supplier_postcode", "product_name", "variant", "variant_weight",
    "quantity", "reserve", "distributor_name", "delivery_address",
    "distributor_street", "distributor_suburb",
    "distributor_postcode", "shipping_instructions"];

  var callStack = [];
  var pushToCallstack = function(model, addressAttr, latLngAttr) {
    callStack.push(function() {
      return mapInterface.getLatLon(model[addressAttr]).then(function(resolved) {
	model[latLngAttr] = resolved.latLon;
      });
    });
  };
  csv().from.stream(fs.createReadStream(tempCsvPath, "utf8"))
          .on('record', function(row, index) {
    if (index === 0) {
      //do nothing with header in csv file
    } else {
      var data = new db.Package();
      
      for (var i = 0; i < row.length; i++) {
        var val = _.isNumber(row[i]) ? parseFloat(row[i]) : row[i];
        var mapping = csvDataMapping[i];
        data[mapping] = val;
      }
      
      var pIdx = packages.push(data) - 1;
      
      pushToCallstack(packages[pIdx], "supply_address", "supply_lat_lon");
      pushToCallstack(packages[pIdx], "delivery_address", "delivery_lat_lon");
    }
  }).on('close', function(count) {
    console.log("finished");
  }).on('error', function(err) {
    console.log(err);
  }).to(function() {
    var shiftThenRun = function(stack) {
      if (stack.length > 0) { 
        (stack.shift())().then(function() {
          shiftThenRun(stack);
        });
      } else {
        var transCycle = new db.TransportCycle({
	  package_list: packages,
          start_date: req.body.start_date,
          end_date: req.body.end_date,
          transport_cycle_coordinator_id: req.body.coordinator_id
        });
      
        transCycle.save(function(err) {
          if (err) console.log(err);
          res.send(200);
	});
      }
    };
    
    shiftThenRun(callStack);
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

var port = process.env.PORT || 8000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
