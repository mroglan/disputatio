const bcrypt = require('bcryptjs');
const passport = require('passport');
const async = require('async');
const multer = require('multer');
const fs = require('fs');

// Models
const User = require('../models/User');
const Contact = require('../models/Contact');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.logout = function(req, res, next) {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/users/login');
};

exports.login_get = function(req, res, next) {
	res.render('login', {a1: 'login'});
};

exports.login_post = function(req, res, next) {
	passport.authenticate('local', {
		successRedirect: '/disputatio/dashboard',
		failureRedirect: '/users/login',
		failureFlash: true
	})(req, res, next);
};

exports.register_post = function(req, res, next) {
	
	const {name, email, password, password2} = req.body;
	let errors = [];
	
	// Check required fields
	if(!name || !email || !password || !password2) {
		errors.push({msg: 'Please fill in all fields'});
	}
	
	// Check passwords match
	if(password != password2) {
		errors.push({msg: 'Passwords do not match'});
	}
	
	//Check pass length
	if(password.length < 6) {
		errors.push({msg: 'Password should be at least 6 characters'});
	}
	
	if(errors.length > 0) {
		res.render('register', {
			errors,
			name,
			email, 
			password, 
			password2
		});
	} else {
		// Validation passed
		User.findOne({email: email}).then(user => {
			if(user) {
				// User exists
				errors.push({msg: 'Email is already registered'});
				res.render('register', {
					errors,
					name,
					email, 
					password, 
					password2
				});
			} else {
				const newUser = new User({name, email, password, admin: false, friends: []});
				// same as newUser = new User({name: name, email: email, password: password});
				
				// Hash password
				bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
					if(err) throw err;
					// Set password to hashed
					newUser.password = hash;
					//Save user 
					newUser.save().then(user => {
						req.flash('success_msg', 'You are now registered and can log in');
						res.redirect('/users/login');
					}).catch(err => console.log(err));
				}));
			}
		});
	}
};	

exports.profile_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		contact: callback => Contact.findOne({contact_user: req.user._id}).exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		//console.log(results.user.picture);
		res.render('profile', {user: req.user, friends: results.user.friends, contact: results.contact, a1: 'profile'});
	});
};

exports.profile_post = [
	
	check('name', 'Name must have at least one character!').trim().isLength({min: 1}),
	check('status', 'Status must be less than 11 characters!').trim().isLength({max: 10}),
	
	(req, res, next) => {
		const errors = validationResult(req);
		
		if(!errors.isEmpty()) {
			var user = {
				name: req.body.name,
				email: req.user.email,
				status: req.body.status,
				bio: req.body.bio,
				admin: req.user.admin,
				date: req.user.date,
				picture: req.user.picture,
				pictureType: req.user.pictureType,
				_id: req.user._id,
				friends: req.user.friends
			};
			var contact = {
				first_name: req.body.contact_first_name,
				last_name: req.body.contact_last_name,
				reserved: req.body.reserve_option,
				job: req.body.contact_job,
				email: req.body.contact_email,
				phones: phones(req),
				address: req.body.address,
				other: others(req),
				notes: req.body.contact_notes
			};
			res.render('profile', {user: user, friends: user.friends, contact: contact, a1: 'profile', user_errors: errors.array()});
			return;
		} else {
			User.findByIdAndUpdate(req.user._id, {
				name: req.body.name,
				status: req.body.status,
				bio: req.body.bio
			}, (err, result) => {
				if(err) return next(err);
				next();
			});
		}
	},
	
	(req, res, next) => {
		var user = {
			name: req.body.name,
			email: req.user.email,
			status: req.body.status,
			bio: req.body.bio,
			admin: req.user.admin,
			date: req.user.date,
			picture: req.user.picture,
			pictureType: req.user.pictureType,
			_id: req.user._id,
			friends: req.user.friends
		};
		if(req.body.contact_first_name.length < 1) {
			var contact = {
				first_name: req.body.contact_first_name,
				last_name: req.body.contact_last_name,
				reserved: req.body.reserve_option,
				job: req.body.contact_job,
				email: req.body.contact_email,
				phones: phones(req),
				address: req.body.address,
				other: others(req),
				notes: req.body.contact_notes
			};
			//console.log(contact.phones);
			//console.log(contact.other);
			//console.log(user);
			res.render('profile', {user: user, friends: user.friends, contact: contact, a1: 'profile'});
		} else {
			Contact.findOne({contact_user: req.user._id}).exec((err, result) => {
				if(err) return next(err);
				console.log(phones(req));
				var contact = new Contact({
					first_name: req.body.contact_first_name,
					last_name: req.body.contact_last_name,
					reserved: req.body.reserve_option,
					job: req.body.contact_job,
					email: req.body.contact_email,
					phones: phones(req),
					address: req.body.address,
					other: others(req),
					notes: req.body.contact_notes,
					contact_user: req.user._id
				});
				console.log(contact.phones);
				//console.log(contact.reserved);
				if(!result) {
					contact.save(err => {
						if(err) return next(err);
						res.render('profile', {user: user, friends: user.friends, contact: contact, a1: 'profile'});
					});
				} else {
					contact._id = result._id;
					Contact.findOneAndUpdate({contact_user: req.user._id}, contact, {}, (err, updatedcontact) => {
						if(err) return next(err);
						console.log(contact);
						res.render('profile', {user: user, friends: user.friends, contact: contact, a1: 'profile'});
					});
				}
			});
		}
	}
];

function others(req) {
	var otherArray = [];
	for(let i = 0; i < req.body.cat_length; i++) {
		if(i == 0) {
			otherArray.push({name: req.body.cat_name_1, details: req.body.cat_detail_1});
		} else if(i == 1) {
			otherArray.push({name: req.body.cat_name_2, details: req.body.cat_detail_2});
		} else if(i == 2) {
			otherArray.push({name: req.body.cat_name_3, details: req.body.cat_detail_3});
		} else if(i== 3) {
			otherArray.push({name: req.body.cat_name_4, details: req.body.cat_detail_4});
		} else if(i == 4) {
			otherArray.push({name: req.body.cat_name_5, details: req.body.cat_detail_5});
		}
	}
	return otherArray;
}

function phones(req) {
	var phoneArray = [];
	for(let i = 0; i < req.body.phone_length; i++) {
		if(i == 0) {
			phoneArray.push({name: req.body.phone_name_1, number: req.body.phone_number_1});
		} else if(i == 1) {
			phoneArray.push({name: req.body.phone_name_2, number: req.body.phone_number_2});
		} else if(i == 2) { 
			phoneArray.push({name: req.body.phone_number_3, number: req.body.phone_number_3});
		} else if(i == 3) {
			phoneArray.push({name: req.body.phone_name_4, number: req.body.phone_number_4});
		}
	}
	return phoneArray;
}

exports.change_picture = function(req, res, next) {
	console.log(req.file.path.substring(req.file.path.indexOf('c') + 1));
	User.findByIdAndUpdate(req.user._id, {picture: req.file.path.substring(req.file.path.indexOf('c') + 1)}, (err, result) => {
		if(err) return next(err);
		res.send(req.file.path);
	});
};

exports.friend_search_1 = function(req, res, next) {
	var count = 0;
	var userArray = [];
	User.find().exec((err, users) => {
		users.forEach(function(user) {
			//console.log(user.name.toLowerCase() + ', ' + req.body.search.toLowerCase());
			if(user.name.toLowerCase() == req.body.search.toLowerCase()) {
				//console.log('match!');
				userArray.push(user);
			} 
			count++;
			if(count == users.length) {
				console.log(userArray);
				res.send(userArray);
			}
		});
	});
};

exports.other_profile_get = function(req, res, next) {
	User.findById(req.params.id).populate('friends').exec((err, user) => {
		if(err) return next(err);
		var isFriend = false, i = 0;
		req.user.friends.forEach(function(friend, index) {
			if(friend.toString() == user._id.toString()) {
				isFriend = true;
			}
			i++;
			if(i == req.user.friends.length) {
				other_profile_get2(req, res, user, isFriend);
			}
		});
	});
};

function other_profile_get2(req, res, user, isFriend) {
	Contact.findOne({contact_user: user._id}).exec((err, contact) => {
		if(err) return next(err);
		res.render('other_profile', {user: req.user, profile: user, isFriend: isFriend, contact: contact, a1: 'other_profile'});
	});
};

exports.add_friend = function(req, res, next) {
	User.findById(req.params.id).exec((err, result) => {
		if(err) return next(err);
		if(!result) {
			User.findById(req.user._id).populate('friends').exec((err, user) => {
				if(err) return next(err);
				res.send('Not found!');
			});
			return;
		}
		var valid = true;
		req.user.friends.forEach(function(friend) {
			if(friend.toString() == result._id.toString()) {
				//console.log('repeat');
				valid = false;
			}
		});
		if(!valid) {
			User.findById(req.user._id).populate('friends').exec((err, user) => {
				if(err) return next(err);
				res.send('Already added!');
			});
			return;
		}
		var friendsArray = req.user.friends;
		friendsArray.push(result._id);
		User.findByIdAndUpdate(req.user._id, {friends: friendsArray}, (err, theuser) => {
			if(err) return next(err);
			User.findById(req.user._id).populate('friends').exec((err, user) => {
				if(err) return next(err);
				res.send(user.friends);
			});
		});
	});
};

exports.give_friends = function(req, res, next) {
	User.findById(req.user._id).populate('friends').exec((err, user) => {
		if(err) return next(err);
		res.send(user.friends);
	});
};

exports.remove_friend = function(req, res, next) {
	User.findById(req.params.id).exec((err, user) => {
		if(err) return next(err);
		var isFriend = false, fIndex = 0, i = 0;
		req.user.friends.forEach(function(friend, index) {
			//console.log(friend.toString() + ', ' + user._id.toString());
			if(friend.toString() == user._id.toString()) {
				isFriend = true;
				fIndex = index;
			}
			i++;
			if(i === req.user.friends.length) {
				if(!isFriend) {
					res.send('Already not a friend');
				}
				else {
					var friendArray = req.user.friends;
					friendArray.splice(fIndex, 1);
					User.findByIdAndUpdate(req.user._id, {friends: friendArray}, (err, theuser) => {
						if(err) return next(err);
						User.findById(req.user._id).populate('friends').exec((err, theuser2) => {
							if(err) return next(err);
							console.log(theuser2.friends);
							res.send(theuser2.friends);
						});
					});
				}
			}
		});
	});
};

exports.post_friendinfo = function(req, res, next) {
	User.findById(req.params.id).exec((err, user) => {
		if(err) return next(err);
		res.send(user.friends.length.toString());
	});
};