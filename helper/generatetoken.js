import jwt from 'jsonwebtoken'

//pass object not a string
function generateToken(username){
    return jwt.sign(username, process.env.TOKEN_SECRET, {expiresIn : '12h'})
}

export default generateToken