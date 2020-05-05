const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

//Controllers
const ConvoController = require('../controllers/convoController');

router.get('/conversations', ensureAuthenticated, ConvoController.conversations_get);

router.get('/conversations/:id', ensureAuthenticated, ConvoController.convo_get);

router.post('/conversations/:id', ConvoController.convo_post);

router.post('/conversations/new', ConvoController.conversations_create);


module.exports = router;