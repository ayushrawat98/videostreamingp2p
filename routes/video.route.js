import express from 'express'
import * as VideoController from '../controllers/video.controller.js'
import upload from '../helper/multer-main.js'
import authenticateToken from '../middlewares/authenticatetoken.js'
import multerErrorHandler from '../middlewares/multerErrorHandler.js'
import blocker from '../middlewares/blockvideo.js'

const router = express.Router()

router.get("/page/:number", VideoController.getVideos)

router.get("/detail/:videoId", VideoController.getVideoDetail)

router.get("/thumbnail/:id", VideoController.getThumbnail)

router.get("/trending", VideoController.currentViewedVideos)

router.get("/download/:id", VideoController.downloadVideo)

router.get("/:videoId", VideoController.streamVideo)

// router.post("/report", VideoController.reportVideo)

router.post("/search", VideoController.searchVideo)

router.post("/upload", blocker, authenticateToken, upload.single('video'), multerErrorHandler,  VideoController.postVideos)

router.post("/action",authenticateToken, VideoController.likedislikeVideo)


export default router
