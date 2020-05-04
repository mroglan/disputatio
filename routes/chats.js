const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

//Controllers
const ConvoController = require('../controllers/convoController');

router.get('/conversations', ensureAuthenticated, ConvoController.conversations_get);

module.exports = router;