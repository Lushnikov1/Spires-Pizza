import crypto from 'crypto'

export const helpersService= {
    hashPassword: (password) => crypto.createHash('sha256').update(password).digest("hex"),
    createHash: (STRING) => crypto.createHash('sha256').update(STRING).digest("hex"),
    userFormat: (user) => ({
        userName: user['user_name'],
        bonuses: user['bonuses'],
        userId: user['id_user']
     })

    
}