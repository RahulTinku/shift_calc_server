const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongojs = require('mongojs');

const employees = require('./src/controllers/employees');
const attendance  = require('./src/controllers/attendance');
const calculate = require('./src/controllers/calculate');
const shift = require('./src/controllers/shifts');
const routes = require('./src/routes/index');
const rosterShift = require('./src/controllers/rosterShift');
const users = require('./src/controllers/users');

const app = express();

var port = process.env.PORT || 8080;
var db = mongojs('mongodb://powerschool:Powerschool!123@ds261116.mlab.com:61116/shift_calculator', ['employees', 'attendance','shift']);

app.use(function(req,res,next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
	next();
});

//routes(express, app, {})

app
.set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('shift_calculator', db);

app.use('/api', employees, attendance, calculate, shift, rosterShift, users);

app.listen(port, function() {
	console.log('Server started on Port: '+ port);
});