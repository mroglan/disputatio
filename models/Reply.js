const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const ReplySchema = new Schema({
	writer: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	message: {type: String},
	replyTo: {type: Schema.Types.ObjectId, ref: 'Post'},
	date: {type: Date, default: Date.now()},
	likes: [{type: Schema.Types.ObjectId, ref: 'User'}],
	dislikes: [{type: Schema.Types.ObjectId, ref: 'User'}],
	replies: [{type: Schema.Types.ObjectId, ref: 'Reply'}]
});

ReplySchema.virtual('date_format').get(function() {
	return moment(this.date).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('Reply', ReplySchema);