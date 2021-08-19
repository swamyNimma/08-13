var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var urlencoded = require('url')
var bodyParser = require('body-parser');
var json = require('json');
var logger = require('logger');
//var methodOverride = require('method-override');
//const nano = require('nano');
//nano to connect couch DB
var nano = require('nano')('http://localhost:5948');
var db = nano.use('address');

var app = express();

app.set('port',process.env.PORT || 3000);
app.set('views',path.join(__dirname,'views'));
app.set('view engine','jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
//app.use(methodOverride);
app.use(express.static(path.join(__dirname,'public')));

app.get('/',routes.index);

app.post('/createdb',function(req,res){
    nano.db.create(req.body.dbname,function(err){
        if(err){
            res.send("error creating DB"+ req.body.dbname);
        }
        res.send("Database"+ req.body.dbname+" created successfully")
    }
    )

});

app.post('/new_contact', function(req,res){
var name = req.body.name;
var phone = req.body.phone;
console.log("inside newContact function");

db.insert({name:name,phone:phone,crazy:true},phone,function(err,body,header){
    if(err){
        res.send("error creating contact");
        return;
    }
    res.send("contact created succesfully");
});
});

app.post('/view_contact',function(req,res){
    var alldoc="Following are the contacts";
    db.get(req.body.phone,{revs_info:true},function(err,body){
        if(!err){
            console.log(body);
        }
        if(body){
            alldoc +="Name :"+body.name+"<br> Phone number : "+body.phone;
        }
        else{
            alldoc="No records found";
        }
        res.send(alldoc);
    });
});

app.post('/delete_contact',function(req,res){
    db.get(req.body.phone,{revs_infor:true},function(err,body){
        if(!err){
            db.destroy(req.body.phone,body._rev,function(err,body){
                if(err){
                    res.send("error deleting contact");
                }
            });
            res.send("contacts deleted succesfully");
        }
    });
});

http.createServer(app).listen(app.get('port'),function(){
    console.log("express server listening on port"+app.get('port'));
});

