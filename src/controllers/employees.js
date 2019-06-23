var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var _ = require('underscore');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const verifyToken = require('../common/verifyToken');
const globalVariable = require('../common/global');

//Get All Users
router.get(`/employeeList/:manager_id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){

		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				let manager_id = req.params.manager_id;

				db.employees.find({
					manager_id : manager_id
				},function(err, test) {
					if(err) res.send(err);
					else {
						let sendUser = [];
						test.map((item, index)=>{
							let user = {
								name : capitalizeFirstLetter(item.name),
								address: item.address,
								email: item.email,
								emp_type: item.emp_type,
								gender: item.gender,
								join_date: item.join_date,
								manager: capitalizeFirstLetter(item.manager),
								manager_id: item.manager_id,
								phone: item.phone,
								shift: item.shift,
								shift_id: item.shift_id,
								team: item.team,
								_id: item._id
							};
							sendUser.push(user);
						})
						res.json(sendUser)
					};
				});
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
	
});
//get managers from employee list
router.get('/getMangers', function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				db.employees.find({
					emp_type : { $in : ['Manager', 'Supervisor']}
				},function(err, test) {
					if(err) res.send(err);
					else {
						let managers = [];
						test.map((item, index) => {
							let user = {
								name : capitalizeFirstLetter(item.name),
								emp_id : item._id
							}
							managers.push(user);
						})
						res.json(managers)
					};
				});
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
})

//Get Single User
router.get(`/employee/:_id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var _id = req.params._id;
				var db = req.app.get('shift_calculator');

				db.employees.findOne({
					_id: mongojs.ObjectId(req.params._id)
				}, function(err, emp) {
					if(err) res.send(err);
					else {
						let user = {
							name : capitalizeFirstLetter(emp.name),
							address: emp.address,
							email: emp.email,
							emp_type: emp.emp_type,
							gender: emp.gender,
							join_date: emp.join_date,
							manager: capitalizeFirstLetter(emp.manager),
							manager_id: emp.manager_id,
							phone: emp.phone,
							shift: emp.shift,
							shift_id: emp.shift_id,
							team: emp.team,
							_id: emp._id
						}
						res.json(user)
					};
				});
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
});
//modify user
router.put(`/employee/:_id`, function(req, res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var _id = req.params._id;
				var db = req.app.get('shift_calculator');
				if(req.body === null || req.body === undefined){
					res.status(400).send('request body not found');
				} else{
					db.employees.findAndModify({
						query : {_id: mongojs.ObjectId(req.params._id)},
						upsert : true,
						new : true,
						update : { $set : {"shift_id": req.body.shift_id}}
					}, function(err, user) {
						if(err) res.send(err);
						else res.send(user);
					});
				}
			}
		})
	}else{
		res.status(403).send('no token provided');
	}
});

router.post('/adduser', function(req,res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				if(req.body === null || req.body === undefined){
					res.status(400).send('request body not found');
				} else{
					let user = {
						name : req.body.name.toLowerCase(),
						email : req.body.email.toLowerCase(),
						phone : req.body.phone,
						join_date : req.body.join_date,
						manager : req.body.manager.toLowerCase(),
						gender : req.body.gender,
						shift : req.body.shift,
						team : req.body.team,
						emp_type : req.body.emp_type,
						address : req.body.address,
						shift_id: req.body.shift_id,
						manager_id : req.body.manager_id
					};
					db.employees.findOne({
						email : user.email
					}, function(err, data){
						if(err){
							console.log('err',err);
						} else {
							if(data) {
								res.status(409).send('record already exists');
							} else{
								db.employees.save(user, function(err, user) {
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
})

router.post('/addloginuser', function(req,res) {
	let token = verifyToken(req);
	if(token !== null && token !== undefined){
		jwt.verify(token, globalVariable.getSecret(), function(err, decode){
			if(err) res.status(401).send('not authorized');
			else{
				var db = req.app.get('shift_calculator');
				if(req.body === null || req.body === undefined){
					res.status(400).send('request body not found');
				} else{
					let user = req.body;
					let loginUser = {
						username : user.username,
						password : user.password,
						emp_id : '' 
					};

					db.employees.findOne({
						email : user.email
					}, function(err, empInfo){
						if(err) res.send(err);
						else {
							if(empInfo){
								res.status(409).send('employee already exists');
							} else{
								db.users.findOne({
									username : user.username
								}, function(err, userData){
									if(err) res.send(err);
									else {
										if(userData){
											console.log('userData : ', userData);
											res.status(409).send('username already exists');
										} else{
											//let saveUserData = _.clone(_.omit(user, 'username', 'password'));
											let saveUserData = {
												name : req.body.name.toLowerCase(),
												email : req.body.email.toLowerCase(),
												phone : req.body.phone,
												join_date : req.body.join_date,
												manager : req.body.manager.toLowerCase(),
												gender : req.body.gender,
												shift : req.body.shift,
												team : req.body.team,
												emp_type : req.body.emp_type,
												address : req.body.address,
												shift_id: req.body.shift_id,
												manager_id : req.body.manager_id
											};
											db.employees.save(saveUserData, function(err, userSavedData) {
												if(err) res.send(err);
												else {
													loginUser.emp_id = userSavedData._id;
													loginUser.password = encryptPasswordString(loginUser.password);
													db.users.save(loginUser, function(err, loginUserData){
														if(err) res.send(err);
														else res.send(loginUserData)
													})
												};
											})
										}
									}
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
})

// router.use(function(req, res, next){
// 	// check header or url parameters or post parameters for token
//   var token = req.body.token || req.query.token || req.headers['authorization'];

//   // decode token
//   if (token) {

//     // verifies secret and checks exp
//     jwt.verify(token, globalVariable.getSecret(), function(err, decoded) {       if (err) {
//         return res.status(401).send('not authorized');       } else {
//         // if everything is good, save to request for use in other routes
//         req.decoded = decoded;         next();
//       }
//     });

//   } else {

//     // if there is no token
//     // return an error
//     return res.status(403).send({ 
//         success: false, 
//         message: 'No token provided.' 
//     });

// }
// })

/**
	   * Encrypts password using bcrypt making it ready to save in db
	   *
	   * @param string
	   * @returns {string}
	*/
	function encryptPasswordString(string) {
		//generate salt for encrypting password
		var salt = bcrypt.genSaltSync(10);
		var hash = bcrypt.hashSync(string, salt);
	    return hash;
	}
	function capitalizeFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}


module.exports = router;