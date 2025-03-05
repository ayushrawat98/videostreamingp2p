import {  DataTypes } from "sequelize"
import Sequelize from "./sequelize.js"

const Users = Sequelize.define(
    'Users',
    {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull : false
        },
        isAdmin: {
            type: DataTypes.BOOLEAN,
            allowNull:false
        }
    }
)


export default Users
