import { DataTypes } from "sequelize"
import Sequelize from "./sequelize.js"
import Users from "./user.model.js"

const Subscriptions = Sequelize.define(
    'Subscriptions',
    {
        subscriber_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references : {
                model : Users,
                key : 'id'
            }
        },
        subscribedto_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references : {
                model : Users,
                key : 'id'
            }
        }
    }
)


export default Subscriptions
