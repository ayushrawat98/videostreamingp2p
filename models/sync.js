import SequelizeInstance from "./sequelize.js"
import Users from "./user.model.js"
import Videos from "./video.model.js"
import Subscriptions from "./subscription.model.js"
import Comments from "./comment.model.js"
import Notifications from "./notification.model.js"
import Actions from "./actions.model.js"
import createAdmin from "../helper/createAdmin.js"

import  WebtorrentClient  from '../helper/webtorrent.js'


Users.hasMany(Videos, { as: 'UserVideos', onDelete: 'CASCADE', foreignKey: 'UploaderUserId' })
Videos.belongsTo(Users, { as: 'Uploader', foreignKey: 'UploaderUserId' })

Users.belongsToMany(Users, { through: Subscriptions, as: 'SubscribedTo', foreignKey: 'subscriber_id' })
Users.belongsToMany(Users, { through: Subscriptions, as: 'SubscribedBy', foreignKey: 'subscribedto_id' })

Users.hasMany(Comments, { as: 'UserComments', onDelete: 'CASCADE', foreignKey: 'CommentorUserId' })
Comments.belongsTo(Users, { as: 'Commentor', foreignKey: 'CommentorUserId' })
Videos.hasMany(Comments, { as: 'VideoComments', onDelete: 'CASCADE', foreignKey: 'CommentedVideoId' })
Comments.belongsTo(Videos, { as: 'CommentedVideo', foreignKey: 'CommentedVideoId' })
Comments.hasMany(Comments, { as: 'ChildComments', foreignKey: 'parentcommentid', onDelete: 'CASCADE' })
Comments.belongsTo(Comments, { as: 'ParentComment', foreignKey: 'parentcommentid' })

Users.hasMany(Notifications, { as: 'UserNotifications', onDelete: 'CASCADE', foreignKey: 'NotifiedUserId' })
Notifications.belongsTo(Users, { as: 'NotifiedUser', foreignKey: 'NotifiedUserId' })

Videos.belongsToMany(Users, { through: Actions, as: 'Likers', foreignKey: 'LikerUserId' })
Users.belongsToMany(Videos, { through: Actions, as: 'LikedVideos', foreignKey: 'LikedVideoId' })


const syncer = async () => {
    await SequelizeInstance.sync({});

    let admin = await Users.findOne({
        where : {
            isAdmin : true
        }
    })

    if(!admin){
        createAdmin()
    }

    // let allvideos = await Videos.findAll()
    // allvideos.forEach(x => {
    //     WebtorrentClient.seed('./public/videos/'+ x.videoPath , async (torrent) => {
    //         console.log(torrent.magnetURI)
    //        await x.update({infoHash : torrent.magnetURI})
    // })
    // })
    

    //seed the torrents on startup
    let t = await Videos.findAll()
    // WebtorrentClient.setMaxListeners(Infinity)
    t.map(x => x.toJSON()).forEach(element => {
        WebtorrentClient.seed('./public/videos/' + element.videoPath, async (torrent) => {
            WebtorrentClient.removeAllListeners('data')
            torrent.removeAllListeners('data')
            console.log('seeding')
         })
        
    });
}

export default syncer
