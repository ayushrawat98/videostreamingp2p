import Users from '../models/user.model.js'
import Videos from '../models/video.model.js'
import Subscriptions from '../models/subscription.model.js'
import Notifications from '../models/notification.model.js'
import Comments from '../models/comment.model.js'
import deleteVideoFile from '../helper/deleteVideo.js'

export const getUser = async (req, res, next) => {
    let foundUser = await Users.findOne({
        where : {
            id : req.params.id
        },
        attributes : ['id','username']
    })
    if(foundUser){
        return res.status(200).json(foundUser)
    }else{
        return res.status(404).json({message :"This user doesn't exist, young lady"})
    }
}

export const getUserVideos = async (req, res, next) => {
    // let foundUser = await user.findOne({ where: { username: req.user.username } })
    // let data = await foundUser.getVideos()
    let data = await Videos.findAll({
        where: { UploaderUserId: req.params.UserId },
        attributes : ['id','title','description','views','createdAt','UploaderUserId'],
        include : [{
            model : Users,
            as : 'Uploader',
            attributes : ['username']
        },
        ]
    })
    // {model : Comments, as : 'VideoComments', attributes : ['id'] }
    // let finalData = data.map(x => x.toJSON())
    let dataJson = data.map(x => x.toJSON())
    let index = 0
    for(let video of data){
        let tempcount = await video.countVideoComments()
        dataJson[index++].commentcount = tempcount
    }

    return res.status(200).json(dataJson)
}


//'as' tell which model to display
//it cant tell b/w 2 foreign key without it , check sync.js for association
export const getSubscriptionList = async (req, res, next) => {
        let answer = await Users.findByPk(req.user.id, {
            attributes : [],
            include:{
                model : Users,
                attributes : ['id','username'],
                as : 'SubscribedTo',
                through : {Subscriptions, attributes : []},
                include : {
                    model : Videos,
                    as : 'UserVideos',
                    limit : 5,
                    attributes : ['id','title','views', 'videoPath']
                }
            }
        })
        return res.status(200).json(answer)
}

export const subscribeToUser = async (req, res, next) => {
    //check user subscribing to himself
    if(req.user.id == req.body.UserId){
        return res.status(400).json({message : "Can't subscribe to yourself, idiot!"})
    }
    //else check if user exist
    let userExist = await Users.findOne({
        where : {
            id : req.body.UserId
        }
    })
    if(!userExist){
        return res.status(404).json({message : "The user doesn't exist, young lady"})
    }
    //else check if already subscribed , then unsubscribe
    let alreadySubscribed = await Subscriptions.findOne({
        where : {
            subscriber_id : req.user.id,
            subscribedto_id : req.body.UserId
        }
    })
    if(alreadySubscribed){
        let unsubscribeDone = await alreadySubscribed.destroy()
        if(unsubscribeDone){
            return res.status(200).json({message : "Unsubscribed"})
        }else{
            return res.status(500).json({message : "Unsubscribe failed"})
        }
    } else {
        let subscribed = Subscriptions.create({subscriber_id: req.user.id, subscribedto_id : req.body.UserId})
        if(subscribed){
            return res.status(200).json({message : "Subscribed"})
        }else{
            return res.status(400).json({message : "Subscription failed"})
        }
    }
    
}

export const getNotifications = async (req, res, next) => {
    const offsetBy = 0 + (4*req.body.page)
    const limitBy = 4
    let allnotifications = await Notifications.findAndCountAll({
        where:{
            NotifiedUserId : req.user.id,
        },
        attributes : ['id','createdAt','viewed', 'message', 'videoId', 'commentor'],
        order: [['createdAt', 'DESC']],
        offset: offsetBy,
        limit: limitBy,
    })
    if(allnotifications){
        return res.status(200).json(allnotifications)
    }else{
        return res.status(400).json("Some error occured")
    }
}

export const readNotifications = async (req, res, next) => {
    let setAsRead = await Notifications.update(
        {viewed : true},
        {
            where : {
                NotifiedUserId : req.user.id
            }

        }
    )
    if(setAsRead){
        res.status(200).json({message : "Done"})
    }else{
        res.status(500).json({message : "Failed"})
    }
}

export const amISubscribed = async (req, res, next) => {
    let amI = await Subscriptions.findOne({
        where : {
            subscriber_id : req.user.id,
            subscribedto_id : req.params.userid
        }
    })
    if(amI){
        return res.status(200).json({message : "yes"})
    }else{
        return res.status(200).json({message : "no"})
    }
}

let cacheUserName = undefined
export const findUserByName = async (req, res, next) => {
    if(cacheUserName == undefined || cacheUserName[1] + 300000 < Date.now()){
        let list = await Users.findAll({
            attributes : ['id','username']
        })
        cacheUserName = [list, Date.now()]
    }
    let names = cacheUserName[0].map(x => x.toJSON()).filter(x => x.username.toLowerCase().includes(req.body.name.toLowerCase()))
    return res.status(200).json(names)
  
}

export const deleteVideoById = async (req, res, next) => {
    const toBeDeletedVideo = await Videos.findOne({
        where : {
            id : req.params.id
        }
    })
    
    if(toBeDeletedVideo && toBeDeletedVideo.UploaderUserId != req.user.id){
        return res.status(400).json({message : "Hacker spotted!"})
    }

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