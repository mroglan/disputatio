const async = require('async');

//Models
const Group = require('../models/Group');
const Post = require('../models/Post');
const User = require('../models/User');

const {check, validationResult} = require('express-validator');
const {sanitizeBody} = require('express-validator/filter');

exports.groups_get = function(req, res, next) {
	res.send('groups page');
};