//var db = require('./db/schema');
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

app.get('/app/*', function (req, res) {
  	res.sendfile(__dirname + req.path);
});

app.get('/getcsv', function (req, res) {
  var retval = { data:[] };
  var isNumeric = function(str) {
    return !isNaN(parseFloat(str)) && isFinite(str);
  };

  csv().from.stream(fs.createReadStream(__dirname +"/data.csv", "utf8"))
    .on('record', function(row, index) {
        if (index == 0) {
            retval.header = {};
            for (var i = 0; i < row.length; i++) {
              retval.header["col" + i] = row[i];
            }

            retval.numCols = row.length;
        } else {
            var data = {};
            data.bidValue = "";
            data.hasBid = false;
            for (var i = 0; i < row.length; i++) {
              data["col" + i] = isNumeric(row[i])?parseFloat(row[i]):row[i];
            }
            
            retval.data.push(data);
        }
    })
    .on('close', function(count) {
        console.log("finished");
    })
    .on('error', function(err) {
        console.log(err);
    })
    .to(function() {
        res.json(retval);
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
           if(!err) {
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

/*
app.post('/api/updateCollector', function (req, res) {
	db.Collector.update({ _id : req.body.id  }, data ).exec();
	res.send(200);
});

app.get('/api/getCollector/:isActive', function (req, res) { 
	var condition = Boolean(req.params.isRead)?{}:{ isActive : true };
	db.Article.find(condition).select({}).exec(function(err, data) {
		res.json(data);
	});
});

app.get('/api/getEntity', function(req, res) {
	db.Entity.find({}, function(err, data) {
		res.json(data);
	});
});
*/
app.listen(8000);
console.log("listening on port 8000");
