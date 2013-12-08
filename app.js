var db = require('./db/schema');
var express = require('express');
var fs = require('fs');
var moment = require('moment');
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

app.get('/api/transport_cycle', function(req, res) {
  db.TransportCycle.find({}, { package_list: 0 }, function(err, data) {
    var retval = [];
    var coordIdList = _.map(data, function(val) {
      return val.transport_cycle_coordinator_id;
    });
    
    db.Coordinator.find({ _id: { $in: coordIdList } },
      { organisation: 1, _id: 1 }, function(err, tcList) {
        data.forEach(function(e) {
	  var tc = tcList.filter(function(tcData) {
	    return tcData._id == e.transport_cycle_coordinator_id 
          });
          
          var text = "TC" + e.tc_num + " " + tc[0].organisation + " " + 
            moment(e.end_date).format("D-MM-YYYY");
            
          retval.push({ 
            display_text: text,
            _id: e._id
          });
        });
   
        res.json(retval);
      }
    );
  });
});

app.post("/api/bids/:bid_id/package/:package_id/status/:bid_status", function(req, res) {
  console.log(req.params);
  db.Bid.update({ package_id: req.params.package_id }, { bid_status: 2 }, { multi: true },
    function() {
      if (req.params.bid_status == 1) 
        db.Bid.update({ _id: req.params.bid_id }, { bid_status: 1 }, {},
        function() {
          res.send(200);
        });
      else res.send(200);
    });
});

app.get('/api/bidders/:tc_id', function(req, res) {
  var retval = {};

  db.TransportCycle.findOne({ _id: req.params.tc_id }, { 'package_list._id': 1 }, 
    function(err, data) {
      var idList = [];
      data.package_list.forEach(function(e) {
        idList.push(e._id);
      });

      db.Bid.find({ package_id: { $in: idList } }, 
        { bidder_name: 1, bidder_email: 1, bidder_mobile: 1, _id: 0 }, function(err, data) {
        data.forEach(function(e) {
          if (typeof e.bidder_email !== 'undefined' && 
            !(e.bidder_email in retval)) {
            retval[e.bidder_email.toLowerCase()] = e;
          }
        });

        res.json(_.values(retval));
      });
    }
  );
});

app.get('/api/transport_cycle/all', function(req, res) {
  // better way to find coordinator names? not sure if want to merge into /api/transport_cycle or not
  db.TransportCycle.find().distinct('transport_cycle_coordinator_id', function(error, coordinator_ids) {
    db.Coordinator.find({ $or: coordinator_ids.map(function(id){ if(typeof(id) === "undefined") return {_id: ''}; return {_id: id}}) },  function(error, coordinators_raw) {
      var coordinators = {};
      if(typeof(coordinators_raw) !== "undefined" && coordinators_raw != null ){
        coordinators_raw.forEach(function(e){
          e.display_name = 
              (typeof e['organisation'] != "undefined" ? e['organisation'] : "") + ": " +
              (typeof e['first_name'] != "undefined" ? e['first_name'] : "") + " " + 
              (typeof e['last_name'] != "undefined" ? e['last_name'] : "") + 
              "";
          coordinators[e._id] = e;
        });
      } 

      db.TransportCycle.find({}, { package_list: 0 }, function(err, data) {
        var retval = [];
        data.forEach(function(e) {      
          var text = "TC" + e.tc_num + " " + moment(e.end_date).format("D-MM-YYYY");
          var coordinator_text = '';
          if(coordinators[e.transport_cycle_coordinator_id])
            coordinator_text = coordinators[e.transport_cycle_coordinator_id].display_name;
          retval.push({ 
            display_text: text,
            coordinator_text: coordinator_text,
            start_date: e.start_date,
            end_date: e.end_date,
            is_active: e.is_active,
            display_text: text,
            _id: e._id
          });
        });
        res.json(retval);
      });
    });  
  });  
});
app.post('/api/transport_cycle/edit', function(req, res) {
    db.TransportCycle.findOne({ _id: req.body.transport_cycle.id }, function(err, data) {
      if(err || data == null) {
        res.send('');
        return;
      }
      data.is_active = req.body.transport_cycle.active;
      data.save(function(err) {
          if (err) {
            console.log(err);
          }
          res.json({"status":"ok"});
      });
    });
});

app.get('/api/products/:id', function(req, res) {
  db.TransportCycle.findOne({ _id: req.params.id }, function(err, data) {
    if (data === null) res.send('');
    else res.json(data.package_list);
  });
});
app.get('/api/products/:id/:status', function(req, res) {
  db.TransportCycle.findOne({ _id: req.params.id, is_active: req.params.status}, function(err, data) {
    if (data === null) res.send('');
    else res.json(data.package_list);
  });
});
app.get('/api/transport_cycle/no_bids/:id', function(req, res) {
  db.TransportCycle.findOne({ _id: req.params.id }, function(err, data) {
    if (data === null) res.send('');
    else {
      var package_ids = [];
      var package_id_mapping = [];
      var all_bids = [];
      data.package_list.forEach(function(e) {
        package_ids.push({"package_id":e._id});
        package_id_mapping[e._id] = e;
      });
      db.Bid.find({ $or: package_ids}, function(error, bids) {
          for(var i = 0; i < bids.length; i++){
            delete(package_id_mapping[bids[i].package_id]);
          }
          var no_bid_list = [];
          for(var f in package_id_mapping)
            no_bid_list.push(package_id_mapping[f]);
          res.json(no_bid_list);
      });      
    }
  });
});

app.get('/api/bids/:id', function(req, res) {
  db.TransportCycle.findOne({ _id: req.params.id }, function(err, data) {
    if (data === null) res.send('');
    else {
      var package_ids = [];
      var package_id_mapping = [];
      var all_bids = [];
      data.package_list.forEach(function(e) {
        package_ids.push({"package_id":e._id});
        package_id_mapping[e._id] = e;
      });
      db.Bid.find({ $or: package_ids}, function(error, bids) {
          for(var i = 0; i < bids.length; i++){
            var package_data = package_id_mapping[bids[i].package_id];
            var current_bid = {};
            for(var field in ["supplier_name","supply_address","supplier_suburb","supplier_postcode","product_name","variant","variant_weight","quantity","reserve","distributor_name","delivery_address","distributor_suburb","distributor_postcode","shipping_instructions","is_active","delivery_lat_lon","supply_lat_lon","timestamp"]){
              bids[i][field] = package_data[field];
            }
            var fields = [];
            fields = ["package_id","bidder_name","bidder_email","bidder_mobile","comments","value","_id","__v","bid_status","ts"];
            for(var j = 0; j < fields.length; j++){
              var field = fields[j];
              current_bid[field] = bids[i][field];
            }
            fields = ["supplier_name","supply_address","supplier_suburb","supplier_postcode","product_name","variant","variant_weight","quantity","reserve","distributor_name","delivery_address","distributor_suburb","distributor_postcode","shipping_instructions","is_active","delivery_lat_lon","supply_lat_lon","timestamp"];
            for(var j = 0; j < fields.length; j++){
              var field = fields[j];
              bids[i][field] = package_data[field];
              current_bid[field] = package_data[field];
            }
            all_bids.push(current_bid);
          }
          res.json(all_bids);
      });      
    }
  });
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

app.post('/api/bid', function(req, res) {
  req.body.forEach(function(e) {
    var bid = new db.Bid(e);
    bid.save(function(err) {
      if (err) console.log(err);
    });
  });
  
  res.send(200);
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



app.get('/api/coordinators', function(req, res) {
  db.Coordinator.find({}, function(err, data) {
    res.json(data);
  });
});
app.post('/api/coordinator/new', function(req, res) {
    var data = new db.Coordinator();
    data['organisation'] = req.body.user['organisation'];
    data['first_name'] = req.body.user['first_name'];
    data['last_name'] = req.body.user['last_name'];
    data['email'] = req.body.user['email'];
    data['mobile'] = req.body.user['mobile'];
    data['landline'] = req.body.user['landline'];
    data['email'] = req.body.user['email'];
    data['address_street'] = req.body.user['address_street'];
    data['address_suburb'] = req.body.user['address_suburb'];
    data['address_postcode'] = req.body.user['address_postcode'];
    data.save(function(err) {      
        if (err) {
          console.log(err);
          res.json({"status": "error"})
        }
      res.json({"status":"ok"});
    });
});
app.get('/*', function(req, res) {
  res.sendfile(__dirname + "/app" + req.path);
});

var port = process.env.PORT || 8000;
app.listen(port, function() {
  console.log("Listening on " + port);
});
