const async = require('async');

//Models
const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');
const NewPosts = require('../models/NewPosts');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.groups_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		groups: callback => Group.find({users: req.user._id}).populate('users').exec(callback),
		posts: callback => NewPosts.findOne({user: req.user._id}, {posts: {$slice: 20}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}, populate: {path: 'group', model: 'Group'}}).exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		res.render('group_list', {user: results.user, groups: results.groups, posts: results.posts.posts, a1: 'group_list'});
	});
};

exports.upload_picture = function(req, res, next) {
	console.log(req.file.path);
	res.send(req.file.path.substring(req.file.path.indexOf('c') + 1));
};

exports.groups_create = function(req, res, next) {
	let group = new Group({
		start_user: req.user._id,
		users: [req.user._id],
		name: req.body.name,
		status: req.body.status,
		description: req.body.description,
		picture: req.body.picture_path,
		posts: []
	});
	group.save(err => {
		if(err) return next(err);
		let post = new Post({
			writer: req.user._id,
			group: group._id,
			message: `<${req.user.tag}> started a new Group (${group.name})!`,
			special: true,
			files: [],
			likes: [],
			dislikes: [],
			shares: [],
			replies: []
		});
		post.save(err => {
			if(err) return next(err);
			Group.findByIdAndUpdate(group._id, {$push: {posts: post._id}}, (err, something) => {
				if(err) return next(err);
				res.redirect(group.url);
			});
		});
	});
};

exports.group_get = function(req, res, next) {
	async.parallel({
		groups: callback => Group.find({users: req.user._id}).exec(callback),
		selected: callback => Group.findOne({_id: req.params.id}, {posts: {$slice: 20}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}}).exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		NewPosts.findOne({user: req.user._id}).populate('new_posts').exec((err, newPost) => {
			if(err) return next(err);
			let newPostArray = newPost.new_posts.filter(post => post.group.toString() != req.params.id);
			NewPosts.findByIdAndUpdate(newPost._id, {new_posts: newPostArray}, (err, something) => {
				if(err) return next(err);
				res.render('group', {user: req.user, selected: results.selected, posts: results.selected.posts, groups: results.groups, a1: 'group'});
			});
		});
	});
};