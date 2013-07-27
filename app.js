var db = require('./db/schema');
var express = require('express');
var fs = require('fs');
var csv = require('csv');
var path = require('path');
var templatesDir = path.join(__dirname, 'templates');
var emailTemplates = require('email-templates');
var mailer = require('nodemailer');

var app = express();
app.use(express.bodyParser());
app.use(express.compress());

app.get('/app/*', function(req, res) {
    res.sendfile(__dirname + req.path);
});

app.get('/products', function(req, res) {
    db.Product.find({}, function(err, data) {
        res.json(data);
    });
});

app.post('/uploadcsv', function(req, res) {
    db.Product.find({}).remove();
    var tempCsvPath = req.files.transportcsv.path;
    var csvDataMapping = ["oc_num", "supplier.name", "supply_address",
        "supplier.address.street", "supplier.address.suburb", 
        "supplier.address.postcode", "product_name", "variant", "variant_weight",
        "quantity", "reserve", "distributor.name", "delivery_address",
        "distributor.address.street", "distributor.address.suburb",
        "distributor.address.postcode", "shipping_instructions"];

    var isNumeric = function(str) {
        return !isNaN(parseFloat(str)) && isFinite(str);
    };

    csv().from.stream(fs.createReadStream(tempCsvPath, "utf8"))
            .on('record', function(row, index) {        
        if (index === 0) {
            //do nothing with header in csv file
        } else {
            var data = new db.Product();
            //data.bidValue = "";
            //data.hasBid = false;
            for (var i = 0; i < row.length; i++) {
                var val = isNumeric(row[i]) ? parseFloat(row[i]) : row[i];
                var mapping = csvDataMapping[i];
                if (mapping.indexOf(".") > 0) {
                    var attrList = mapping.split(".");
                    var tempObj = data;
                    
                    for (var x = 0; x < attrList.length; x++) {
                        var attr = attrList[x];
                        
                        if (x === (attrList.length - 1))
                            tempObj[attr] = val;
                        else if (typeof tempObj[attr] == 'undefined') {
                            tempObj[attr] = {};
                        }
                        
                        tempObj = tempObj[attr];
                    }
                } else {
                    data[mapping] = val;
                }
            }
            
            data.save(function(err) {
                if (err) console.log(err);
            });
            
            console.log(data);
        }
    }).on('close', function(count) {
        console.log("finished");
    }).on('error', function(err) {
        console.log(err);
    }).to(function() {
        db.Product.count({}, function(err, c) {
            console.log(c);
        });
        res.send(200);
    });
});

app.post('/sendemail', function(req, res) {
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

app.listen(8000);
console.log("listening on port 8000");
