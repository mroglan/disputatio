const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	password: {
		type: String, 
		required: true
	}, 
	tag: {
		type: String,
		required: true
	},
	admin: {
		type: Boolean,
		required: true
	},
	date: {
		type: Date,
		default: Date.now()
	},
	picture: {
		type: String
	},
	friends: [{type: Schema.Types.ObjectId}],
	followers: [{type: Schema.Types.ObjectId}],
	status: {type: String},
	bio: {type: String},
	new_message_count: {type: Number, default: 0}
});

const User = mongoose.model('User', UserSchema);

module.exports = User;