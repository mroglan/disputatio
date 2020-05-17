const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const InviteSchema = new Schema({
	sender: {type: Schema.Types.ObjectId, ref: 'User', required: true},
	receiver: [{type: Schema.Types.ObjectId, ref: 'User', required: true}],
	group: {type: Schema.Types.ObjectId, ref: 'Group', required: true},
	message: {type: String},
	date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Invite', InviteSchema);