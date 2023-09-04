import jwt from 'jsonwebtoken'
import UserDto from './userDTO.mjs'


class TokenService{
    generateTokens(tokenDecode){
        return {
            accessToken: jwt.sign({userId:tokenDecode.userId}, 'sh', {expiresIn:"2d"}),
            refreshToken: jwt.sign({userId:tokenDecode.userId}, 'sh', {expiresIn:"2d"}),
            user: tokenDecode.userId
        }
    }

    validateToken(token){
        try{
            const a = jwt.verify(token, 'sh')
            return true
        }
        catch{
            return false
        }
        
    }
}
export default new TokenService()