import express from 'express'
import * as CommentController from '../controllers/comment.controller.js'
import authenticateToken from '../middlewares/authenticatetoken.js'

const router = express.Router()

router.get('/video/:videoId', CommentController.getCommentForVideo)

router.post('/video/:videoId',authenticateToken, CommentController.postCommentForVideo)

// router.get('/:commentId', CommentController.getSubcommentForComment)

router.post('/:commentId',authenticateToken, CommentController.postSubcommentForComment)


export default router