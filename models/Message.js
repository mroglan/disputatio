const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
	writer: {type: Schema.Types.ObjectId},
	convo: {type: Schema.Types.ObjectId},
	message: {type: String},
	files: {fileType: {type: String}, location: {type: String}},
	date: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Message', MessageSchema);