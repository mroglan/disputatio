const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
	contact_user: {type: Schema.Types.ObjectId, required: true},
	reserved: {type: String, required: true},
	first_name: {type: String, required: true},
	last_name: {type: String},
	email: {type: String},
	address: {type: String},
	job: {type: String},
	phones: [{name: String, number: String}],
	other: [{name: String, details: String}],
	notes: {type: String}
});

module.exports = mongoose.model('Contact', ContactSchema);