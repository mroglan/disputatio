const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');


router.get('/', ensureNotAuthenticated, (req, res, next) => {
	res.redirect('/disputatio/home');
});

router.get('/disputatio/home', ensureNotAuthenticated, (req, res, next) => res.render('welcome', {a1: 'welcome'}));

module.exports = router;