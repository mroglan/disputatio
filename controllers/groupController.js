const async = require('async');

//Models
const Group = require('../models/Group');
const Post = require('../models/Post');
const Reply = require('../models/Reply');
const User = require('../models/User');
const NewPosts = require('../models/NewPosts');
const Invite = require('../models/Invite');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.groups_get = function(req, res, next) {
	async.parallel({
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		groups: callback => Group.find({users: req.user._id}).populate('users').exec(callback),
		posts: callback => NewPosts.findOne({user: req.user._id}, {posts: {$slice: 10}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}})
		.populate({path: 'posts', model: 'Post', populate: {path: 'group', model: 'Group'}})
		.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'writer', model: 'User'}}})
		.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'group', model: 'Group'}}}).exec(callback),
		invites: callback => Invite.find({receiver: req.user._id}).populate('group').populate('sender').exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		console.log(results.posts);
		res.render('group_list', {user: results.user, groups: results.groups, posts: results.posts.posts, invites: results.invites, a1: 'group_list'});
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
			special: 'true',
			files: [],
			likes: [],
			dislikes: [],
			shares: [],
			replies: []
		});
		post.save(err => {
			if(err) return next(err);
			NewPosts.findOne({user: req.user._id}).exec((err, result) => {
				result.posts.unshift(post._id);
				NewPosts.findByIdAndUpdate(result._id, {posts: result.posts}, (err, something) => {
					if(err) return next(err);
				});
			});
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
		selected: callback => Group.findOne({_id: req.params.id}, {posts: {$slice: 10}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}})
		.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'writer', model: 'User'}}})
		.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'group', model: 'Group'}}}).exec(callback),
		user: callback => User.findById(req.user._id).populate('friends').exec(callback),
		invites: callback => Invite.find({receiver: req.user._id}).populate('group').populate('sender').exec(callback)
	}, (err, results) => {
		if(err) return next(err);
		NewPosts.findOne({user: req.user._id}).populate('new_posts').exec((err, newPost) => {
			if(err) return next(err);
			let newPostArray = newPost.new_posts.filter(post => post.group.toString() != req.params.id);
			NewPosts.findByIdAndUpdate(newPost._id, {new_posts: newPostArray}, (err, something) => {
				if(err) return next(err);
				res.render('group', {user: results.user, selected: results.selected, posts: results.selected.posts, groups: results.groups, a1: 'group'});
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
	check('title', 'Title is too long').trim().isLength({max: 40}),
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
					selected: callback => Group.findOne({_id: req.body.group}, {posts: {$slice: 20}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}})
					.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'writer', model: 'User'}}})
					.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'group', model: 'Group'}}}).exec(callback),
					user: callback => User.findById(req.user._id).populate('friends').exec(callback),
					invites: callback => Invite.find({receiver: req.user._id}).populate('group').populate('sender').exec(callback)
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
				//console.log('THERE ARE ERRORS');
				async.parallel({
					user: callback => User.findById(req.user._id).populate('friends').exec(callback),
					groups: callback => Group.find({users: req.user._id}).populate('users').exec(callback),
					posts: callback => NewPosts.findOne({user: req.user._id}, {posts: {$slice: 10}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}})
					.populate({path: 'posts', model: 'Post', populate: {path: 'group', model: 'Group'}})
					.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'writer', model: 'User'}}})
					.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'group', model: 'Group'}}}).exec(callback),
					invites: callback => Invite.find({receiver: req.user._id}).populate('group').populate('sender').exec(callback)
				}, (err, results) => {
					if(err) return next(err);
					res.render('group_list', {user: results.user, groups: results.groups, posts: results.posts.posts, invites: results.invites, errors: errors.array(), a1: 'group_list'});
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

exports.add_posts = function(req, res, next) {
	let count = parseInt(req.body.count);
	Group.findOne({_id: req.params.id}, {posts: {$slice: [count, 10]}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}})
	.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'writer', model: 'User'}}})
	.populate({path: 'posts', model: 'Post', populate: {path: 'original', model: 'Post', populate: {path: 'group', model: 'Group'}}}).exec((err, group) => {
		if(err) return next(err);
		console.log(group.posts);
		res.send(group.posts);
	});
};

exports.add_general_posts = function(req, res, next) {
	let count = parseInt(req.body.count);
	NewPosts.findOne({user: req.user._id}, {posts: {$slice: [count, 10]}}).populate({path: 'posts', model: 'Post', populate: {path: 'writer', model: 'User'}})
	.populate({path: 'posts', model: 'Post', populate: {path: 'group', model: 'Group'}}).exec((err, result) => {
		if(err) return next(err);
		res.send(result.posts);
	});
};

exports.delete_groups = function(req, res, next) {
	if(!(req.body.delete_group instanceof Array)) {
		if(typeof req.body.delete_group === 'undefined') req.body.delete_group = [];
		else req.body.delete_group = Array(req.body.delete_group);
	}
	Group.find({users: req.user._id}).exec((err, groups) => {
		if(err) return next(err);
		//let remainingGroups = groups.filter(el => !(req.body.delete_group.includes(el._id.toString())));
		groups = groups.filter(el => req.body.delete_group.includes(el._id.toString()));
		//console.log(groups);
		let groupIdArray = [];
		groupIdArray = groups.map(el => el._id.toString());
		
		groups.forEach(function(group) {
			Group.findById(group._id).exec((err, foundGroup) => {
				if(err) return next(err);
				//console.log('updating...');
				foundGroup.users = foundGroup.users.filter(el => el.toString() != req.user._id.toString());
				//console.log(foundGroup.users);
				if(foundGroup.users.length > 0) {
					Group.findByIdAndUpdate(foundGroup._id, {users: foundGroup.users}, (err, something) => {
						if(err) return next(err);
					});
				} else {
					Group.findByIdAndRemove(foundGroup._id, function deleteGroup(err) {
						if(err) return next(err);
					});
				}
			});
		});
		
		NewPosts.findOne({user: req.user._id}, {posts: {$slice: 200}, new_posts: {$slice: 200}}).populate('posts').populate('new_posts').exec((err, result) => {
			if(err) return next(err);
			console.log(`Result: ${result} end...`);
			console.log(`groupIdArray: ${groupIdArray}`);
			result.posts = result.posts.filter(el => !(groupIdArray.includes(el.group.toString())));
			result.new_posts = result.new_posts.filter(el => !(groupIdArray.includes(el.group.toString())));
			NewPosts.findByIdAndUpdate(result._id, {posts: result.posts, new_posts: result.new_posts}, (err, something) => {
				if(err) return next(err);
				res.redirect('/chats/groups');
			});
		});
	});
};

exports.find_recommended_groups = function(req, res, next) {
	Group.find({}).exec((err, groups) => {
		if(err) return next(err);
		//console.log('Groups below');
		//console.log(groups);
		//console.log('-------');
		let recGroupArray = [];
		groups.forEach(function(group) {
			req.user.friends.forEach(function(friend) {
				if(!(group.users.includes(req.user._id)) && group.users.includes(friend) && !(recGroupArray.includes(group))) {
					recGroupArray.push(group);
				}
			});
		});
		res.send(recGroupArray.slice(0, 20));
	});
};

exports.group_members = function(req, res, next) {
	Group.findById(req.params.id).populate('users').exec((err, group) => {
		if(err) return next(err);
		res.render('group_members', {user: req.user, group: group, a1: 'group_members'});
	});
};

exports.join_group = function(req, res, next) {
	Group.findById(req.body.join_group).exec((err, group) => {
		if(err) return next(err);
		if(group.users.includes(req.user._id)) {
			res.send('Already in this group!');
			return;
		}
		group.users.push(req.user._id);
		Group.findByIdAndUpdate(group._id, {users: group.users}, (err, something) => {
			if(err) return next(err);
			res.send('Successful!');
		});
	});
};

exports.invite_members = function(req, res, next) {
	if(!(req.body.invite_user instanceof Array)) {
		if(typeof req.body.invite_user === 'undefined') req.body.invite_user = [];
		else req.body.invite_user = Array(req.body.invite_user);
	}
	if(req.body.invite_user.length === 0) {
		res.redirect(`/chats/groups/${req.body.groupId}`);
		return;
	}
	let invite = new Invite({
		sender: req.user._id,
		receiver: req.body.invite_user,
		group: req.body.groupId,
		message: req.body.invite_message
	});
	invite.save(err => {
		if(err) return next(err);
		res.redirect(`/chats/groups/${req.body.groupId}`);
	});
};

exports.accept_invite = function(req, res, next) {
	console.log(req.body);
	removeUserFromInvite(req, res, next);
	Group.findById(req.body.group).exec((err, group) => {
		if(err) return next(err);
		group.users.push(req.user._id);
		Group.findByIdAndUpdate(group._id, {users: group.users}, (err, something) => {
			if(err) return next(err);
			res.send('Group updated!');
		});
	});
}

function removeUserFromInvite(req, res, next) {
	Invite.findById(req.body.inviteId).exec((err, invite) => {
		if(err) return next(err);
		invite.receiver.splice(invite.receiver.indexOf(req.user._id), 1);
		if(invite.receiver.length === 0) {
			Invite.findByIdAndRemove(invite._id, function removeInvite(err) {
				if(err) return next(err);
			});
		} else {
			Invite.findByIdAndUpdate(invite._id, {receiver: invite.receiver}, (err, something) => {
				if(err) return next(err);
			});
		}
	});
}

exports.decline_invite = function(req, res, next) {
	Invite.findById(req.body.inviteId).exec((err, invite) => {
		if(err) return next(err);
		invite.receiver.splice(invite.receiver.indexOf(req.user._id), 1);
		if(invite.receiver.length === 0) {
			Invite.findByIdAndRemove(invite._id, function removeInvite(err) {
				if(err) return next(err);
				res.send('Invite deleted');
			});
		} else {
			Invite.findByIdAndUpdate(invite._id, {receiver: invite.receiver}, (err, something) => {
				if(err) return next(err);
				res.send('Invite updated');
			});
		}
	});
};

exports.post_get = function(req, res, next) {
	Group.findById(req.params.group).exec((err, group) => {
		if(err) return next(err);
		if(group.status === 'closed' && !(group.users.includes(req.user._id))) {
			res.redirect('/chats/groups');
			return;
		}
		Post.findById(req.params.post).populate('writer').populate('replies').exec((err, post) => {
			if(err) return next(err);
			res.render('post', {user: req.user, post: post, a1: 'post'});
		});
	});
};

exports.like_post = function(req, res, next) {
	Post.findById(req.body.postId).exec((err, post) => {
		if(err) return next(err);
		if(post.dislikes.includes(req.user._id)) {
			post.dislikes.splice(post.dislikes.indexOf(req.user._id), 1);
		}
		if(post.likes.includes(req.user._id)) {
			post.likes.splice(post.likes.indexOf(req.user._id), 1);
		} else {
			post.likes.push(req.user._id);
		}
		Post.findByIdAndUpdate(post._id, {dislikes: post.dislikes, likes: post.likes}, (err, something) => {
			if(err) return next(err);
			res.send(post.likes);
		});
	});
};

exports.dislike_post = function(req, res, next) {
	Post.findById(req.body.postId).exec((err, post) => {
		if(err) return next(err);
		if(post.likes.includes(req.user._id)) {
			post.likes.splice(post.likes.indexOf(req.user._id), 1);
		}
		if(post.dislikes.includes(req.user._id)) {
			post.dislikes.splice(post.dislikes.indexOf(req.user._id), 1);
		} else {
			post.dislikes.push(req.user._id);
		}
		Post.findByIdAndUpdate(post._id, {dislikes: post.dislikes, likes: post.likes}, (err, something) => {
			if(err) return next(err);
			res.send(post.dislikes);
		});
	});
};

exports.post_replies = function(req, res, next) {
	Post.findById(req.params.id).populate({path: 'replies', model: 'Reply', populate: {path: 'writer', model: 'User'}}).exec((err, post) => {
		if(err) return next(err);
		post.replies.sort((a, b) => b.date - a.date);
		res.send(post.replies.splice(0, 10));
	});
};

exports.post_reply = function(req, res, next) {
	let files = req.body.filePaths.map((el, i) => {return {path: el, name: req.body.fileNames[i]}});
	let reply = new Reply({
		writer: req.user._id,
		message: req.body.message,
		replyTo: req.params.id,
		files: files,
		images: req.body.images,
		likes: [],
		dislikes: [],
		replies: []
	});
	reply.save(err => {
		if(err) return next(err);
		Post.findByIdAndUpdate(req.params.id, {$push: {replies: reply._id}}, (err, something) => {
			if(err) return next(err);
			res.send(reply);
		});
	});
};

exports.like_reply = function(req, res, next) {
	Reply.findById(req.body.replyId).exec((err, reply) => {
		if(err) return next(err);
		if(reply.dislikes.includes(req.user._id)) {
			reply.dislikes.splice(reply.dislikes.indexOf(req.user._id), 1);
		}
		if(reply.likes.includes(req.user._id)) {
			reply.likes.splice(reply.likes.indexOf(req.user._id), 1);
		} else {
			reply.likes.push(req.user._id);
		}
		Reply.findByIdAndUpdate(reply._id, {dislikes: reply.dislikes, likes: reply.likes}, (err, something) => {
			if(err) return next(err);
			res.send(reply.likes);
		});
	});
};

exports.dislike_reply = function(req, res, next) {
	Reply.findById(req.body.replyId).exec((err, reply) => {
		if(err) return next(err);
		if(reply.likes.includes(req.user._id)) {
			reply.likes.splice(reply.likes.indexOf(req.user._id), 1);
		}
		if(reply.dislikes.includes(req.user._id)) {
			reply.dislikes.splice(reply.dislikes.indexOf(req.user._id), 1);
		} else {
			reply.dislikes.push(req.user._id);
		}
		Reply.findByIdAndUpdate(reply._id, {dislikes: reply.dislikes, likes: reply.likes}, (err, something) => {
			if(err) return next(err);
			res.send(reply.dislikes);
		});
	});
};

exports.reply_reply = function(req, res, next) {
	let files = req.body.filePaths.map((el, i) => {return {path: el, name: req.body.fileNames[i]}});
	let reply = new Reply({
		writer: req.user._id,
		message: req.body.message,
		replyTo: req.params.id,
		files: files,
		images: req.body.images,
		likes: [],
		dislikes: [],
		replies: []
	});
	reply.save(err => {
		if(err) return next(err);
		Reply.findByIdAndUpdate(req.params.id, {$push: {replies: reply._id}}, (err, something) => {
			if(err) return next(err);
			res.send(reply);
		});
	});
};

exports.reply_replies = function(req, res, next) {
	Reply.findById(req.params.id).populate({path: 'replies', model: 'Reply', populate: {path: 'writer', model: 'User'}}).exec((err, reply) => {
		if(err) return next(err);
		reply.replies.sort((a, b) => b.date - a.date);
		res.send(reply.replies);
	});
};

exports.share_post = function(req, res, next) {
	(new Promise((resolve, reject) => {
		NewPosts.findOne({user: req.user._id}).exec((err, newposts) => {
			if(err) return next(err);
			resolve(newposts);
		});
	})).then(newposts => {
		//console.log(newposts);
		req.body.groups.forEach(function(groupId) {
			Group.findById(groupId).populate('users').exec((err, group) => {
				if(err) return next(err);
				let post = new Post({
					writer: req.user._id,
					group: group._id,
					message: req.body.message,
					likes: [],
					dislikes: [],
					shares: [],
					original: req.body.sharePost,
					replies: []
				});
				post.save(err => {
					if(err) return next(err);
					group.posts.unshift(post._id);
					group.users.forEach(function(user) {
						if(user._id.toString() != req.user._id.toString()) {
							NewPosts.findOne({user: user._id}).exec((err, result) => {
								if(err) return next(err);
								result.posts.unshift(post._id);
								result.new_posts.unshift(post._id);
								NewPosts.findOneAndUpdate({user: user._id}, {posts: result.posts, new_posts: result.new_posts}, (err, something) => {
									if(err) return next(err);
								});
							});
						}
					});
					Group.findByIdAndUpdate(group._id, {posts: group.posts}, (err, something) => {
						if(err) return next(err);
					});
				});
			});
		});
		Post.findOneAndUpdate({_id: req.body.sharePost}, {$push: {shares: req.user._id}}, (err, something) => {
			if(err) return next(err);
		});
		let writerPost = new Post({
			writer: req.user._id,
			special: 'share',
			message: 'You shared a post!'
		});
		writerPost.save(err => {
			if(err) return next(err);
			newposts.posts.unshift(writerPost._id);
			NewPosts.findOneAndUpdate({_id: newposts._id}, {posts: newposts.posts}, (err, something) => {
				if(err) return next(err);
				res.send('Done!');
			});
		});
	}).catch(e => console.log(e))
};