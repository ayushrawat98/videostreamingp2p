import express from 'express'
import * as AuthenticateController from '../controllers/authenticate.controller.js'
import notEmptyBody from '../middlewares/notemptybody.js'

const router = express.Router()

router.post('/login', notEmptyBody, AuthenticateController.loginUser)

router.post('/register', notEmptyBody, AuthenticateController.registerUser)

export default router