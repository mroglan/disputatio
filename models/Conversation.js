const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const ConvoSchema = new Schema({
	start_user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	name: {type: String, required: true},
	users: [{type: Schema.Types.ObjectId, ref: 'User'}],
	messages: [{type: Schema.Types.ObjectId, ref: 'Message'}],
	new_messages: [{messages: [{type: Schema.Types.ObjectId, ref: 'Message'}]}],
	date: {type: Date, default: Date.now()},
	recent_msg: {type: Date}
});

ConvoSchema.virtual('url').get(function() {
	return `/chats/conversations/${this._id}`;
});

ConvoSchema.virtual('date_format').get(function() {
	return moment(this.date).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('Convo', ConvoSchema);
	