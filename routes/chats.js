const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

//Controllers
const ConvoController = require('../controllers/convoController');
const NotificationController = require('../controllers/notificationController');

router.post('/side_notifications/convos', NotificationController.side_convos);

router.post('/conversations/notifications', NotificationController.convo_list);

router.get('/conversations', ensureAuthenticated, ConvoController.conversations_get);

router.post('/conversations/new', ConvoController.conversations_create);

router.post('/conversations/delete', ConvoController.conversations_delete);

router.get('/conversations/:id', ensureAuthenticated, ConvoController.convo_get);

router.post('/conversations/:id', ConvoController.convo_post);



module.exports = router;