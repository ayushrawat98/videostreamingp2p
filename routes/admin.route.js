import express from 'express'
import * as AdminController from '../controllers/admin.controller.js'
import authenticateToken from '../middlewares/authenticatetoken.js'
import isAdmin from '../middlewares/isAdmin.js'

const router = express.Router()

router.delete('/video/:id', authenticateToken, isAdmin, AdminController.deleteVideoById)

router.delete('/user/:id',authenticateToken, isAdmin, AdminController.deleteUserById)

router.delete('/comment/:id',authenticateToken, isAdmin, AdminController.deleteCommentById)

// router.get('/report',authenticateToken, isAdmin, AdminController.getAllReportedVideos)

export default router