const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const GroupSchema = new Schema({
	start_user: {type: Schema.Types.ObjectId, ref: 'User'},
	users: [{type: Schema.Types.ObjectId, ref: 'User'}],
	name: {type: String, required: true},
	description: {type: String},
	status: {type: String},
	picture: {type: String},
	date: {type: Date, default: Date.now()},
	posts: [{type: Schema.Types.ObjectId, ref: 'Post'}],
	code: {type: String, default: 'none'}
});

GroupSchema.virtual('date_format').get(function() {
	return moment(this.date).format('MMMM Do, YYYY');
});

GroupSchema.virtual('url').get(function() {
	return `/chats/groups/${this._id}`;
});

module.exports = mongoose.model('Group', GroupSchema);