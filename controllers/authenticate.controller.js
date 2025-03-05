import tokenGenerator from '../helper/generatetoken.js'
import Users from '../models/user.model.js'
import bcrypt from 'bcryptjs'


export const loginUser = async (req, res, next) => {
    let user = await Users.findOne({ where: { username: req.body.username } })
    if (!user) {
        return res.status(404).json({ message: 'User does not exist' })
    } else if (!(await bcrypt.compare(req.body.password, user.password))) {
        return res.status(400).json({ message: "Wrong password" })
    } else {
        return res.status(200).json({ message: tokenGenerator({ id: user.id, username: user.username, isAdmin : user.isAdmin }) })
    }

}

export const registerUser = async (req, res, next) => {    
    let hashedPassword = await bcrypt.hash(req.body.password, 1)
    try {
        let user = await Users.create({username: req.body.username, password: hashedPassword, isAdmin: false});
        return res.status(200).json({ message: "User registered.", token : tokenGenerator({ id: user.id, username: user.username, isAdmin : user.isAdmin }) })
    } catch (err) {
        if (err.name == 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ message: 'Username already taken. Choose another.' })
        } else {
            return res.status(500).json({ message: 'DB error occured' })
        }
    }

}