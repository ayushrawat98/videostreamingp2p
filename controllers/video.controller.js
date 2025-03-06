import Videos from '../models/video.model.js'
import Users from '../models/user.model.js'
import fs from 'fs'
import path from 'node:path'
import generateThumbnail from '../helper/generateThumbnail.js'
import mime from 'mime-types'
import Subscriptions from '../models/subscription.model.js'
import Actions from '../models/actions.model.js'
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import WebtorrentClient  from '../helper/webtorrent.js'



export const getVideos = async (req, res, next) => {
    const offsetBy = 0 + (12 * req.params.number)
    const limitBy = 12
    try {
        let allVideos = await Videos.findAndCountAll({
            attributes: ['id', 'title', 'description', 'views', 'createdAt', 'UploaderUserId'],
            order: [['createdAt', 'DESC']],
            offset: offsetBy,
            limit: limitBy,
            include: [
                { 
                    model: Users,
                    as : 'Uploader',
                    attributes: ['username'] 
                }
            ],
            distinct: true
        })
        let allVideosJson = {
            count : allVideos.count,
            rows : allVideos.rows.map(x => x.toJSON())
        }
        let index = 0
        for(let video of allVideos.rows){
            let tempcount = await video.countVideoComments()
            allVideosJson.rows[index++].commentcount = tempcount
        }
        return res.status(200).send(allVideosJson)
    } catch (error) {
        return res.status(500).json({ message: error })
    }
}

let trendingVideoCache = undefined
export const currentViewedVideos = async (req, res, next) => {
    try {
        if (trendingVideoCache && trendingVideoCache.time + 300000 > Date.now()) {
            return res.status(200).json(trendingVideoCache.cache)
        }

        let allVideos = await Videos.findAll({
            attributes: ['id', 'title', 'description', 'views', 'updatedAt'],
            order: [['updatedAt', 'DESC']],
            offset: 0,
            limit: 8,
            include: [{ model: Users, as : 'Uploader', attributes: ['username'] }, ],
            distinct: true
        })

        let allVideosJson = allVideos.map(x => x.toJSON())
        let index = 0
        for(let video of allVideos){
            let tempcount = await video.countVideoComments()
            allVideosJson[index++].commentcount = tempcount
        }

        trendingVideoCache = { cache: allVideosJson, time: Date.now() }
        return res.status(200).json(allVideosJson)
    } catch (error) {
        return res.status(500).json({ message: error })
    }
}


export const postVideos = async (req, res, next) => {

    let videoTitle = req.body.title ?? ""
    let videoDescription = req.body.description ?? ""
    // const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    // const newFileName = uniqueSuffix + "-" + req.file.originalname

    if (!req.file) {
        return res.status(400).json({ message: "Video file is required" })
    } else if (videoTitle.length == 0) {
        return res.status(400).json({ message: 'Title is required.' })
    } else {
        try {
            WebtorrentClient.seed('./public/videos/'+ req.file.filename , async (torrent) => {
                    let addedVideo = await Videos.create({ title: videoTitle, description: videoDescription, videoPath: req.file.filename, views: 0, UploaderUserId: req.user.id , infoHash : torrent.magnetURI})
                    generateThumbnail(req.file.filename, addedVideo.id, 'newFileName')
            })
            return res.status(200).json({ message: "Upload completed" })
        } catch (error) {
            console.log(error)
            return res.status(500).json({ message: error })
        }
    }
}

let videoDataCache = {}
let videoCache = {}
export const streamVideo = async (req, res, next) => {
    try {
        //check if video exists
        let video
        if (videoCache[req.params.videoId]) {
            video = videoCache[req.params.videoId]
        } else {
            video = await Videos.findOne({ where: { id: req.params.videoId } })
            videoCache[req.params.videoId] = video
        }

        if (!video) {
            return res.status(400).json({ message: "Video doesn't exist" })
        }

        //continue with streaming
        let videoName = video.videoPath
        let videoPath = `public/videos/${videoName}`

        let videoSize
        if (videoDataCache[videoName]) {
            videoSize = videoDataCache[videoName]
        } else {
            videoSize = fs.statSync(videoPath).size
            videoDataCache[videoName] = videoSize
        }

        //eg : 'video/mp4' , 'video/webm'
        const mimeType = mime.lookup(videoPath)

        let videoRange = req.headers.range
        let chunkSize = 1024 * 1024 //2000 kb chunk size
        if (videoRange) {
            const parts = videoRange.replace(/bytes=/, "").split("-");
            const startByte = parseInt(parts[0], 10);
            // const endByte = parts[1] ? parseInt(parts[1], 10) : videoSize-1;
            const endByte = Math.min(startByte + chunkSize, videoSize - 1)
            if (endByte - startByte < chunkSize) {
                chunkSize = (endByte - startByte) + 1
            }
            // const chunkSize = (endByte-startByte) + 1;
            const file = fs.createReadStream(videoPath, { start: startByte, end: endByte });
            const head = {
                'Content-Range': `bytes ${startByte}-${endByte}/${videoSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunkSize,
                'Content-Type': mimeType,
            };
            res.writeHead(206, head);
            file.pipe(res);
        } else {
            let head = {
                'Content-length': videoSize,
                'Content-type': 'video/mp4'
            }
            res.writeHead(200, head)
            fs.createReadStream(videoPath).pipe(res)
        }
    } catch (err) {
        res.status(500).json({ message: err })
    }
}

export const getThumbnail = async (req, res, next) => {
    return res.sendFile((path.join(dirname(fileURLToPath(import.meta.url)), "../public/thumbnails/")) + req.params.id + '.jpg')
}

//use only with streaming video api because views counter is attached to this
//can't use with streamvideo because it makes a request for every forward in video
let uniqueviewers = {}
export const getVideoDetail = async (req, res, next) => {
    let videoDetail = await Videos.findOne({
        where: {
            id: req.params.videoId
        },
        attributes: ['id', 'title', 'description', 'views', 'createdAt', 'UploaderUserId', 'videoPath', 'infoHash'],
        include: {
            model: Users,
            as : 'Uploader',
            attributes: ['username'],
        }
    })

    if (!videoDetail) {
        return res.status(400).json({ message: "Video doesn't exist" })
    }

    //subscriber count
    let totalsubscribers = await Subscriptions.findAndCountAll({
        where: {
            subscribedto_id: videoDetail.toJSON().UploaderUserId
        }
    })

    //likes and dislikes
    let likesdislikes = await Actions.findAll({
        where: {
            LikedVideoId: req.params.videoId
        },
        attributes: ['LikerUserId', 'action']
    })

    let token = req.clientIpAddressFound + '-' + req.params.videoId
    if(uniqueviewers[token] == undefined || uniqueviewers[token].date != new Date().getDate()){
        //incrementing view by 1 on video
        await videoDetail.increment('views', { by: 1 });
        uniqueviewers[token] = {date : new Date().getDate()}
    }
    
    return res.status(200).json({ videoDetail: videoDetail, sub: totalsubscribers.count, action: likesdislikes })

}


// export const reportVideo = async (req, res, next) => {

//     let reportedVideo = await Videos.findByPk(req.body.id)
//     if (reportedVideo) {
//         let addedReport = await Reports.create({ VideoId: req.body.id })
//         return res.status(200).json({ message: "Report added successfully" })
//     } else {
//         return res.status(400).json({ message: "Video doesn't exist, young lady" })
//     }
// }

let cacheVideoName = undefined
export const searchVideo = async (req, res, next) => {
    if (cacheVideoName == undefined || cacheVideoName[1] + 300000 < Date.now()) {
        let list = await Videos.findAll({
            attributes: ['id', 'title']
        })
        cacheVideoName = [list, Date.now()]
    }
    let names = cacheVideoName[0].map(x => x.toJSON()).filter(x => x.title.toLowerCase().includes(req.body.title.toLowerCase()))
    return res.status(200).json(names)

}

export const likedislikeVideo = async (req, res, next) => {
    if (req.body.action != 'like' && req.body.action != 'dislike') {
        return res.status(400).json({ message: 'Wrong payload' })
    }
    // find if like/dislike already exist
    let oldAction = await Actions.findOne({
        where: {
            LikerUserId: req.user.id,
            LikedVideoId: req.body.VideoId
        }
    })

    let generatedAction

    if (oldAction) {
        if (oldAction.action == req.body.action) {
            await oldAction.destroy()
        } else {
            await oldAction.destroy()
            generatedAction = await Actions.create({ action: req.body.action, LikerUserId: req.user.id, LikedVideoId: req.body.VideoId })
        }
    } else {
        generatedAction = await Actions.create({ action: req.body.action, LikerUserId: req.user.id, LikedVideoId: req.body.VideoId })
    }

    return res.status(200).json({ message: 'Completed' })

}

export const downloadVideo = async (req, res, next) => {
    const id = req.params.id
    let video = await Videos.findOne({
        where : {
            id : id
        }
    })

    return res.sendFile((path.join(dirname(fileURLToPath(import.meta.url)), "../public/videos/")) + video.videoname)
}