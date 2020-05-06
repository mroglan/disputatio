const async = require('async');

//Models
const Convo = require('../models/Conversation');

exports.side_convos = function(req, res, next) {
	Convo.find({users: req.user._id}).exec((err, convos) => {
		if(err) return next(err);
		var total = 0;
		convos.forEach(function(convo) {
			var i = convo.users.indexOf(req.user._id);
			if(convo.new_messages[i]) {
				total += convo.new_messages[i].messages.length;
			}
		});
		res.send(total.toString());
	});
};

exports.convo_list = function(req, res, next) {
	Convo.find({users: req.user._id}).exec((err, convos) => {
		if(err) return next(err);
		var notifArray = [];
		convos.forEach(function(convo) {
			var i = convo.users.indexOf(req.user._id);
			if(convo.new_messages[i]) {
				notifArray.push({id: convo._id, num: convo.new_messages[i].messages.length});
			}
		});
		res.send(notifArray);
	});
};