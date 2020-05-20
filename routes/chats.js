const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

const multer = require('multer');
const DIR = './public/images';
const DIR2 = './public/files';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, DIR);
	}, filename: (req, file, cb) => {
		const fileName = file.originalname.toLowerCase().split(' ').join('-');
		var resultFileName = fileName.slice(0, fileName.indexOf('.')) + req.user._id.toString() + fileName.slice(fileName.indexOf('.'));
		cb(null, resultFileName);
	}
});

const storage2 = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, DIR2);
	}, filename: (req, file, cb) => {
		const fileName = file.originalname.toLowerCase().split(' ').join('-');
		var resultFileName = fileName.slice(0, fileName.indexOf('.')) + req.user._id.toString() + fileName.slice(fileName.indexOf('.'));
		cb(null, resultFileName);
	}
});

var uploadPic = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if(file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error('Only .png, .jpg and .jpeg allowed!'));
		}
	}
});

var uploadAny = multer({
	storage: storage2
});

//Controllers
const ConvoController = require('../controllers/convoController');
const NotificationController = require('../controllers/notificationController');
const GroupController = require('../controllers/groupController');
const GlobalchatController = require('../controllers/globalchatController');


//Notifications
router.post('/side_notifications/convos', ensureAuthenticated, NotificationController.side_convos);

router.post('/conversations/notifications', NotificationController.convo_list);

router.post('/side_notifications/groups', ensureAuthenticated, NotificationController.side_groups);

router.post('/groups/notifications', NotificationController.group_list);


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

router.post('/groups/new_picture', uploadPic.single('image'), GroupController.upload_picture);

router.post('/groups/new_group', GroupController.groups_create);

router.get('/groups/find_recommended_groups', ensureAuthenticated, GroupController.find_recommended_groups);

router.get('/groups/:id', ensureAuthenticated, GroupController.group_get);

router.get('/groups/:id/members', ensureAuthenticated, GroupController.group_members);

router.get('/groups/:id/replies', ensureAuthenticated, GroupController.post_replies);

router.get('/groups/:id/reply/replies', ensureAuthenticated, GroupController.reply_replies);

router.get('/groups/:id/edit', ensureAuthenticated, GroupController.edit_group);

//router.get('/groups/:group/:post', ensureAuthenticated, GroupController.post_get);

router.post('/groups/new_post/file_upload', uploadAny.single('upFile'), GroupController.post_file);

router.post('/groups/new_post/image_upload', uploadPic.single('image'), GroupController.post_image);

router.post('/groups/new_post', GroupController.new_post);

router.post('/groups/delete_groups', GroupController.delete_groups);

router.post('/groups/join_group', GroupController.join_group);

router.post('/groups/invite_members', GroupController.invite_members);

router.post('/groups/accept_invite', GroupController.accept_invite);

router.post('/groups/decline_invite', GroupController.decline_invite);

router.post('/groups/like_post', GroupController.like_post);

router.post('/groups/dislike_post', GroupController.dislike_post);

router.post('/groups/like_reply', GroupController.like_reply);

router.post('/groups/dislike_reply', GroupController.dislike_reply);

router.post('/groups/share_post', GroupController.share_post);

router.post('/groups/code_entry', GroupController.check_code);

router.post('/groups/:id/post_reply', GroupController.post_reply);

router.post('/groups/:id/reply_reply', GroupController.reply_reply);

router.post('/groups/:id/edit', GroupController.update_group);

router.post('/groups/:id', GroupController.add_posts);

router.post('/groups', GroupController.add_general_posts);


//Global Chat
router.get('/globalchat', ensureAuthenticated, GlobalchatController.get_globalchat);

router.get('/globalchat/get_messages', ensureAuthenticated, GlobalchatController.get_messages);

router.post('/globalchat/new_message', GlobalchatController.new_message);

module.exports = router;