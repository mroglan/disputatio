const async = require('async');

//Models
const Convo = require('../models/Conversation');
const Message = require('../models/Message');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.conversations_get = function(req, res, next) {
	Convo.find({users: req.user._id}).populate('messages').populate('users').exec((err, convos) => {
		if(err) return next(err);
		res.render('convo_list', {user: req.user, convos: convos, a1: 'convo_list'});
	});
};

