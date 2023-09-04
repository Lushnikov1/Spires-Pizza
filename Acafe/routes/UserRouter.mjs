import { Router } from "express";
import UserController from "../controller/UserController.mjs";
import {body, validationResult} from 'express-validator'
const  UserRouter = Router();

UserRouter.post('/refresh', UserController.refresh)
UserRouter.post(
        '/signIn',
        body("email").isEmail(),
        body("password").isString().isLength({min: 5, max: 30}),
        UserController.signIn
)

UserRouter.put('/registration', 
        body("user_name").isLength({min: 2, max: 30}),
        body("user_name").isString(),
        body("user_email").isEmail().optional({nullable: true}),
        body("user_login").notEmpty().isLength({min: 5, max: 30}).isString(),
        body("user_password").notEmpty().isLength({min: 5, max: 30}),
        UserController.registration
)

UserRouter.get('/activateAccount', UserController.activateAccount)

UserRouter.put('/updateName', 
        body("userName").isString().isLength({min: 2, max: 30}),
        body("userId").isInt(),
        UserController.UpdateName
)

UserRouter.post('/logout', UserController.logout)

export default UserRouter