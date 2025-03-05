import Comments from '../models/comment.model.js'
import Users from '../models/user.model.js'
import Notifications from '../models/notification.model.js'
import Videos from '../models/video.model.js'

export const getCommentForVideo = async (req, res, next) => {
    let data = await Comments.findAll({
        where: {
            CommentedVideoId: req.params.videoId,
            parentcommentId: null
        },
        order: [['createdAt', 'DESC']],
        attributes: [
            'comment', 'id','CommentorUserId'
        ],
        include: [{
            model: Users,
            as :'Commentor',
            attributes: ['username']
        },
        {
            model: Comments,
            as: 'ChildComments',
            attributes: [
                'comment', 'id', 'parentcommentid', 'createdAt', 'CommentorUserId'
            ],  
            include: {
                model: Users,
                as : 'Commentor',
                attributes: ['username']
            }
        }
        ]
    })
    return res.status(200).json(data)
}

export const postCommentForVideo = async (req, res, next) => {
    //check if video exist
    let videoObject = await Videos.findOne({
        where: {
            id: req.params.videoId
        }
    })

    let commentor = await Users.findByPk(req.user.id)
    //if video exist , create comment
    if (videoObject) {
        let createdComment = await Comments.create({ comment: req.body.comment, CommentorUserId: req.user.id, CommentedVideoId: req.params.videoId    })
        //if comment is created, add a notification
        if (createdComment) {
            //if comment is not from video uploader , add notification
            //adding notification for video owner
            if(req.user.id != videoObject.UploaderUserId) {
                let createdNotification = await Notifications.create({ viewed: false, NotifiedUserId: videoObject.UploaderUserId , videoId : videoObject.id, commentor : commentor.username, message : req.body.comment.trim().slice(0,15)})
            }
            return res.status(200).json({ message: "Added comment" })
        }else{
            return res.status(500).json({ message: "Can't add comment" })
        }
        
    } else {
        return res.status(404).json({ message: "This video doesn't exist, young lady." })
    }
}

// export const getSubcommentForComment = async (req, res, next) => {
//     let data = await comment.findAll({
//         where : {
//             id : req.params.commentId,
//         },
//         include : {
//             model : comment,
//             as : 'subcomment'
//         }
//     })
//     return res.status(200).json(data)
// }

export const postSubcommentForComment = async (req, res, next) => {
    //check if comment exist
    let parentComment = await Comments.findOne({
        where: {
            id: req.body.id
        }
    })

    let commentor = await Users.findByPk(req.user.id)

    //if exist , create sub comment
    if (parentComment) {
        let createdComment = await Comments.create({ comment: req.body.comment, CommentorUserId: req.user.id, CommentedVideoId: req.body.VideoId, parentcommentid: req.body.parentcommentid })
        if (createdComment) {
            //dont create notification for reply to your own comment
            if(req.user.id != parentComment.CommentorUserId) {
                //creating notification for the original comment owner
                const pattern =  /@([^\s@]+)/g; // This matches any word starting with '@' followed by non-space characters
                const matches = [...req.body.comment.matchAll(pattern)].map(match => match[1]);
                //if there is an @username
                if(matches.length > 0){
                    //find the user
                    let taggedUser = await Users.findOne({
                        where : {
                            username : matches[0]
                        }
                    })
                    //if there is that user, create notification for him
                    if(taggedUser){
                        let createdNotification = await Notifications.create({ viewed: false, NotifiedUserId: taggedUser.id, videoId :  req.body.VideoId, message : req.body.comment.trim().slice(0,15) , commentor : commentor.username })
                    }else{
                        //else create notification for parent comment user
                        let createdNotification = await Notifications.create({ viewed: false, NotifiedUserId: parentComment.CommentorUserId, videoId :  req.body.VideoId, message : req.body.comment.trim().slice(0,15), commentor : commentor.username })
                    }
                }else{
                        //else create notification for parent comment user
                        let createdNotification = await Notifications.create({ viewed: false, NotifiedUserId: parentComment.CommentorUserId, videoId :  req.body.VideoId, message : req.body.comment.trim().slice(0,15), commentor : commentor.username })
                }
                
            }
            return res.status(200).json({ message: "Added comment" })
        } else {
            return res.status(500).json({ message: 'Cant add comment' })
        }
    } else {
        res.status(404).json({ message: "The comment doesn't exist, young lady" })
    }


}