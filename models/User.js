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
	status: {type: String},
	bio: {type: String},
});

const User = mongoose.model('User', UserSchema);

module.exports = User;