
// Models
const User = require('../models/User');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.dashboard_get = function(req, res, next) {
	res.render('dashboard', {user: req.user, a1: 'dashboard'});
};