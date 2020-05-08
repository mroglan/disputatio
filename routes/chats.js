const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

//Controllers
const ConvoController = require('../controllers/convoController');
const NotificationController = require('../controllers/notificationController');
const GroupController = require('../controllers/groupController');


//Notifications
router.post('/side_notifications/convos', ensureAuthenticated, NotificationController.side_convos);

router.post('/conversations/notifications', NotificationController.convo_list);


//Conversations

router.get('/conversations', ensureAuthenticated, ConvoController.conversations_get);

router.post('/conversations/new', ConvoController.conversations_create);

router.post('/conversations/delete', ConvoController.conversations_delete);

router.post('/conversations/sidebar', ensureAuthenticated, ConvoController.check_sidebar);

router.get('/conversations/:id', ensureAuthenticated, ConvoController.convo_get);

router.post('/conversations/:id', ConvoController.convo_post);

router.post('/conversations/:id/add_members', ConvoController.convo_add_members);

router.post('/conversations/:id/remove_members', ConvoController.convo_remove_members);

router.post('/conversations/:id/get_messages', ensureAuthenticated, ConvoController.get_new_messages);


//Groups
router.get('/groups', ensureAuthenticated, GroupController.groups_get);

module.exports = router;