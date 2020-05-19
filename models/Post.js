const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

PostSchema = new Schema({
	writer: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	group: {type: Schema.Types.ObjectId, ref: 'Group'},
	date: {type: Date, default: Date.now()},
	message: {type: String},
	title: {type: String},
	special: {type: String, default: 'false'},
	files: [{name: {type: String}, path: {type: String}}],
	images: [{type: String}],
	likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
	dislikes: [{type: Schema.Types.ObjectId, ref: 'User'}],
	shares: [{type: Schema.Types.ObjectId, ref: 'User'}],
	original: {type: Schema.Types.ObjectId, ref: 'Post'},
	replies: [{type: Schema.Types.ObjectId, ref: 'Reply'}],
});

PostSchema.virtual('date_relative').get(function() {
	return moment(this.date).fromNow();
});

PostSchema.virtual('date_format').get(function() {
	return moment(this.date).format("MMM Do YY");
});

module.exports = mongoose.model('Post', PostSchema);