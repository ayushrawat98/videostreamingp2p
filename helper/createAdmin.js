import bcrypt from 'bcryptjs'
import User from '../models/user.model.js';

const createAdmin = async () => {
    let hashedPassword = await bcrypt.hash('oojanejana', 1)
    let admin = await User.create({ username: 'admin', password: hashedPassword, isAdmin: true, ipAddress: 1234 });
}

export default createAdmin