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

router.post('/conversations/sidebar', ensureAuthenticated, ConvoController.check_sidebar);

router.get('/conversations/:id', ensureAuthenticated, ConvoController.convo_get);

router.post('/conversations/:id', ConvoController.convo_post);

router.post('/conversations/:id/add_members', ConvoController.convo_add_members);

router.post('/conversations/:id/remove_members', ConvoController.convo_remove_members);

router.post('/conversations/:id/get_messages', ensureAuthenticated, ConvoController.get_new_messages);

module.exports = router;