const router = require('express').Router();

const userController = require('../controllers/userController');
const requireUser = require('../middlewares/requireUser');



router.post('/follow',requireUser,userController.followOrUnfollowUserController);
router.get('/getFeedData',requireUser,userController.getFeedDataController);
router.get('/myPost',requireUser,userController.getMyPostController);
router.get('/userPost',requireUser,userController.getUserPostController);
router.delete('/deleteAccount',requireUser,userController.deleteMyProfile);
router.get('/getMyInfo',requireUser,userController.getMyInfoController);

router.put('/',requireUser,userController.updateProfileController);
router.post('/getUserProfile',requireUser,userController.getUserProfileController)


module.exports = router;