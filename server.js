
var http = require('http');
var express = require('express');
var app = express();
var port = process.env.port || 1337;
var mongojs = require('mongojs');
var db = mongojs('HMSDB', ['Doctors', 'Patients']);
var ObjectId = require('mongodb').ObjectID;
var passport = require('passport');
//var doctors = require(__dirname + '\\models\\' + 'm_doctor.js');
//var patients = require(__dirname + '\\models\\' + 'm_patient.js');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var LocalStrategy = require('passport-local').Strategy;


 var mongoose = require('mongoose');
  mongoose.connect('mongodb://localhost/HMSDB');
  var Schema = mongoose.Schema;
  var DoctorSchema = new Schema({
        _id: Schema.ObjectId,
        firstname: String,
        lastname: String,
        password: String,
        email: String
    }, { collection: 'Doctors' });
    
  var Doctors = mongoose.model('Doctors', DoctorSchema);
	
	
app.configure(function () {
    app.use(express.static(__dirname));
    app.use(express.cookieParser());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(session({ secret: 'EmergingTechnologies', resave: false, saveUninitialized: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(flash());
});



  function isLoggedIn(req, res, next) {
        
        if (req.isAuthenticated())
            return next();
        res.redirect('/');
    }
	
   passport.use(new LocalStrategy(
        function (username, password, done) {
 
           Doctors.findOne({ 'email' :  username }, function(err, user) {
           
            if (err)
                return done(err);
            if (!user)
                return done(null, false); // req.flash is the way to set flashdata using connect-flash    
            if (!(user.password === password)) {
                return done(null, false);
            }
            return done(null, user);
        });
        }
		
    ));
	
	 passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        Doctors.findById(id, function(err, user) {
            done(err, user);
        });
    });

   

    app.post('/doctorlogin', passport.authenticate('local', { successRedirect: '/MyPatientsList', failureRedirect: '/login' }), function (req, res) {
  

    });
    
	
	
    app.post('/patientlogin', function (req, res) {
        res.sendfile(__dirname + '/PatientList.html', { user : req.user });
    });
    
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
      });


    app.get('/', function (req, res) {
        res.sendfile(__dirname + '/Welcome.html');
    });
    app.get('/home', function (req, res) {
        res.sendfile(__dirname + '/Welcome.html');
    });
    app.get('/login', function (req, res) {
        res.sendfile(__dirname + '/login.html');
    });
    app.get('/MyPatientsList', isLoggedIn,function (req, res) {
        res.sendfile(__dirname + '/PatientList.html');
});
app.get('/AllPatientsList', function (req, res) {
    res.sendfile(__dirname + '/AllPatients.html');
});
    app.get('/NewPatient',isLoggedIn, function (req, res) {
        res.sendfile(__dirname + '/NewPatient.html');
    });
    app.get('/PatientDetails',isLoggedIn, function (req, res) {
        res.sendfile(__dirname + '/PatientDetails.html');
    });

app.get('/GetAllPatients', function (req, res) {
    console.log("POST: ");
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
	
    db.Patients.find(function (err, docs) {
        console.log(docs);
        res.json(docs);
    });
});

app.get('/GetMyPatients', function (req, res) {
    console.log("POST: ");
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
   
     db.Patients.find({doctorId:req.user.id},function(err,docs){
        console.log(docs);
        res.json(docs);
      });
});

app.post('/AddPatient',isLoggedIn, function (req, res) {
  
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
   
    var jsonData = JSON.parse(req.body.patient);
   
	 db.Patients.save({'firstname':jsonData.firstname,'lastname':jsonData.lastname,'phonenumber': jsonData.phonenumber, 'lastVisitDate': jsonData.lastVisitDate,'doctorId': req.user.id,'doctorName': req.user._doc.firstname,'status': jsonData.status},
       function(err, saved) { 
           if( err || !saved ) res.end( "Patient not saved"); 
           else res.end( "Patient Added");
       });
});

app.post('/DeletePatient', function (req, res) {
    
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
    
    var jsonData = JSON.parse(req.body.patientID);
    
    db.Patients.remove({ _id: ObjectId(jsonData) }, true, function (err, removedCount) { 
    
        res.end("Patient removed."); 
    });
  
});


app.post('/SearchPatient', function (req, res) {
  
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
   
    var jsonData = JSON.parse(req.body.patientName);
    
    if (jsonData == "") {
        db.Patients.find(function (err, docs) {
            console.log(docs);
            res.json(docs);
        });
    }else{
        db.Patients.find({ firstname: jsonData }, function (err, docs) {
            console.log(docs);
            res.json(docs);
        });
    }
});

app.post('/SearchDoctor', function (req, res) {
  
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
   
    var jsonData = JSON.parse(req.body.doctorName);
    
    if (jsonData == "") {
        db.Patients.find(function (err, docs) {
            console.log(docs);
            res.json(docs);
        });
    }else{
	
	 db.Patients.find({doctorName:jsonData},function(err,docs){
        console.log(docs);
        res.json(docs);
      });
    }
});



app.post('/UpdatePatientInfo',isLoggedIn, function (req, res) {
  
    res.header("Access-Control-Allow-Origin", "http://localhost");
    res.header("Access-Control-Allow-Methods", "GET, POST");
   
    var jsonData = JSON.parse(req.body.patient);
    
      db.Patients.update(
	                       { _id: ObjectId(jsonData._id)}, 
						   {
            $set: {
                firstname: jsonData.firstname,
                lastname: jsonData.lastname,
                phonenumber: jsonData.phonenumber,
                lastVisitDate: jsonData.lastVisitDate,
                status: jsonData.status
            }
        }, 
						   function(err, object) {
											        if (err){
       												  res.end( "Update failed"); 
											        }else{
												      db.Patients.find(function(err,docs){
                                                      res.json(docs);
                                                       });
											        }
										  });

	
});



app.listen(port);

