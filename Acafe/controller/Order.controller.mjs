import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken'
import { createOrder, getJson, getPolygons } from '../services/Order.mjs';
import tokenService from '../services/tokenService.mjs'

import {YooCheckout} from '@a2seven/yoo-checkout'
import { getCitiesDb, getStatuses, getTypeOfOrder } from '../services/queryService.mjs';
import { PaymentService } from '../services/Payment.service.mjs';
// youkass

const idempotenceKey = '22367fc4-a1f0-9fdb-8ssffdls';




class OrderController{
    async create(req,res,next){
        try {
       
            const {errors} = validationResult(req);
            if (errors.length){
                return res.status(400).send(errors.map(er =>  er));
            }

            const access = req.headers?.authorization?.split(' ')[1]
            if (!access || !tokenService.validateToken(access) ) return res.status(401).send({message:"Unauthorized"})  

            const {userId} = jwt.verify(access, 'sh')
            const response = (await createOrder(req.body, userId))
            console.log(response)
            res.send(response)
            
        } catch (error) {
            next(error)
        }
    }

    async getRestatauntJson(req,res,next){
        try{
            res.send( await getJson())
        } catch(err){
            next(err)
        }

    }

    async updateStatuses(req,res,next){
        await PaymentService.updatePayments()
        res.send('update statuses')
    }

    async checkout(req,res,next){
        try {
            const createPayload = {
                amount: {
                    value: '22222.00',
                    currency: 'RUB'
                },
                payment_method_data: {
                    type: 'bank_card'
                },
                confirmation: {
                    type: 'redirect',
                    return_url: `${process.env.ROOT_URL}`
                },
                capture: true
            };
            const checkout = new YooCheckout({shopId: 971985, secretKey:"test_LRotL5yXYP49iDUo2k7yGH06DeiwJfh4yb79fd3RosY",})
            console.log(process.env.ROOT_URL)
    
            try{
                const payment = await checkout.createPayment(createPayload, idempotenceKey);
    
                // const getpayment = await checkout.getPayment('2b421932-000f-5000-9000-10a918994fd7')
                console.log(payment)

                res.send('Повкезло')

            }
            catch(err){
                throw err
            }
        } catch (error) {
            next(error)
        }
      
       
   
    }

    async getCities(req,res,next){
        const result = await getCitiesDb()
        const response = result.map(city => ({
            city: city.city_name,
            cityId: city.id_city
        }))
        res.send(response)
    }

    async getAreas(req,res,next){
        
        const restaraunts = await getPolygons()
        res.send(restaraunts)
    }
    
    async getStatus(req,res,next){
        try {
            const orderId = req.body?.orderId
            // {
            //     value: "Ожидает оплаты",
            //     id: 1,
            //     element: <div>svg приготовление</div>
            // }
    
            // принимает delivery|pickup, тип оплаты
            console.log('DEBUG')
            const orderType = await getTypeOfOrder(orderId)
            console.log('DEBUG2', orderType)
    
            const idStatus = orderType.order['id_orderStatus'];
            
            const statuses = await getStatuses(orderType)
    
            const indexR = statuses.findIndex(e => e.id === idStatus)
    
            
            res.send({
                statuses,
                index: indexR
            })
        } catch (error) {
            
            next(error)
        }
       
    }
}

export default new OrderController()