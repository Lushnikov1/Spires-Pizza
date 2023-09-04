import { queries } from "../data/sqlQueries.mjs"
import {connection,beginTransaction,rollback,commit, getPool, connection2, mainPool} from "../pool/pool.mjs"
import { PaymentService } from "./Payment.service.mjs"
import { ingridientsIsAccessed, makeQuery } from "./queryService.mjs"

const createOrder = async (body, userId) => {
    const {
        restaurantId,
        gettingType,
        paymentType,
        time
    } = body

    const payment = (type) => (
        {
            cash: createCashOrder.bind(null, {...body,userId}),
            cart: createCartOrder.bind(null, {...body,userId})
        }
    )[type]

    return await payment(paymentType)()
    
}

const createCartOrder = async (data) =>{
    const{
        restaurantId,
        adress,
        time,
        userId,
    } = data
    try{
         await ingridientsIsAccessed({restaurantId, userId})
         await beginTransaction()
         const res1 = await insertOrder({adress,orderStatus:5,restaurantId,time,userId})

        
         const sum = await insertCooking({userId, orderId: res1.insertId})
         const payment  = await PaymentService.createPayment({orderId: res1.insertId, sum })
         await PaymentService.setIdPayment({orderId: res1.insertId, paymentId: payment.id})
         await commit()
        // await rollback()
         return {
            url: payment.confirmation.confirmation_url,
            orderId: res1.insertId
            // orderId: 
         }
    } catch(err){
        await rollback()
        throw err
    }
}

const createCashOrder = async (data) =>{
    const{
        restaurantId,
        adress,
        time,
        userId,
    } = data
    try{
         await ingridientsIsAccessed({restaurantId, userId})
         await beginTransaction()
         const res1 = await insertOrder({adress,orderStatus:1,restaurantId,time,userId})
        const sum =  await insertCooking({userId, orderId: res1.insertId})
         console.log('Очистка корзины')
         await commit()
         return {
            orderId: res1.insertId
         }
    } catch(err){
        await rollback()
        throw err
    }
   
    // console.log('cash order')
}

const insertOrder = async ({orderStatus,userId,restaurantId, adress, time}) =>{
   const res =  await makeQuery(queries.createOrderSql, 
        [
            orderStatus,
            userId,
            restaurantId,
            adress,
            time
        ]
    )
    return res
}

const insertCooking = async ({userId,orderId}) =>{
    const res = await makeQuery(queries.moveFromCart, [orderId, userId])

    const [{sum}] = await makeQuery(`
        SELECT SUM(price*product_count) as sum FROM cooking WHERE id_order=?
    `, [orderId])
    console.log(sum)
    return sum
}

const getJson = async ()=>{
    const res = await makeQuery("SELECT geojson FROM Restaurants")
    return res.map(elem => JSON.parse(elem.geojson))
}

export const getPolygons = async () => {
    const connection2 = await mainPool.getConnection()
    const [result] = await connection2.query('SELECT id_restaurant, polygon FROM Restaurants ')
    
    console.log(238171927)
    connection2.release()
    return result.map(e => ({
        shopId: e['id_restaurant'],
        polygon: JSON.parse(e['polygon'])
    }))

}



export  {
    createOrder,
    getJson
}