const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment')

const MessageSchema = new Schema({
	writer: {type: Schema.Types.ObjectId, ref: 'User'},
	convo: {type: Schema.Types.ObjectId, ref: 'Convo'},
	message: {type: String},
	files: [{fileType: {type: String}, location: {type: String}}],
	date: {type: Date, default: Date.now()},
	special: {type: Boolean, default: false}
});

MessageSchema.virtual('date_format').get(function() {
	return moment(this.date).format('MMMM Do, YYYY');
});

module.exports = mongoose.model('Message', MessageSchema);