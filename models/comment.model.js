import { DataTypes } from "sequelize"
import Sequelize from "./sequelize.js"

const Comments = Sequelize.define(
    'Comments',
    {
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        parentcommentid : {
            type : DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Comments',
                key: 'id'
            }
        }
    }
)


export default Comments
