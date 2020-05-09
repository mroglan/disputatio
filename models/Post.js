const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

PostSchema = new Schema({
	writer: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	group: {type: Schema.Types.ObjectId, ref: 'Group', required: true},
	date: {type: Date, default: Date.now()},
	message: {type: String},
	title: {type: String},
	special: {type: Boolean, default: false},
	files: [{fileType: {type: String}, location: {type: String}}],
	likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
	dislikes: [{type: Schema.Types.ObjectId, ref: 'User'}],
	shares: [{type: Schema.Types.ObjectId, ref: 'User'}],
	original: {type: Schema.Types.ObjectId, ref: 'Post'},
	replies: [{type: Schema.Types.ObjectId, ref: 'Reply'}],
	//replyTo: {type: Schema.Types.ObjectId, ref: 'Post'}
});

PostSchema.virtual('date_format').get(function() {
	return moment(this.date).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('Post', PostSchema);