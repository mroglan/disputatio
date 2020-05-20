const async = require('async');

//Models
const GlobalMessages = require('../models/GlobalMessages');
const Message = require('../models/Message');
const User = require('../models/User');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.get_globalchat = function(req, res, next) {
	Message.find({globalChat: true}).sort({date: 1}).limit(30).populate('writer').exec((err, messages) => {
		if(err) return next(err);
		GlobalMessages.findOneAndUpdate({user: req.user._id}, {messages: []}, (err, something) => {
			if(err) return next(err);
			res.render('globalchat', {user: req.user, messages: messages, a1: 'globalchat'});
		});
	});
};

exports.new_message = function(req, res, next) {
	let message = new Message({
		writer: req.user._id,
		message: req.body.message,
		globalChat: true
	});
	message.save(err => {
		if(err) return next(err);
		GlobalMessages.find({}).exec((err, results) => {
			if(err) return next(err);
			results.forEach(function(result) {
				if(result.user.toString() != req.user._id.toString()) {
					GlobalMessages.findOneAndUpdate({_id: result._id}, {$push: {messages: message._id}}, (err, something) => {
						if(err) return next(err);
					});
				}
			});
			res.send(message);
		});
	});
};

exports.get_messages = function(req, res, next) {
	GlobalMessages.findOne({user: req.user._id}).populate({path: 'messages', model: 'Message', populate: {path: 'writer', model: 'User'}}).exec((err, result) => {
		if(err) return next(err);
		let resultArray = result.messages.map(message => {
			return {id: message.writer._id, tag: message.writer.tag, msg: message.message};
		});
		GlobalMessages.findOneAndUpdate({user: req.user._id}, {messages: []}, (err, something) => {
			if(err) return next(err);
			res.send(resultArray);
		});
	});
};