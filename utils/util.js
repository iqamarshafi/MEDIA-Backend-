var ta = require('time-ago')
const mapPostOutput = (post, userId)=>{
    return {
        _id : post._id,
        caption: post.caption,
        image : post.image,
        owner: {
            _id: post.owner?._id,
            name: post.owner?.name,  
            avatar: post.owner?.avatar
        },
        likesCount: Array.isArray(post.likes) ? post.likes.length : 0,
         isLiked: Array.isArray(post.likes) ? post.likes.includes(userId) : false,
         timeAgo : ta.ago(post.createdAt)

    }
}
module.exports = {
    mapPostOutput
}