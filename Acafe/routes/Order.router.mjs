import { Router } from "express";
import { body, oneOf } from "express-validator";
import OrderController from "../controller/Order.controller.mjs";
// import OrderRouter from "../controller/ProductController.mjs";
const  OrderRouter =  new Router();


OrderRouter.post('/create',
 body("restaurantId").isInt(),
 body("time").isISO8601().toDate().optional({nullable:true}),
 oneOf([
    [
      body('gettingType').custom(value =>{
        if (value !== 'pickup') throw new Error('Фикисрованное значение поля "Самовывоз" - напишите "pickup"')
        return true
      }),
    ],
    [
      body('gettingType').custom(value =>{
        if (value !== 'delivery') throw new Error('Фикисрованное значение поля "Доставка" - напишите "delivery"')
        return true
      }),
      body("adress").isString(),

    ]
 ]),
 body('paymentType').custom(value =>{
  if (value === 'cart' || value === 'cash') return true
  throw new Error('Фикисрованное значение поля "PaymentType" - напишите "cart или cash"')
}),
  OrderController.create

)

OrderRouter.get('/json',

  OrderController.getRestatauntJson

)

OrderRouter.get('/updateStatuses',

  OrderController.updateStatuses

)

OrderRouter.post('/test',
  OrderController.checkout

)

OrderRouter.get('/areas',

  OrderController.getAreas

)

OrderRouter.get('/getCities', OrderController.getCities)

OrderRouter.post('/getStatus', OrderController.getStatus)

export default OrderRouter