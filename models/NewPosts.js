const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const NewPostsSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	posts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
	new_posts: [{type: Schema.Types.ObjectId, ref: 'Post'}]
});

module.exports = mongoose.model('NewPosts', NewPostsSchema);