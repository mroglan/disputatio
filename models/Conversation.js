const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ConvoSchema = new Schema({
	start_user: {type: Schema.Types.ObjectId, required: true},
	name: {type: String, required: true},
	users: [{type: Schema.Types.ObjectId}],
	messages: [{type: Schema.Types.ObjectId}],
	new_messages: [{messages: [{type: Schema.Types.ObjectId}]}],
	date: {type: Date, default: Date.now()},
	recent_msg: {type: Date}
});

module.exports = mongoose.model('Convo', ConvoSchema);
	