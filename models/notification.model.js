import { DataTypes } from "sequelize"
import Sequelize from "./sequelize.js"

const Notifications = Sequelize.define(
    'Notifications',
    {
        viewed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        videoId : {
            type : DataTypes.INTEGER,
            allowNull : true
        },
        commentor : {
            type : DataTypes.STRING,
            allowNull : true
        },
        message : {
            type : DataTypes.STRING,
            allowNull : true
        }
    }
)


export default Notifications
