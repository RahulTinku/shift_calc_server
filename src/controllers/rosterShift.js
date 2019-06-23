var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var _ = require('underscore');
const jwt = require('jsonwebtoken');
const verifyToken = require('../common/verifyToken');
const globalVariable = require('../common/global');

router.post(`/rosterShifts`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				let roster = req.body;
				if(req.body === null || req.body === undefined){
					res.status(400).send('request body not found');
				} else{
					db.rostershfits.find({
						emp_id : roster.emp_id,
						changed_from : roster.changed_from
					}, function(err, data) {
						if(err) res.send(err);
						else {
							if(data && data.length !== 0){
								if(data[0].shift_id === roster.shift_id){
									res.status(409).send('record already exists');
								} else{
									db.rostershfits.findAndModify({
										query : { emp_id : roster.emp_id, changed_from : roster.changed_from },
										upsert : true,
										new : true,
										update : { $set : {"shift_id": roster.shift_id}}
									}, function(err, d) {
										if(err) res.send(err);
										else res.send(d);
									})
								}
								
							}else {
								db.rostershfits.save(roster, function(err, user) {
									if(err) res.send(err);
									else res.send(user);
								})
							}
						}
					})
				}
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
});

router.get(`/rosterShift/:_id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');

				db.rostershfits.find({
					emp_id : req.params._id
				}, function(err, user) {
					if(err) res.send(err);
					else res.send(user);
				})
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
	
});

module.exports = router;