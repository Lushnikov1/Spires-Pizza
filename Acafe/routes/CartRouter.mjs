import { Router } from "express";
import CartController from "../controller/CartController.mjs";
import {body, check, oneOf} from 'express-validator'

const  CartRouter = Router();

CartRouter.post('/add-to-cart',
            oneOf([
                [
                    oneOf([
                        check('ingridients').isEmpty().not().isArray(),
                        [
                            check('ingridients').isArray().notEmpty(),
                            check('ingridients.*').isNumeric().notEmpty()
                        ]
                    ]),
                    check("idCombo").not().exists(),
                    check("content").isObject().notEmpty(),
                    check("content.id").isNumeric().notEmpty()
                ],
                [
                    check('ingridients').not().exists(),
                    check('content').isArray(),
                    check('content.*.id_productPrice').isNumeric()
                ]
            ]),
            CartController.addToCart)

CartRouter.put('/add-combo',
                body("*.idUser").notEmpty().isNumeric().withMessage('Неправильный формат юзера'),
                body("*.idProductPrice").notEmpty().isNumeric().withMessage('Некорректный формат'),
                body("*.id_combo").notEmpty().isNumeric().withMessage('Некорректный формат'),
                CartController.addToCombo
)

CartRouter.delete('/delete',
                body("cartId").isArray().notEmpty(),
                body("cartId.*").isInt().notEmpty(),
                body("userId").isInt().notEmpty(),
                CartController.cartDelete,
               
)

CartRouter.post('/get',
                CartController.cartGet,      
)

CartRouter.post('/add',
                oneOf([
                    [
                        check('cartId').isArray().notEmpty(),
                        check('cartId.*').isNumeric().notEmpty(),
                        check('comboCount').isInt().notEmpty(),
                        body("cartId").custom((value, {req}) =>{
                            if ( (value.length/req.body.comboCount) % 1 !== 0 ){
                                return Promise.reject('fdsf')
                            }
                            
                            return true
                        }),
                        body("addedCount").custom((value, {req}) =>{
                           if (value >= -req.body.comboCount) return true
                           return Promise.reject('fdsf')
                        })
                    ],
                    [
                        check('cartId').isNumeric(),      
                        check('comboCount').not().exists(),
                    ]
                ]),
               body("addedCount").exists().isNumeric(),
                CartController.addProduct,           
)

CartRouter.post('/promocode/:promocode', CartController.addPromocode)

CartRouter.patch('/promocode/clear', CartController.clearPromocode)

CartRouter.post('/promocode', CartController.getPromo)

export default CartRouter