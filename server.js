import express from 'express'
import path from 'node:path'
import cors from 'cors'
import helmet from 'helmet'
import https from 'https'
import fs from 'fs'
import compression from 'compression'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { ipMiddleware } from './middlewares/getipaddress.js'
import syncer from './models/sync.js'
import VideoRouter from './routes/video.route.js'
import AuthenticateRouter from './routes/authenticate.route.js'
import UserRouter from './routes/user.route.js'
import CommentController from './routes/comment.route.js'
import AdminRouter from './routes/admin.route.js'


const app = express()
//load config file
dotenv.config()

if (process.env.NODE_ENV === 'development') {
    app.use(cors())
}

//before serving static , compress it
app.use(compression())

if (process.env.NODE_ENV === 'production') {
    //safety
    app.use(helmet({
        contentSecurityPolicy: false,
    }))
}


//serve index.html
app.use(express.static(path.join(dirname(fileURLToPath(import.meta.url)), "public/angular"), {cacheControl : true, maxAge : "1h"}));

//parse json data
app.use(express.json())

//get ip address of user
app.use(ipMiddleware)

//DB
syncer()

//routes
app.use("/server/video", VideoRouter)
app.use("/server/authenticate", AuthenticateRouter)
app.use("/server/user", UserRouter)
app.use("/server/comment", CommentController)
app.use("/server/admin", AdminRouter)

//send angular index.html and use its routing
app.get('*', (req, res, next) => {
    return res.sendFile(path.join(dirname(fileURLToPath(import.meta.url)), 'public', 'angular', 'index.html'))
})

//handle any error
app.use((err, req, res, next) => {
    return res.status(500).send('Something broke!')
})


//start server
if (process.env.NODE_ENV === 'development') {
    // create server local
    app.listen(process.env.PORT, (ex) => {
        console.log(process.env.PORT)
    })
} else if (process.env.NODE_ENV === 'production') {
    const options = {
        key: fs.readFileSync('/etc/letsencrypt/live/bharattube.xyz/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/bharattube.xyz/fullchain.pem')
    };
    https.createServer(options, app).listen(443, () => {
        console.log('API server running on https://bharattube.xyz');
    });
}
