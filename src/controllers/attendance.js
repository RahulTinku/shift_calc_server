var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var _ = require('underscore');
const jwt = require('jsonwebtoken');
const verifyToken = require('../common/verifyToken');
const globalVariable = require('../common/global');

router.put(`/attendance/:_id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				var user = req.body;
				let absentData = {
					"emp_id" : req.params._id,
					"absent_date" : user.absent_date,
					"remarks" : user.remarks
				}
				db.attendance.findOne({
					 emp_id: req.params._id, 
					 absent_date : absentData.absent_date,
					// upsert : true,
					// new : true,
					// update : {"emp_id": req.params._id, "absent_date" : absentData.absent_date, "remarks" : absentData.remarks}
				}, function(err, data) {
					if(err){
						console.log(err)
						res.send(err);
					}else {
						if(data){
							res.status(409).send('record already exists');
						}else{
							db.attendance.save(absentData, function(err, user) {
								if(err) res.send(err);
								else res.send(user);
							})
						}
					}
				});
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
	});

module.exports = router;