var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var _ = require('underscore');
const jwt = require('jsonwebtoken');
const verifyToken = require('../common/verifyToken');
const globalVariable = require('../common/global');

router.get(`/absentDate/:id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				db.attendance.find({
					emp_id: req.params.id,
					absent_date : {
						$gte : req.query.startDate,
						$lt : req.query.endDate
					}
				}, function(err, task) {
					if(err) res.send(err);
					else res.json(task);
				});
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
});

router.get(`/allowance/:shift_id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				db.allowances.find({
					shift_id: req.params.shift_id,
					emp_type : req.query.emp_type
				}, function(err, task) {
					if(err) res.send(err);
					else res.json(task);
				});
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
});

router.get(`/allowance`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');

				db.allowances.find(function(err, task) {
					if(err) res.send(err);
					else res.json(task);
				});
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
});

module.exports = router;