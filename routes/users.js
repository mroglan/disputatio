const express = require('express');
const router = express.Router();
const {ensureAuthenticated, ensureNotAuthenticated, ensureAdmin} = require('../config/auth');

const multer = require('multer');
const DIR = './public/images';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, DIR);
	}, filename: (req, file, cb) => {
		const fileName = file.originalname.toLowerCase().split(' ').join('-');
		cb(null, fileName);
	}
});

var upload = multer({
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

//Controllers
const UserController = require('../controllers/userController');


router.get('/logout', ensureAuthenticated, UserController.logout);

router.get('/login', ensureNotAuthenticated, UserController.login_get);

router.post('/login', UserController.login_post);

router.post('/register', UserController.register_post);

router.get('/profile', ensureAuthenticated, UserController.profile_get);

router.post('/profile', UserController.profile_post);

router.get('/profile/followers', ensureAuthenticated, UserController.followers_get);

router.get('/profile/friends', ensureAuthenticated, UserController.friends_get);

router.post('/profile/picture', upload.single('image'), UserController.change_picture);

router.post('/profile/friends/search', UserController.friend_search_1);

router.get('/profile/give_friends', ensureAuthenticated, UserController.give_friends);

router.get('/profile/find/:tag', ensureAuthenticated, UserController.find_user);

router.get('/profile/not_found', ensureAuthenticated, (req, res) => res.send('Profile not found!'));

router.get('/profile/invites', ensureAuthenticated, UserController.get_invites);

router.get('/profile/groups', ensureAuthenticated, UserController.all_groups);

router.get('/:id/profile', ensureAuthenticated, UserController.other_profile_get);

router.get('/:id/followers', ensureAuthenticated, UserController.other_followers_get);

router.get('/:id/friends', ensureAuthenticated, UserController.other_friends_get);

router.post('/:id/add_friend', ensureAuthenticated, UserController.add_friend);

router.post('/:id/remove_friend', ensureAuthenticated, UserController.remove_friend);

router.post('/:id/profile/friendinfo', ensureAuthenticated, UserController.post_friendinfo);

module.exports = router;