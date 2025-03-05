import {  DataTypes } from "sequelize"
import Sequelize from "./sequelize.js"

const Actions = Sequelize.define(
    'Actions',
    {
        action: {
            type: DataTypes.ENUM('like', 'dislike'),
            allowNull: false
        }
    }
)

export default Actions
