import { ActivationAccount, checkUserExist, makeQuery, registrationUser, updateToken, } from "../services/queryService.mjs";
import jwt from 'jsonwebtoken'
import tokenService from "../services/tokenService.mjs";
import { validationResult} from 'express-validator'
import userService from "../services/userService.mjs";


class UserController { 
    // no test 
   async refresh(req,res, next){
       try{
            const access = req.headers?.authorization?.split(' ')[1]
            if (!access) throw new Error('sadfasf')     

            // ИЗМЕНИТЬ ЛОГИКУ (РАБОТАЕТ НЕВПРАВИЛЬНО)
            const {Refresh} = req.cookies   
            
            if (!tokenService.validateToken(Refresh)){
                throw new Error()
            }
        
            const {accessToken, refreshToken, user} = tokenService.generateTokens(jwt.decode(access)) 
            const userDTO = await updateToken(user, refreshToken)
            console.log('Новый токен access ', accessToken)
            res.cookie('Refresh', refreshToken, { maxAge: 1000 * 60 * 10, httpOnly: true} )
            
            res.send({
                accessToken: accessToken,
                user: userDTO
            })
       }
       catch(err){
        res.clearCookie("Refresh");
        res.send(401)
       }
       
   }

   // no test 
   async signIn(req,res, next){
        try {
            console.log(123)
            const {errors} = validationResult(req)
            if (errors.length){
                return res.status(400).send(errors.map(er =>  er));
            }
            const {email, password} = req.body
            const user = await checkUserExist(email,password)
            if ( !user ) return res.status(400).send('Пользователь не найден')
    
            const response = tokenService.generateTokens({userId: user['id_user'], userName: user['user_name'], bonuses: user['bonuses']})
            const userDto = await updateToken(response.user, response.refreshToken);
    
            console.log("TEST accessToken: "+response.accessToken)
            console.log(jwt.verify(response.accessToken, 'sh'))
            res.cookie('Refresh', response.refreshToken, {httpOnly: true,})
            return res.send({
                accessToken: response.accessToken,
                user: userDto
            } )
        } catch (error) {
            next(error)
        }   
   }

   // no test 
   async registration(req,res, next){
        try {
            const {errors} = validationResult(req)
            if (errors.length){
                return res.status(400).send(errors.map(er =>  er));
            }
            if (await registrationUser(req.body)===false){
                return res.status(400).send({message: "Пользователь с таким именем уже существует"})
            }  
            res.send('Registration')
        } catch (error) {
            next(error)
        }
     
    }

    // no test 
   async activateAccount(req,res, next){
        try {
            const tag = req.query.h;
            if ( await ActivationAccount(tag)){
                res.send('ActivateStatus')
            } else{
                res.status(404).send('')
            }
        } catch (error) {
            next(error)
        }
    }

    // no test 
   async UpdateName(req, res, next ){
        try {
            const {errors} = validationResult(req)
            if (errors.length){
                return res.status(400).send(errors.map(er =>  er));
            }
            const access = req.headers?.authorization?.split(' ')[1]
            if(!tokenService.validateToken(access) || !access) return res.status(401).send({messasge: "Unauthorized"})
          
            const {userName, userId} = req.body;
            await userService.updateName({id: userId, name: userName})
            .then(e => res.send('Success'))
            .catch(err =>  res.status(400).send({message: err.message}))
        } catch (error) {
            next(error)
        }
      
    }

    // no test 
    async logout(req,res,next){
        try {
            res.clearCookie("Refresh")
            res.send('Логаут')
        } catch (error) {
            next(error)
        }
       
    }

}

export default new UserController()