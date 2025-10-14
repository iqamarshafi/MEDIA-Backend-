const Post = require('../models/Post');
const User = require('../models/UserModel');
const { all } = require('../routers/userRouter');
const { error, success } = require('../utils/responseWrapper');
const { mapPostOutput } = require('../utils/util.js');
const cloudinary = require('cloudinary').v2;

const followOrUnfollowUserController = async (req, res)=>{
    try {
        const {userIdToFollow} = req.body;
    const curUserId = req.id;

    const curUser = await User.findById(curUserId);
    const userToFollow = await User.findById(userIdToFollow);

    if(curUserId == userIdToFollow){
        return res.send(error(409,'cannot follow yourself'));
    }

    if(!userToFollow){
        return res.send(error(404,'user to follow not found'))
    }
    if(curUser.followings.includes(userIdToFollow)){
        const followingIndex = curUser.followings.indexOf(userIdToFollow);
        curUser.followings.splice(followingIndex,1);
        await curUser.save();

        const followerIndex = userToFollow.followers.indexOf(curUserId);
        userToFollow.followers.splice(followerIndex,1);
        await userToFollow.save();

        return res.send(success(200,{user: userToFollow}));
    }else{
        curUser.followings.push(userIdToFollow);
        await curUser.save();

        userToFollow.followers.push(curUserId);
        await userToFollow.save();

        return res.send(success(200,{user: userToFollow}));
    }
    } catch (err) {
        return res.send(error(500,err.message));
    }
}

const getFeedDataController = async (req, res) => {
    try {
        const curUserId = req.id;
        const curUser = await User.findById(curUserId).populate('followings');   

        // Feed posts from followings
        const fullPosts = await Post.find({
            owner: { $in: curUser.followings.map(f => f._id) }
        }).populate('owner');
        const posts = fullPosts.map(item => mapPostOutput(item, req.id)).reverse();

        // IDs to exclude
        const followingsId = curUser.followings.map(item => item._id.toString());
        followingsId.push(curUserId.toString());

        // Suggestion users
        const suggestionUsers = await User.find({
            _id: { $nin: followingsId }
        });
         
        // Posts from suggestion users
        const suggestionIds = suggestionUsers.map(u => u._id);
        
        const suggestionPosts = await Post.find({
            'owner': { '$in': suggestionIds }
        }).populate('owner');

        console.log('suggestion post: ',suggestionPosts)


        const suggestions_post = suggestionPosts.map(item => mapPostOutput(item, req.id)).reverse();

        return res.send(success(200, {
            ...curUser._doc,
            suggestions_post,
            posts,
            suggestionUsers
        }));
    } catch (err) {
        return res.send(error(500, err.message));    
    }
};


const getMyPostController = async (req, res)=>{
    try {
        const curUserId = req.id;

        const allPost = await Post.find({
            owner: curUserId
        }).populate('likes');

        return res.send(success(200,{allPost}));
    } catch (err) {
        return res.send(error(500,err.message));

    }

}

const getUserPostController = async (req, res)=>{
    try {
        const {userId} = req.body;
        const user = await User.findById(userId);

        if(user){
            const allPost = await Post.find({
                owner: userId
            }).populate('likes');

            return res.send(success(200,{allPost}));
        }else{
            return res.send(error(404,'User not found'));
        }
    } catch (err) {
        return res.send(error(500,err.message));
    }
}

const deleteMyProfile = async (req ,res)=>{
    try {
    const userId = req.id;
    const curUser = await User.findById(userId);

    // deleting all posts 
    await Post.deleteMany({owner: userId});

    // remove mySelf form followers 
    for(const followerId of curUser.followers){
        const follower = await User.findById(followerId);
        const index = follower?.followings?.indexOf(userId);
        follower?.followings?.splice(index,1);
        await follower?.save();
    }

    // removing myself from followings account
    for(const followingId of curUser.followings){
        const following = await User.findById(followingId);
        const index = following?.followers?.indexOf(userId);
        following?.followers?.splice(index,1);
        await following?.save();
    }

    // remove myself from all likes
    const allPost = await Post.find();
    for(const post of allPost){
        const index = post?.likes?.indexOf(userId);
        post?.likes?.splice(index,1);
        await post?.save();
    }
    res.clearCookie('jwt',{
        httpOnly: true,
        secure: true
    })

    await curUser.deleteOne();
    return res.send(success(200,'you are account has been deleted successfully'));

    } catch (err) {
        return res.send(error(500,err.message))
    }
}

const getMyInfoController = async (req,res) =>{
    try {
        const user = await User.findById(req.id);
        
        return res.send(success(200,{user}))

    } catch (err) {
        return res.send(error(500,err.message))
    }    
}

const updateProfileController = async (req,res)=>{

    try{
        const {name,bio,img} = req.body;
        const user = await User.findById(req.id);
        if(name){
            user.name = name;
        }
        if(bio){
            user.bio = bio;
        }
        if(img){
            console.log('img; ', img)
            const uploadResult = await cloudinary.uploader.upload(
           img, {
              folder: 'profile_image'
           }
            )
            user.avatar= {
                url: uploadResult.secure_url,
                publicId : uploadResult.public_id
            }

        }

        await user.save();
        res.send(success(200,{user}))
    }catch (err) {
        return res.send(error(500,err.message))
    }    
}

const getUserProfileController = async (req,res)=>{
    try {
            const userId = req.body.userId;
            const user = await User.findById(userId).populate({
                path: 'posts',
                populate: {
                    path: 'owner'
                }
            });
             if (!user) {
                return res.status(404).json(error(404, 'User not found'));
                 }
            const fullPost = user.posts;
            const posts = fullPost.map(item => mapPostOutput(item,req.id)).reverse();
            
           
            return res.send(success(200,{...user._doc,posts}))
    } catch (err) {
        return res.send(error(500,err.message))
    }
}
module.exports = {
    followOrUnfollowUserController,getFeedDataController,getMyPostController,
    getUserPostController,deleteMyProfile,getMyInfoController, updateProfileController,
    getUserProfileController
}