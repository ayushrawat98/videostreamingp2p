import { DataTypes } from "sequelize"
import Sequelize from "./sequelize.js"
import test from "node:test"

const Videos = Sequelize.define(
    'Videos',
    {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.STRING,
            allowNull : true
        },
        videoPath: {
            type: DataTypes.STRING,
            allowNull: false
        },
        views: {
            type : DataTypes.NUMBER,
            allowNull : false
        },
        infoHash : {
            type : DataTypes.TEXT,
            allowNull : false
        }
    }
)

export default Videos
