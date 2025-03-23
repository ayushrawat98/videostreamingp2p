import Comments from '../models/comment.model.js'
import Users from '../models/user.model.js'
import Videos from '../models/video.model.js'
import fs from 'fs'
import deleteVideoFile from '../helper/deleteVideo.js'

export const deleteCommentById = async (req, res, next) => {
    const deletedComment = await Comments.destroy({
        where: {
            id: req.params.id
        }
    })
    //1 on deleted , 0 on error
    if (deletedComment) {
        return res.status(200).json({ message: 'Deleted comment' })
    } else {
        return res.status(400).json({ message: 'Comment does not exist , young lady' })
    }
}

export const deleteVideoById = async (req, res, next) => {
    const toBeDeletedVideo = await Videos.findOne({
        where : {
            id : req.params.id
        }
    })
    const deletedVideo = await Videos.destroy({
        where: {
            id: req.params.id
        }
    })

    //1 on deleted , 0 on error
    if (deletedVideo) {
        deleteVideoFile(toBeDeletedVideo)
        return res.status(200).json({ message: 'Deleted video' })
    } else {
        return res.status(400).json({ message: 'This video does not exist , young lady' })
    }

}

export const deleteUserById = async (req, res, next) => {
    const userDetails = await Users.findOne({
        where : {
            id : req.params.id
        }
    })

    if(!userDetails){
        return res.status(400).json({ message: 'This user does not exist , young lady' })
    }

    const allVideos = await Videos.findAll({
        where : {
            UploaderUserId : req.params.id
        }
    })

    allVideos.forEach(async video => {
        //remove video and thumbnail from fs
        deleteVideoFile(video)
    })

    const deletedUser = await Users.destroy({
        where: {
            id: req.params.id
        }
    })
    
    if (deletedUser) {
        //save the bastard IP
        fs.appendFile('./public/bastards.txt', JSON.stringify(userDetails.toJSON()), (err) => {})
        return res.status(200).json({ message: 'Deleted user' })
    }

}

//delete thumbnail and video
//on fail write the names of file in './public/failed.txt'
// deleteVideoFile = async (toBeDeletedVideo) => {
//      //delete thumbnail
//      fs.unlink('./public/thumbnails/'+toBeDeletedVideo.id + '.jpg', (err) => {
//         if(err){
//         fs.appendFile('./public/failed.txt', `delete /thumbnails/${toBeDeletedVideo.id}`, (err)=> {} )
//         }
//      })
//      //delete video
//      fs.unlink('./public/videos/'+ toBeDeletedVideo.videoname, (err) => {
//         if(err){
//         fs.appendFile('./public/failed.txt', `delete /video/${toBeDeletedVideo.videoname}` , (err)=>{})
//         }
//      })
// }

// export const getAllReportedVideos = async (req, res, next) => {
//     let r = await Videos.findAll({
//         attributes : [ 'id', [SequelizeInstance.fn('COUNT', SequelizeInstance.col('Reports.id')), 'reportCount'] ],
//         group : ['Video.id'],
//         include : {
//             model : Reports,
//             attributes : []
//         },
//         // having: sequelize.literal('COUNT(Reports.id) > 0')
//     })
//     return res.status(200).json(r)
// }