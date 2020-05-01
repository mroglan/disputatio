const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

//Controllers
const DisputatioController = require('../controllers/disputatioController');

router.get('/dashboard', ensureAuthenticated, DisputatioController.dashboard_get);

module.exports = router;