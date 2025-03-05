import express from 'express'
import * as UserController from '../controllers/user.controller.js'
import authenticateToken from '../middlewares/authenticatetoken.js'

const router = express.Router()

router.get('/details/:id', UserController.getUser)

router.get('/:UserId/videos', UserController.getUserVideos)

router.get('/subscription', authenticateToken, UserController.getSubscriptionList)

router.get("/amisubscribed/:userid",authenticateToken, UserController.amISubscribed)

router.post("/search", UserController.findUserByName)

router.post('/subscribe', authenticateToken, UserController.subscribeToUser)

router.post('/notifications', authenticateToken, UserController.getNotifications)

router.post('/notifications/read',authenticateToken, UserController.readNotifications )

router.delete('/video/:id',authenticateToken, UserController.deleteVideoById)


export default router