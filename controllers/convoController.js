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
	
	check('name').trim().isLength({min: 1}).withMessage('A name must be specified'),
	
	(req, res, next) => {
		const errors = validationResult(req).array();
		
		if(req.body.convo_user.length == 0) {
			errors.push({msg: 'You must select at least one recipient'});
		}
		
		const validAlpha = (input) => input.split(' ').every(function(word) { return check(word).isAlphanumeric() });
		
		if(!validAlpha(req.body.name)) {
			errors.push({msg: 'Name must be alphanumeric'});
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
			let userArray = [req.user._id];
			userArray = userArray.concat(req.body.convo_user);
			//console.log(userArray);
			let convo = new Convo({
				name: req.body.name,
				start_user: req.user._id,
				users: userArray,
				messages: [],
				new_messages: [],
				recent_msg: Date.now()
			});
			convo.save((err) => {
				if(err) return next(err);
				let message = new Message({
					writer: req.user._id,
					convo: convo._id,
					message: `<${req.user.tag}> started this conversation`,
					special: true
				});
				message.save(err => {
					if(err) return next(err);
					let messagesArray = convo.messages;
					messagesArray.push(message._id);
					let newMessages = convo.new_messages;
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
					Convo.findByIdAndUpdate(convo._id, {messages: messagesArray, new_messages: newMessages}, (err, something) => {
						if(err) return next(err);
						res.redirect(convo.url);
					});
				});
			});
		}
	}
];

exports.conversations_delete = function(req, res, next) {
	if(!(req.body.delete_convo instanceof Array)) {
		if(typeof req.body.delete_convo === 'undefined') req.body.delete_convo = [];
		else req.body.delete_convo = Array(req.body.delete_convo);
	}
	
	Convo.find({users: req.user._id}).exec((err, convos) => {
		convos = convos.filter((el) => req.body.delete_convo.includes(el._id.toString()));
		convos.forEach(function(convo) {
			let i = convo.users.indexOf(req.user._id);
			convo.users.splice(i, 1);
			if(convo.new_messages[i]) {
				convo.new_messages.splice(i, 1);
			}
			if(convo.start_user.toString() == req.user._id.toString()) {
				Convo.findByIdAndRemove(convo._id, function deleteConvo(err) {
					if(err) return next(err);
				});
			} else {
				Convo.findByIdAndUpdate(convo._id, {users: convo.users, new_messages: convo.new_messages}, (err, something) => {
					if(err) return next(err);
				});
			}
		});
		res.redirect('/chats/conversations');
	});
};

exports.convo_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		convos: callback => Convo.find({users: req.user._id}).populate('users').exec(callback),
		selected: callback => Convo.findById(req.params.id).populate('messages').populate('start_user').populate('users').exec(callback)
	}, (err, result) => {
		if(err) return next(err);
		let allowed = false, num;
		result.selected.users.forEach(function(user, index) {
			if(user._id.toString() == req.user._id.toString()) {
				allowed = true;
				num = index;
			}
		});
		if(allowed) {
			let newMessageArr = result.selected.new_messages;
			if(newMessageArr[num]) {
				let total = result.user.new_message_count - newMessageArr[num].messages.length;
				User.findByIdAndUpdate(req.user._id, {new_message_count: total}, (err, someuser) => {
					if(err) return next(err);
				});
			}
			newMessageArr[num] = {messages: []};
			Convo.findByIdAndUpdate(req.params.id, {new_messages: newMessageArr}, (err, result2) => {
				if(err) return next(err);
				res.render('convo_list', {user: result.user, convos: result.convos, selected: result.selected, a1: 'convo_list'});
			});
		} else {
			res.redirect('/chats/conversations');
		}
	});
};

exports.convo_post = [
	(req, res, next) => {
		console.log(req.body);
		Convo.findById(req.params.id).exec((err, convo2) => {
			if(err) return next(err);
			let message = new Message({
				writer: req.user._id,
				convo: convo2._id,
				message: req.body.message
			});
			message.save(err => {
				if(err) return next(err);
				//console.log(message._id);
				Message.findOne({_id: message._id}).populate('convo').exec((err, Rmessage) => {
					if(err) return next(err);
					let message = Rmessage;
					let convo = message.convo;
					let convoMessages = convo.messages;
					convoMessages.push(message._id);
					let newMessages = convo.new_messages;
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
					let date = message.date;
					Convo.findByIdAndUpdate(req.params.id, {messages: convoMessages, new_messages: newMessages, recent_msg: date}, (err, oConvo) => {
						if(err) return next(err);
						res.send(req.body.message);
					});
				});
			});
		});
	}
];

exports.convo_add_members = function(req, res, next) {
	if(!(req.body.new_user instanceof Array)) {
		if(typeof req.body.new_user == 'undefined') req.body.new_user = [];
		else req.body.new_user = Array(req.body.new_user);
	}
	if(!(req.body.new_user_tag instanceof Array)) {
		if(typeof req.body.new_user_tag == 'undefined') req.body.new_user_tag = [];
		else req.body.new_user_tag = Array(req.body.new_user_tag);
	}
	if(req.body.new_user.length > 0) {
		let message = new Message({
			writer: req.user._id,
			convo: req.params.id,
			message: `<${req.user.tag}> added <${req.body.new_user_tag.join('>  <')}>`,
			special: true
		});
		message.save(err => {
			if(err) return next(err);
			Convo.findById(req.params.id).exec((err, convo) => {
				if(err) return next(err);
				let userArray = convo.users;
				userArray = userArray.concat(req.body.new_user);
				let messageArray = convo.messages;
				messageArray.push(message._id);
				let newMessages = convo.new_messages;
				for(let i = 0; i < userArray.length; i++) {
					let user = userArray[i];
					if(user.toString() != req.user._id.toString()) {
						if(convo.new_messages[i]) {
							newMessages[i].messages.push(message._id);
						} else {
							newMessages[i] = {messages: [message._id]};
						}
						User.findByIdAndUpdate(user, { $inc: {new_message_count: 1}}, (err, something) => {
							if(err) return next(err);
						});
					}
				}
				let date = message.date;
				Convo.findByIdAndUpdate(req.params.id, {users: userArray, messages: messageArray, new_messages: newMessages, recent_msg: date}, (err, something) => {
					if(err) return next(err);
					res.redirect(`/chats/conversations/${req.params.id}`);
				});
			});
		});
	} else {
		res.redirect(`/chats/conversations/${req.params.id}`);
	}
};

exports.convo_remove_members = function(req, res, next) {
	if(!(req.body.delete_user instanceof Array)) {
		if(typeof req.body.delete_user == 'undefined') req.body.delete_user = [];
		else req.body.delete_user = Array(req.body.delete_user);
	}
	if(!(req.body.delete_user_tag instanceof Array)) {
		if(typeof req.body.delete_user_tag == 'undefined') req.body.delete_user_tag = [];
		else req.body.delete_user_tag = Array(req.body.delete_user_tag);
	}
	if(req.body.delete_user.length > 0) {
		let message = new Message({
			writer: req.user._id,
			convo: req.params.id,
			message: `<${req.user.tag}> removed <${req.body.delete_user_tag.join('>  <')}>`,
			special: true
		});
		message.save(err => {
			if(err) return next(err);
			Convo.findById(req.params.id).exec((err, convo) => {
				if(err) return next(err);
				let userArray = convo.users;
				let messageArray = convo.messages;
				messageArray.push(message._id);
				let newMessages = convo.new_messages;
				req.body.delete_user.forEach(function(dUser) {
					userArray.forEach(function(user, index) {
						if(user.toString() == dUser.toString()) {
							userArray.splice(index, 1);
							if(newMessages.length > index) {
								newMessages.splice(index, 1);
							}
						}
					});
				});
				for(let i = 0; i < userArray.length; i++) {
					let user = userArray[i];
					if(user.toString() != req.user._id.toString()) {
						if(convo.new_messages[i]) {
							newMessages[i].messages.push(message._id);
						} else {
							newMessages[i] = {messages: [message._id]};
						}
						User.findByIdAndUpdate(user, { $inc: {new_message_count: 1}}, (err, something) => {
							if(err) return next(err);
						});
					}
				}
				let date = message.date;
				Convo.findByIdAndUpdate(req.params.id, {users: userArray, messages: messageArray, new_messages: newMessages, recent_msg: date}, (err, something) => {
					if(err) return next(err);
					res.redirect(`/chats/conversations/${req.params.id}`);
				});
			});
		});
	} else {
		res.redirect(`/chats/conversations/${req.params.id}`);
	}
};

exports.get_new_messages = function(req, res, next) {
	Convo.findById(req.params.id).populate({path: 'new_messages.messages.messages', model: 'Message'}).populate({path: 'messages', populate: {path: 'writer', model: 'User'}}).exec((err, convo) => {
		let index;
		let x = req.body.id;
		console.log(x);
		console.log(convo.users);
		for(let i = 0; i < convo.users.length; i++) {
			if(convo.users[i].toString() == x) {
				index = i;
				break;
			}
		}
		if(!convo.new_messages[index]) {
			res.send('failed to find new messages');
		} else {
			let newMessages = convo.new_messages[index].messages;
			let sendArray = [];
			for(let i = convo.messages.length - 1; i > -1; i--) {
				newMessages.forEach(function(message, ind) {
					if(message.toString() == convo.messages[i]._id.toString()) {
						sendArray.push({tag: convo.messages[i].writer.tag, id: convo.messages[i].writer._id, msg: convo.messages[i].message});
					}
				});
				if(sendArray.length == newMessages.length) {
					convo.new_messages[index].messages = [];
					Convo.findByIdAndUpdate(req.params.id, {new_messages: convo.new_messages}, (err, something) => {
						if(err) return next(err);
					});
					res.send(sendArray);
					return;
				}
			}
			res.send('no new messages');
		}
	});
};

exports.check_sidebar = function(req, res, next) {
	Convo.find({users: req.user._id}).populate('users').exec((err, convos) => {
		if(err) return next(err);
		convos.sort((a, b) => b.recent_msg - a.recent_msg);
		let sendArray = [];
		convos.forEach(function(convo) {
			let i;
			convo.users.forEach(function(user, index) {
				if(user._id.toString() == req.user._id.toString()) {
					i = index;
				}
			});
			sendArray.push({name: convo.name, 
			users: convo.users.filter(user => user._id.toString() != req.user._id.toString()),
			new_len: convo.new_messages[i] ? convo.new_messages[i].messages.length : 0,
			id: convo._id});
		});
		res.send(sendArray);
	});
};