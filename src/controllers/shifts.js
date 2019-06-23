var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
const jwt = require('jsonwebtoken');
const verifyToken = require('../common/verifyToken');
const globalVariable = require('../common/global');

router.get('/shifts', function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');

				db.shifts.find(function(err, shift) {
					if(err) res.send(err);
					else res.json(shift);
				})
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
});

router.get(`/shift/:id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');

				db.shifts.find({
					_id: mongojs.ObjectId(req.params.id)
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

module.exports = router;