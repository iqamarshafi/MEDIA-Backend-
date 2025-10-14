const Post = require("../models/Post");
const { success, error } = require("../utils/responseWrapper");
const User = require("../models/UserModel");
const { mapPostOutput } = require("../utils/util.js");
const cloudinary = require('cloudinary').v2;

const getAllPostsController = async (req, res)=>{
    console.log(`req.id = ${req.id}`)
    res.send(success(200,'these are all posts'));
}

const createPostController = async (req,res)=>{
    try {
    const {caption,postImg} = req.body;
    if(!caption || !postImg){
        return res.send(error(400,'caption and postIMage are required'));
    }
    
        const cloudImage = await cloudinary.uploader.upload(
            postImg,
            {
                folder: 'post_image'
            }
        )
    
    const owner = req.id;

    const user = await User.findById(owner); 
    
    const post = await Post.create({
        owner,
        caption,
        image:{
        publicId: cloudImage.public_id,
        url: cloudImage.secure_url 
    }

    })

    user.posts.push(post._id);
    await user.save();

    return res.send(success(201,post));

    } catch (err) {
       return res.send(error(500,err.message))
    }
}

const likeAndUnlikeController = async (req,res)=>{
        try {
            const {postId} = req.body;
            const post = await Post.findById(postId).populate('owner');
            const curUserId = req.id;
            console.log('currentuser: ',curUserId)
                if(!post){
                    return res.send(error(404,'post not found'));
                }
                if(post.likes.includes(curUserId)){
                    const index = post.likes.indexOf(curUserId);
                    post.likes.splice(index,1);
                }else{
                    post.likes.push(curUserId);               
                }
                await post.save();
                return res.send(success(200,{post: mapPostOutput(post,req.id)}))
        } catch (err) {
           return res.send(error(500,err.message)); 
        }
}

const updatePostController = async (req, res)=>{
    try {
       const {postId,caption} = req.body;
       const curUserId = req.id;
       
       const post = await Post.findById(postId);

       if(!post){
        return res.send(error(404,'post not found'));
       }
       
       if(post.owner.toString() !== curUserId){
        return res.send(error(403,'only owner can update'));
       }

       if(caption){
        post.caption = caption
       }

       await post.save();
       return res.send(success(200,{post}));        

    } catch (err) {
        return res.send(error(500,err.message))
    }
}

const deletePostController = async (req, res)=>{
    try {
    const {postId} = req.body;
    const curUserId = req.id;      
    const curUser = await User.findById(curUserId);
    
    const post = await Post.findById(postId);

       if(!post){
        return res.send(error(404,'post not found'));
       }
       
       if(post.owner.toString() !== curUserId){
        return res.send(error(403,'only owner can delete the update'));
       }

       const index = curUser.posts.indexOf(postId);
       curUser.posts.splice(index,1);
        
       await curUser.save();
       await post.deleteOne();

       return res.send(success(200,'post deleted successfully'));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}



module.exports = {getAllPostsController, createPostController, likeAndUnlikeController, updatePostController,
    deletePostController
}