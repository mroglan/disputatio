const async = require('async');

//Models
const Convo = require('../models/Conversation');
const Group = require('../models/Group');
const NewPosts = require('../models/NewPosts');

exports.side_convos = function(req, res, next) {
	Convo.find({users: req.user._id}).exec((err, convos) => {
		if(err) return next(err);
		let total = 0;
		convos.forEach(function(convo) {
			let i = convo.users.indexOf(req.user._id);
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
		let notifArray = [];
		convos.forEach(function(convo) {
			let i = convo.users.indexOf(req.user._id);
			if(convo.new_messages[i]) {
				notifArray.push({id: convo._id, num: convo.new_messages[i].messages.length});
			}
		});
		res.send(notifArray);
	});
};

exports.side_groups = function(req, res, next) {
	NewPosts.findOne({user: req.user._id}).exec((err, result) => {
		if(err) return next(err);
		res.send(result.new_posts.length.toString());
	});
};

exports.group_list = function(req, res, next) {
	async.parallel({
		groups: callback => Group.find({users: req.user._id}).exec(callback),
		newposts: callback => NewPosts.findOne({user: req.user._id}).populate('new_posts').exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		let newposts = results.newposts.new_posts;
		//console.log(results.newposts.new_posts);
		let resultArray = results.groups.map(group => { return {id: group._id.toString(), posts: newposts.filter(el => el.group.toString() === group._id.toString())}});
		//console.log(resultArray);
		res.send(resultArray);
	});
};