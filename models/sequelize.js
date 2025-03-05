import { Sequelize } from "sequelize"

// const SequelizeInstance = new Sequelize('sqlite::memory:'); // Example with in-memory database
const SequelizeInstance = new Sequelize({
    dialect: 'sqlite',
    storage: 'bharattube.db'
})

export default SequelizeInstance