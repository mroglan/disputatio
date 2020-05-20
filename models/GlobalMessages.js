const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const GlobalMessagesSchema = new Schema({
	user: {type: Schema.Types.ObjectId, ref: 'User'},
	messages: [{type: Schema.Types.ObjectId, ref: 'Message'}]
});

module.exports = mongoose.model('GlobalMessages', GlobalMessagesSchema);