const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

//Controllers
const DisputatioController = require('../controllers/disputatioController');

router.get('/', (req, res) => res.redirect('/disputatio/home'));

router.get('/dashboard', ensureAuthenticated, DisputatioController.dashboard_get);

router.get('/about', (req, res) => res.render('about', {a1: 'about'}));

router.get('/games', (req, res) => res.render('games', {a1: 'games'}));

module.exports = router;