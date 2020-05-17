const bcrypt = require('bcryptjs');
const passport = require('passport');
const async = require('async');
const multer = require('multer');
const fs = require('fs');

// Models
const User = require('../models/User');
const Contact = require('../models/Contact');
const NewPosts = require('../models/NewPosts');

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

exports.register_post = [
	
	check('name', 'Name must be specified').trim().isLength({min: 1}),
	check('email', 'Email must be specified').trim().isLength({min: 1}),
	check('password', 'Password must be specified').trim().isLength({min: 1}),
	check('password2', 'Password must be confirmed').trim().isLength({min: 1}),
	check('tag').trim().isLength({min: 1}).withMessage('A tag must be specified').isAlphanumeric().withMessage('Tag must be alphanumeric'),
	
	(req, res, next) => {
		
		const {name, email, password, password2, tag} = req.body;
		const errors = validationResult(req).array();
		
		if(password != password2) {
			errors.push({msg: 'Passwords do not match'});
		}
		if(password.length < 6) {
			errors.push({msg: 'Password should be at least 6 characters'});
		}
		
		if(errors.length > 0) {
			res.render('welcome', {errors, name, email, tag, password, password2, a1: 'welcome'});
		} else {
			User.findOne({email: email}).then(user => {
				if(user) {
					// User exists
					errors.push({msg: 'Email is already registered'});
					res.render('welcome', {errors, name, email, tag, password, password2, a1: 'welcome'});
				} else {
					User.findOne({tag: tag}).then(user2 => {
						if(user2) {
							errors.push({msg: 'Tag is already in use!'});
							res.render('welcome', {errors, name, email, tag, password, password2, a1: 'welcome'});
						} else {
							const newUser = new User({name, email, password, tag, admin: false, friends: [], followers: []});
							// same as newUser = new User({name: name, email: email, password: password});
							
							// Hash password
							bcrypt.genSalt(10, (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => {
								if(err) throw err;
								// Set password to hashed
								newUser.password = hash;
								//Save user 
								newUser.save().then(user => {
									const newPosts = new NewPosts({
										user: newUser._id,
										posts: [],
										new_posts: []
									});
									newPosts.save(err => {
										if(err) return next(err);
									});
									req.flash('success_msg', 'You are now registered and can log in');
									res.redirect('/users/login');
								}).catch(err => console.log(err));
							}));
						}
					});
				}
			});
		}
	}
];

exports.profile_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').populate('followers').exec(callback),
		contact: callback => Contact.findOne({contact_user: req.user._id}).exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		//console.log(results.user.picture);
		res.render('profile', {user: req.user, friends: results.user.friends, followers: results.user.followers, contact: results.contact, a1: 'profile'});
	});
};

exports.profile_post = [
	
	check('name', 'Name must have at least one character!').trim().isLength({min: 1}),
	check('status', 'Status must be less than 11 characters!').trim().isLength({max: 10}),
	
	(req, res, next) => {
		const errors = validationResult(req);
		
		if(!errors.isEmpty()) {
			let user = {
				name: req.body.name,
				email: req.user.email,
				tag: req.user.tag,
				status: req.body.status,
				bio: req.body.bio,
				admin: req.user.admin,
				date: req.user.date,
				picture: req.user.picture,
				pictureType: req.user.pictureType,
				_id: req.user._id,
				friends: req.user.friends,
				followers: req.user.followers
			};
			let contact = {
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
		let user = {
			name: req.body.name,
			email: req.user.email,
			tag: req.user.tag,
			status: req.body.status,
			bio: req.body.bio,
			admin: req.user.admin,
			date: req.user.date,
			picture: req.user.picture,
			pictureType: req.user.pictureType,
			_id: req.user._id,
			friends: req.user.friends,
			followers: req.user.followers
		};
		if(req.body.contact_first_name.length < 1) {
			let contact = {
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
				let contact = new Contact({
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
	let otherArray = [];
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
	let phoneArray = [];
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
	//console.log(req.body);
	User.findOne({tag: req.body.search}).exec((err, user) => {
		if(err) return next(err);
		if(!user || user._id.toString() == req.user._id.toString()) {
			console.log('sending false');
			res.send({result: 'none'});
			return;
		}
		console.log(user);
		let isFriended = false;
		req.user.friends.forEach(function(friend) {
			if(friend.toString() === user._id.toString()) {
				isFriended = true;
			}
		});
		res.send({result: 'true', user: user, isFriended: isFriended});
	});
};

exports.other_profile_get = function(req, res, next) {
	User.findById(req.params.id).populate('friends').exec((err, user) => {
		if(err) return next(err);
		let isFriend = false, i = 0;
		req.user.friends.forEach(function(friend, index) {
			if(friend.toString() == user._id.toString()) {
				isFriend = true;
			}
			i++;
			if(i == req.user.friends.length) {
				//console.log('to next function');
				other_profile_get2(req, res, user, isFriend);
			}
		});
		if(req.user.friends.length == 0) {
			other_profile_get2(req, res, user, isFriend);
		}
	});
};

function other_profile_get2(req, res, user, isFriend) {
	Contact.findOne({contact_user: user._id}).exec((err, contact) => {
		if(err) return next(err);
		let hasFriended = false, j = 0;
		req.user.followers.forEach(function(friend, index) {
			if(friend._id.toString() == req.user._id.toString()) {
				hasFriended = true;
			}
			j++;
			if(j == req.user.followers.length) {
				console.log('to final function');
				res.render('other_profile', {user: req.user, profile: user, isFriend: isFriend, hasFriended: hasFriended, contact: contact, a1: 'other_profile'});
			}
		});
		if(req.user.followers.length == 0) {
			res.render('other_profile', {user: req.user, profile: user, isFriend: isFriend, hasFriended: hasFriended, contact: contact, a1: 'other_profile'});
		}
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
		let valid = true;
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
		let friendsArray = req.user.friends;
		friendsArray.push(result._id);
		let followerArray = result.followers;
		followerArray.push(req.user._id);
		User.findByIdAndUpdate(req.params.id, {followers: followerArray}, (err, otherUser) => {
			if(err) return next(err);
		});
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
		let isFriend = false, fIndex = 0, i = 0;
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
					let friendArray = req.user.friends;
					friendArray.splice(fIndex, 1);
					let followerArray = user.followers;
					followerArray.splice(followerArray.indexOf(req.user._id), 1);
					User.findByIdAndUpdate(req.params.id, {followers: followerArray}, (err, otherUser) => {
						if(err) return next(err);
					});
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

exports.friends_get = function(req, res, next) {
	User.findById(req.user._id).populate('friends').exec((err, user) => {
		if(err) return next(err);
		res.render('friend_list', {user: req.user, friends: user.friends, a1: 'friend_list'});
	});
};

exports.other_friends_get = function(req, res, next) {
	User.findById(req.params.id).populate('friends').exec((err, user) => {
		if(err) return next(err);
		res.render('other_friend_list', {user: req.user, profile: user, friends: user.friends, a1: 'other_friend_list'});
	});
};

exports.followers_get = function(req, res, next) {
	User.findById(req.user._id).populate('followers').exec((err, user) => {
		if(err) return next(err);
		res.render('follower_list', {user: req.user, followers: user.followers, a1: 'follower_list'});
	});
};

exports.other_followers_get = function(req, res, next) {
	User.findById(req.params.id).populate('followers').exec((err, user) => {
		if(err) return next(err);
		res.render('other_follower_list', {user: req.user, profile: user, followers: user.followers, a1: 'other_follower_list'});
	});
};

exports.find_user = function(req, res, next) {
	User.findOne({tag: req.params.tag}).exec((err, user) => {
		if(err) return next(err);
		if(!user) {
			res.redirect('/users/profile/not_found');
		} else {
			res.redirect(`/users/${user._id}/profile`);
		}
	});
}