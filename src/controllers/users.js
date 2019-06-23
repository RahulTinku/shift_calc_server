var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var _ = require('underscore');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const globalVariable = require('../common/global');

router.post(`/login`, function(req, res) {
	var db = req.app.get('shift_calculator');

	var requestUser = _.clone(req.body);
	db.users.findOne({
		 username: requestUser.username, 
		}, function(err, data) {
			if(err) {
				console.log(err);
				res.status(401).send('username/password incorrect');
			}
			else {
				if(data !== null && data.length !== 0){
				// compare the password entered with saved password
				if (bcrypt.compareSync(requestUser.password, data.password)){
					//replace _id because JSON.parse can't parse _
					data = JSON.stringify(data).replace('_id','id');
					//parsing response to use username and variable
					var user = JSON.parse(data);
					//set secret key for token generation
					globalVariable.setSecret(user.username, user.password);
					//generate token for specific user
					const token = jwt.sign({sub: user.id},globalVariable.getSecret(),{ expiresIn : '8h'});
					const dataToSend = {
						emp_id : user.emp_id,
						token : token
					}
					res.send(dataToSend)
				} else{
					res.status(401).send('username/password incorrect');
				}
				
			}else{
				res.status(401).send('unauthorized');
			}
		}
		});
	});

module.exports = router;