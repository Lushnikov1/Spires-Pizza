import { makeQuery } from "./queryService.mjs";
import crypto from 'crypto'
import {YooCheckout} from '@a2seven/yoo-checkout'
import { mainPool } from "../pool/pool.mjs";

const createIdempotenceKey = (str) =>{
    return crypto.createHash('md5').update(String(str)).digest('hex');
}


export const PaymentService = {
        createPayment: async  ({orderId, sum}) =>{
            const idempotenceKey =  createIdempotenceKey(orderId)
            const createPayload = {
                amount: {
                    value: sum,
                    currency: 'RUB'
                },
                payment_method_data: {
                    type: 'bank_card'
                },
                confirmation: {
                    type: 'redirect',
                    return_url: `http://localhost:3000/order/${orderId}`
                },
                capture: true,
                refundable: true,
            };
            const checkout = new YooCheckout({shopId: 971985, secretKey:"test_LRotL5yXYP49iDUo2k7yGH06DeiwJfh4yb79fd3RosY"})
            const payment = await checkout.createPayment(createPayload, idempotenceKey);
            return payment
        },

        setIdPayment: async ({orderId, paymentId}) =>{
            const res = await makeQuery(`
                UPDATE Orders set Orders.payment_id=?
                WHERE Orders.id_order=?
            `, [paymentId, orderId])
        },
        updatePayments: async () => {
            const connection = await mainPool.getConnection()

            const [result] = await connection.query(
                "SELECT  payment_id  FROM `Orders` WHERE payment_id is not null  AND ready_time IS NULL AND id_orderStatus = 5"
            )
            const checkout = new YooCheckout({shopId: 971985, secretKey:"test_LRotL5yXYP49iDUo2k7yGH06DeiwJfh4yb79fd3RosY"})

            const paymentsArr = result.map(payment => payment.payment_id)

          

            console.log(paymentsArr)

            const r = await Promise.all(  paymentsArr.map(id => {
                return checkout.getPayment(id)
            }))

            const arr = r.filter(e => e.status === 'succeeded').map(e => e.id)

            if (arr.length){
                const [result2] = await connection.query("UPDATE `Orders` SET  id_orderStatus = 1 WHERE Orders.payment_id in (?)",
                [[...arr]])
            }
          
            console.log(arr)

        }


}
