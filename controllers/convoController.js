const async = require('async');

//Models
const Convo = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.conversations_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		convos: callback => Convo.find({users: req.user._id}).populate('users').exec(callback)
	}, (err, result) => {
		if(err) return next(err);
		console.log(result.convos);
		res.render('convo_list', {user: result.user, convos: result.convos, a1: 'convo_list'});
	});
};

exports.conversations_create = [
	
	(req, res, next) => {
		if(!(req.body.convo_user instanceof Array)) {
			if(typeof req.body.convo_user === 'undefined') req.body.convo_user = [];
			else req.body.convo_user = Array(req.body.convo_user);
		}
		//console.log(req.body.convo_user);
		next();
	},
	
	check('name').trim().isLength({min: 1}).withMessage('A name must be specified').isAlphanumeric().withMessage('Name must be alphanumeric'),
	
	(req, res, next) => {
		const errors = validationResult(req).array();
		
		if(req.body.convo_user.length == 0) {
			errors.push({msg: 'You must select at least one recipient'});
		}
		
		if(errors.length > 0) {
			async.parallel({
				user: callback => User.findById(req.user._id).populate('friends').exec(callback),
				convos: callback => Convo.find({users: req.user._id}).populate('users').exec(callback)
			}, (err, result) => {
				if(err) return next(err);
				res.render('convo_list', {user: result.user, convos: result.convos, errors: errors, a1: 'convo_list'});
			});
		} else {
			//console.log(req.body.convo_user);
			var userArray = [req.user._id];
			userArray = userArray.concat(req.body.convo_user);
			//console.log(userArray);
			var convo = new Convo({
				name: req.body.name,
				start_user: req.user._id,
				users: userArray,
				messages: [],
				new_messages: [],
			});
			convo.save((err) => {
				if(err) return next(err);
				res.redirect(convo.url);
			});
		}
	}
];

exports.convo_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		convos: callback => Convo.find({users: req.user._id}).populate('users').exec(callback),
		selected: callback => Convo.findById(req.params.id).populate('messages').populate('start_user').populate('users').exec(callback)
	}, (err, result) => {
		if(err) return next(err);
		var allowed = false, num;
		result.selected.users.forEach(function(user, index) {
			if(user._id.toString() == req.user._id.toString()) {
				allowed = true;
				num = index;
			}
		});
		if(allowed) {
			var newMessageArr = result.selected.new_messages;
			newMessageArr[num] = {messages: []};
			Convo.findByIdAndUpdate(req.params.id, {new_messages: newMessageArr}, (err, result2) => {
				if(err) return next(err);
				res.render('convo_list', {user: req.user, convos: result.convos, selected: result.selected, a1: 'convo_list'});
			});
		} else {
			res.redirect('/conversations');
		}
	});
};

exports.convo_post = [
	(req, res, next) => {
		Convo.findById(req.params.id).exec((err, convo2) => {
			if(err) return next(err);
			var message = new Message({
				writer: req.user._id,
				convo: convo2._id,
				message: req.body.message
			});
			message.save(err => {
				if(err) return next(err);
				//console.log(message._id);
				Message.findOne({_id: message._id}).populate('convo').exec((err, Rmessage) => {
					if(err) return next(err);
					var message = Rmessage;
					var convo = message.convo;
					var convoMessages = convo.messages;
					convoMessages.push(message._id);
					var newMessages = convo.new_messages;
					for(let i = 0; i < convo.users.length; i++) {
						let user = convo.users[i];
						if(user.toString() != req.user._id.toString()) {
							if(convo.new_messages[i]) {
								newMessages[i].messages.push(message._id);
							} else {
								newMessages[i] = {messages: [message._id]};
							}
							User.findByIdAndUpdate(user, { $inc: {new_message_count: 1}}, (err, result) => {
								if(err) return next(err);
							});
						}
					}
					var date = message.date;
					Convo.findByIdAndUpdate(req.params.id, {messages: convoMessages, new_messages: newMessages, recent_msg: date}, (err, oConvo) => {
						if(err) return next(err);
						async.parallel({
							user: callback => User.findById(req.user._id).populate('friends').exec(callback),
							convos: callback => Convo.find({users: req.user._id}).populate('users').exec(callback),
							selected: callback => Convo.findById(req.params.id).populate('messages').populate('start_user').populate('users').exec(callback)
						}, (err, result) => {
							if(err) return next(err);
							res.render('convo_list', {user: req.user, convos: result.convos, selected: result.selected, a1: 'convo_list'});
						});
					});
				});
			});
		});
	}
];