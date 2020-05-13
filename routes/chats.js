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

router.post('/groups/new_picture', uploadPic.single('image'), GroupController.upload_picture);

router.post('/groups/new_group', GroupController.groups_create);

router.get('/groups/:id', ensureAuthenticated, GroupController.group_get);

router.post('/groups/new_post/file_upload', uploadAny.single('upFile'), GroupController.post_file);

router.post('/groups/new_post/image_upload', uploadPic.single('image'), GroupController.post_image);

router.post('/groups/new_post', GroupController.new_post);

module.exports = router;