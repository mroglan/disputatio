const async = require('async');

//Models
const Group = require('../models/Group');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const User = require('../models/User');
const NewPosts = require('../models/NewPosts');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.groups_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		groups: callback => Group.find({users: req.user._id}).populate('users').exec(callback),
		posts: callback => NewPosts.findOne({user: req.user._id}, {posts: {$slice: 20}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}})
		.populate({path: 'posts', model: 'Post', populate: {path: 'group', model: 'Group'}}).exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		console.log(results.posts);
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

exports.post_file = function(req, res, next) {
	console.log(req.file.filename);
	res.send({path: req.file.path.substring(req.file.path.indexOf('c') + 1), name: req.file.filename});
};

exports.post_image = function(req, res, next) {
	res.send(req.file.path.substring(req.file.path.indexOf('c') + 1));
};

exports.new_post = [
	check('title', 'Title is too long').trim().isLength({max: 25}),
	check('group', 'You must specify a group!').trim().isLength({min: 1}),
	
	(req, res, next) => {
		if(!(req.body.file_upload instanceof Array)) {
			if(typeof req.body.file_upload === 'undefined') req.body.file_upload = [];
			else req.body.file_upload = Array(req.body.file_upload);
		}
		if(!(req.body.image_upload instanceof Array)) {
			if(typeof req.body.image_upload === 'undefined') req.body.image_upload = [];
			else req.body.image_upload = Array(req.body.image_upload);
		}
		if(!(req.body.file_name instanceof Array)) {
			if(typeof req.body.file_name === 'undefined') req.body.file_name = [];
			else req.body.file_name = Array(req.body.file_name);
		}
		next();
	},
	
	(req, res, next) => {
		const errors = validationResult(req);
		
		let fileArray = [];
		req.body.file_upload.forEach(function(file, index) {
			fileArray.push({name: req.body.file_name[index], path: file});
		});
		
		let post = new Post({
			writer: req.user._id,
			group: req.body.group,
			message: req.body.message,
			title: req.body.title,
			files: fileArray,
			images: req.body.image_upload,
			likes: [],
			dislikes: [],
			shares: [],
			replies: []
		});
		
		if(!errors.isEmpty()) {
			if(req.body.indiv_group === 'true') {
				async.parallel({
					groups: callback => Group.find({users: req.user._id}).exec(callback),
					selected: callback => Group.findOne({_id: req.body.group}, {posts: {$slice: 20}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}}).exec(callback)
					}, (err, results) => {
					if(err) return next(err);
					NewPosts.findOne({user: req.user._id}).populate('new_posts').exec((err, newPost) => {
						if(err) return next(err);
						let newPostArray = newPost.new_posts.filter(post => post.group.toString() != req.params.id);
						NewPosts.findByIdAndUpdate(newPost._id, {new_posts: newPostArray}, (err, something) => {
							if(err) return next(err);
							res.render('group', {user: req.user, selected: results.selected, posts: results.selected.posts, groups: results.groups, errors: errors.array(), a1: 'group'});
						});
					});
				});
			} else {
				async.parallel({
					user: callback => User.findById(req.user._id).populate('friends').exec(callback),
					groups: callback => Group.find({users: req.user._id}).populate('users').exec(callback),
					posts: callback => NewPosts.findOne({user: req.user._id}, {posts: {$slice: 20}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}, populate: {path: 'group', model: 'Group'}}).exec(callback)
				}, (err, results) => {
					if(err) return next(err);
					res.render('group_list', {user: results.user, groups: results.groups, posts: results.posts.posts, errors: errors.array(), a1: 'group_list'});
				});
			}
		} else {
			post.save(err => {
				if(err) return next(err);
				Group.findById(req.body.group).exec((err, group) => {
					if(err) return next(err);
					group.posts.unshift(post._id);
					Group.findByIdAndUpdate(group._id, {posts: group.posts}, (err, something) => {
						if(err) return next(err);
					});
					group.users.forEach(function(user) {
						if(user.toString() === req.user._id.toString()) return;
						NewPosts.findOne({user: user}).exec((err, result) => {
							if(err) return next(err);
							result.posts.unshift(post._id);
							result.new_posts.unshift(post._id);
							NewPosts.findByIdAndUpdate(result._id, {posts: result.posts, new_posts: result.new_posts}, (err, something) => {
								if(err) return next(err);
							});
						});
					});
				});
				NewPosts.findOne({user: req.user._id}).exec((err, result) => {
					if(err) return next(err);
					result.posts.unshift(post._id);
					NewPosts.findByIdAndUpdate(result._id, {posts: result.posts}, (err, something) => {
						if(err) return next(err);
						res.redirect('back');
					});
				});
			});
		}
	}
];